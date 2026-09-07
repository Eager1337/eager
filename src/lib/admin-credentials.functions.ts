import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

/** Which sign-in name is currently in force, and where it comes from. */
export const getAdminCredentialState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase
      .from("admin_credentials")
      .select("username, updated_at, password_hash")
      .eq("id", "global")
      .maybeSingle();
    const custom = Boolean(data?.username && data?.password_hash);
    return {
      username: custom ? String(data!.username) : (process.env["OWNER_LOGIN_USERNAME"] ?? ""),
      source: custom ? ("dashboard" as const) : ("environment" as const),
      updatedAt: data?.updated_at ?? null,
    };
  });

/** Change the dashboard sign-in username and password. Stored hashed. */
export const updateAdminCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        username: z
          .string()
          .trim()
          .min(3, "Username needs at least 3 characters.")
          .max(80),
        password: z.string().min(8, "Password needs at least 8 characters.").max(200),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { hashPassword } = await import("./credentials.server");
    const { salt, hash } = await hashPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("admin_credentials").upsert({
      id: "global",
      username: data.username,
      password_hash: hash,
      salt,
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("login_alerts").insert({
      event: "credentials_changed",
      identifier: data.username,
      detail: "The dashboard sign-in username and password were changed.",
      severity: "warning",
    });
    return { ok: true as const, username: data.username };
  });

/** Fall back to the environment credentials again. */
export const resetAdminCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("admin_credentials").delete().eq("id", "global");
    return { ok: true as const };
  });
