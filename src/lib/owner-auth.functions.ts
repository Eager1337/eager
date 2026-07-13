import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

/**
 * Owner login.
 *
 * The visitor types a username + password in the admin panel. Those credentials
 * are verified here on the server against secret env values, the real Supabase
 * owner account (and its strong password) never ship to the browser.
 *
 * On success we ensure the owner account exists (creating it with the service
 * role the first time), make sure it holds the admin role, then sign in with the
 * strong account password and return the session tokens for the browser to
 * persist via supabase.auth.setSession().
 */
export const ownerLogin = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      username: z.string().max(200),
      password: z.string().max(500),
    }),
  )
  .handler(async ({ data }) => {
    const expectedUser = (process.env.OWNER_LOGIN_USERNAME ?? "").trim();
    const accepted = (process.env.OWNER_LOGIN_PASSWORDS ?? "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const ownerEmail = (process.env.OWNER_ACCOUNT_EMAIL ?? "").trim();
    const ownerPassword = process.env.OWNER_ACCOUNT_PASSWORD ?? "";

    const userOk =
      expectedUser.length > 0 &&
      data.username.trim().toLowerCase() === expectedUser.toLowerCase();
    const passOk = accepted.includes(data.password);

    // Generic failure, never reveal which field was wrong.
    if (!userOk || !passOk) {
      return { ok: false as const };
    }

    if (!ownerEmail || !ownerPassword) {
      return { ok: false as const, error: "Owner account is not configured." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Ensure the owner auth account exists (idempotent).
    let ownerId: string | null = null;
    try {
      const created = await supabaseAdmin.auth.admin.createUser({
        email: ownerEmail,
        password: ownerPassword,
        email_confirm: true,
      });
      if (created.data.user) ownerId = created.data.user.id;
      // If it already exists, createUser errors, fall through and look it up.
    } catch {
      /* already exists */
    }

    if (!ownerId) {
      // Look up existing account and make sure its password matches our secret.
      const { data: list } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      const found = list?.users.find(
        (u) => (u.email ?? "").toLowerCase() === ownerEmail.toLowerCase(),
      );
      if (found) {
        ownerId = found.id;
        await supabaseAdmin.auth.admin.updateUserById(found.id, {
          password: ownerPassword,
          email_confirm: true,
        });
      }
    }

    if (!ownerId) {
      return { ok: false as const, error: "Could not establish owner account." };
    }

    // Ensure the owner holds the admin role.
    const { data: hasRole } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", ownerId)
      .eq("role", "admin")
      .maybeSingle();
    if (!hasRole) {
      await supabaseAdmin.from("user_roles").insert({ user_id: ownerId, role: "admin" });
    }

    // Sign in with the strong account password to mint a session for the browser.
    const anon = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: signIn, error } = await anon.auth.signInWithPassword({
      email: ownerEmail,
      password: ownerPassword,
    });
    if (error || !signIn.session) {
      return { ok: false as const, error: "Sign-in failed. Please try again." };
    }

    return {
      ok: true as const,
      access_token: signIn.session.access_token,
      refresh_token: signIn.session.refresh_token,
    };
  });
