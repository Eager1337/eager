/**
 * Server-only. Resolves the backing Supabase owner account that the admin
 * login signs into after the username + password (and optional MFA) check out.
 *
 * Why this exists: OWNER_ACCOUNT_EMAIL / OWNER_ACCOUNT_PASSWORD are injected
 * by Lovable and cannot be exported, so a Vercel deployment that only sets the
 * SUPABASE_* variables would otherwise fail every admin sign-in with "missing
 * environment variables". Resolution order:
 *
 *   1. OWNER_ACCOUNT_EMAIL + OWNER_ACCOUNT_PASSWORD env vars (explicit pin)
 *   2. account_email + account_password stored in admin_credentials (id global)
 *   3. Provision a fresh random account once: create it with the service role,
 *      grant the admin role, persist the credentials for subsequent sign-ins.
 *
 * The stored credentials are only readable by service-role code and signed-in
 * admins (RLS on admin_credentials), and the session they produce is handed to
 * the admin anyway — the security boundary is the username + password + MFA
 * check that happens before this runs.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type SupabaseAdminClient = SupabaseClient<Database>;

export type OwnerAccountResult =
  { ok: true; email: string; password: string } | { ok: false; error: string };

function randomHex(byteCount: number): string {
  const bytes = new Uint8Array(byteCount);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomPassword(): string {
  // 30 random bytes -> 40-char base64 string, comfortably above Supabase's
  // minimum and unguessable. Generated credentials are never shown anywhere.
  const bytes = new Uint8Array(30);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

async function ensureAdminRole(
  supabaseAdmin: SupabaseAdminClient,
  userId: string,
): Promise<string | null> {
  const { data: hasRole } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (hasRole) return null;
  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: userId, role: "admin" })
    .select();
  if (roleError) {
    return `Owner account exists, but the admin role could not be assigned: ${roleError.message}`;
  }
  return null;
}

export async function resolveOwnerAccount(
  supabaseAdmin: SupabaseAdminClient,
): Promise<OwnerAccountResult> {
  // 1. Explicit environment override.
  const envEmail = (process.env.OWNER_ACCOUNT_EMAIL ?? "").trim();
  const envPassword = process.env.OWNER_ACCOUNT_PASSWORD ?? "";
  if (envEmail && envPassword) return { ok: true, email: envEmail, password: envPassword };

  // 2. Previously provisioned account stored in the database.
  const { data: stored } = await supabaseAdmin
    .from("admin_credentials")
    .select("account_email, account_password")
    .eq("id", "global")
    .maybeSingle();
  const storedEmail = typeof stored?.account_email === "string" ? stored.account_email : "";
  const storedPassword =
    typeof stored?.account_password === "string" ? stored.account_password : "";
  if (storedEmail && storedPassword) {
    return { ok: true, email: storedEmail, password: storedPassword };
  }

  // 3. Provision a new backing account once.
  const email = `owner-${randomHex(8)}@eager.app`;
  const password = randomPassword();

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  let ownerId = created?.user?.id ?? null;
  if (!ownerId) {
    // The generated address is random, so a collision is virtually impossible —
    // but if the credentials row was lost while the account survived, adopt it.
    const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listError) {
      return {
        ok: false,
        error: `Could not access the Supabase owner account: ${listError.message}`,
      };
    }
    const found = list?.users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (found) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(found.id, {
        password,
        email_confirm: true,
      });
      if (updateError) {
        return {
          ok: false,
          error: `Supabase found the owner account but could not update its password: ${updateError.message}`,
        };
      }
      ownerId = found.id;
    } else if (createError) {
      return {
        ok: false,
        error: `Could not create the backing owner account: ${createError.message}`,
      };
    }
  }

  if (!ownerId) {
    return {
      ok: false,
      error: "Could not establish a backing owner account. Check the Supabase service-role key.",
    };
  }

  const roleError = await ensureAdminRole(supabaseAdmin, ownerId);
  if (roleError) return { ok: false, error: roleError };

  // Persist so every future sign-in (and every serverless instance) reuses the
  // same account instead of provisioning a new one.
  const { error: persistError } = await supabaseAdmin
    .from("admin_credentials")
    .upsert({ id: "global", account_email: email, account_password: password })
    .select();
  if (persistError) {
    return {
      ok: false,
      error: `The owner account was created but its credentials could not be stored: ${persistError.message}`,
    };
  }

  return { ok: true, email, password };
}
