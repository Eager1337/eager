import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

/**
 * Owner login.
 *
 * The visitor types a username + password in the admin panel. Those credentials
 * are verified here on the server. The real Supabase owner account never ships
 * to the browser.
 */
export const ownerLogin = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      username: z.string().max(200),
      password: z.string().max(500),
      code: z.string().trim().max(20).optional().default(""),
    }),
  )
  .handler(async ({ data }) => {
    const expectedUser = (process.env.OWNER_LOGIN_USERNAME ?? "").trim();
    const accepted = (process.env.OWNER_LOGIN_PASSWORDS ?? "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const infraMissing = [
      ...(process.env.SUPABASE_URL ? [] : ["SUPABASE_URL"]),
      ...(process.env.SUPABASE_PUBLISHABLE_KEY ? [] : ["SUPABASE_PUBLISHABLE_KEY"]),
      ...(process.env.SUPABASE_SERVICE_ROLE_KEY ? [] : ["SUPABASE_SERVICE_ROLE_KEY"]),
    ];
    if (infraMissing.length > 0) {
      return {
        ok: false as const,
        error: `Admin sign-in is not configured on this deployment. Missing: ${infraMissing.join(", ")}.`,
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Credentials changed from the dashboard take priority over env values.
    const { data: stored } = await supabaseAdmin
      .from("admin_credentials")
      .select("username, password_hash, salt")
      .eq("id", "global")
      .maybeSingle();
    const hasStored = Boolean(stored?.username && stored?.password_hash);

    const missing = hasStored
      ? []
      : [
          ...(expectedUser ? [] : ["OWNER_LOGIN_USERNAME"]),
          ...(accepted.length ? [] : ["OWNER_LOGIN_PASSWORDS"]),
        ];
    if (missing.length > 0) {
      return {
        ok: false as const,
        error: `Admin sign-in is not configured on this deployment. Missing: ${missing.join(", ")}.`,
      };
    }

    let userOk: boolean;
    let passOk: boolean;
    if (stored?.username && stored?.password_hash) {
      const { verifyPassword } = await import("./credentials.server");
      userOk = data.username.trim().toLowerCase() === String(stored.username).trim().toLowerCase();
      passOk = await verifyPassword(data.password, String(stored.salt ?? ""), String(stored.password_hash));
    } else {
      userOk =
        expectedUser.length > 0 &&
        data.username.trim().toLowerCase() === expectedUser.toLowerCase();
      passOk = accepted.includes(data.password);
    }

    if (!userOk || !passOk) return { ok: false as const };

    const { data: totp } = await supabaseAdmin
      .from("admin_totp")
      .select("secret, enabled, recovery_codes")
      .eq("id", "global")
      .maybeSingle();
    if (totp?.enabled) {
      const { verifyTotp } = await import("./webauthn.server");
      const supplied = (data.code ?? "").trim().toUpperCase();
      if (!supplied) return { ok: false as const, mfaRequired: true as const };
      const recovery = (totp.recovery_codes as string[] | null) ?? [];
      const usedRecovery = recovery.includes(supplied);
      const codeOk = usedRecovery || (await verifyTotp(String(totp.secret ?? ""), supplied));
      if (!codeOk) {
        await supabaseAdmin.from("login_alerts").insert({
          event: "mfa_failed",
          identifier: data.username,
          detail: "A sign-in attempt supplied an invalid second factor.",
          severity: "warning",
        });
        return { ok: false as const, mfaRequired: true as const, codeInvalid: true as const };
      }
      if (usedRecovery) {
        await supabaseAdmin
          .from("admin_totp")
          .update({ recovery_codes: recovery.filter((c) => c !== supplied) })
          .eq("id", "global");
      }
    }

    // Resolve the backing owner account: env vars first, then the database,
    // then provision one automatically. See owner-account.server.ts.
    const { resolveOwnerAccount } = await import("./owner-account.server");
    const owner = await resolveOwnerAccount(supabaseAdmin);
    if (!owner.ok) return { ok: false as const, error: owner.error };

    const anon = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: signIn, error } = await anon.auth.signInWithPassword({
      email: owner.email,
      password: owner.password,
    });
    if (error || !signIn.session) {
      return {
        ok: false as const,
        error: error?.message
          ? `Supabase authentication failed: ${error.message}`
          : "Supabase authentication failed. Check the Supabase configuration on this deployment.",
      };
    }

    await supabaseAdmin.from("login_alerts").insert({
      event: "admin_signin",
      identifier: data.username,
      detail: "Admin signed in with username and password.",
      severity: "info",
    });

    return {
      ok: true as const,
      access_token: signIn.session.access_token,
      refresh_token: signIn.session.refresh_token,
    };
  });

export const passkeyLogin = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      credentialId: z.string().max(500),
      clientDataJSON: z.string().max(8000),
      authenticatorData: z.string().max(8000),
      signature: z.string().max(8000),
      origin: z.string().max(300),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyAssertion, b64uToBytes } = await import("./webauthn.server");
    const { verifyChallenge } = await import("./challenge.server");

    const { data: cred } = await supabaseAdmin
      .from("admin_passkeys")
      .select("id, public_key, algorithm, label")
      .eq("credential_id", data.credentialId)
      .maybeSingle();
    if (!cred) return { ok: false as const, error: "This passkey is not registered." };

    let clientChallenge = "";
    try {
      clientChallenge =
        (JSON.parse(new TextDecoder().decode(b64uToBytes(data.clientDataJSON))) as { challenge?: string })
          .challenge ?? "";
    } catch {
      return { ok: false as const, error: "Malformed passkey response." };
    }
    if (!(await verifyChallenge(clientChallenge))) {
      return { ok: false as const, error: "Passkey challenge expired. Try again." };
    }

    try {
      const { signCount } = await verifyAssertion({
        publicKey: String(cred.public_key),
        algorithm: Number(cred.algorithm),
        clientDataJSON: data.clientDataJSON,
        authenticatorData: data.authenticatorData,
        signature: data.signature,
        expectedChallenge: clientChallenge,
        expectedOrigin: data.origin,
      });
      await supabaseAdmin
        .from("admin_passkeys")
        .update({ sign_count: signCount, last_used_at: new Date().toISOString() })
        .eq("id", cred.id);
    } catch (err) {
      await supabaseAdmin.from("login_alerts").insert({
        event: "passkey_failed",
        detail: err instanceof Error ? err.message : "Passkey verification failed.",
        severity: "critical",
      });
      return { ok: false as const, error: "Passkey verification failed." };
    }

    const anon = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { resolveOwnerAccount } = await import("./owner-account.server");
    const owner = await resolveOwnerAccount(supabaseAdmin);
    if (!owner.ok) return { ok: false as const, error: owner.error };
    const { data: signIn, error } = await anon.auth.signInWithPassword({
      email: owner.email,
      password: owner.password,
    });
    if (error || !signIn.session) return { ok: false as const, error: "Sign-in failed. Please try again." };

    await supabaseAdmin.from("login_alerts").insert({
      event: "passkey_signin",
      detail: `Admin signed in with passkey: ${String(cred.label)}`,
      severity: "info",
    });

    return {
      ok: true as const,
      access_token: signIn.session.access_token,
      refresh_token: signIn.session.refresh_token,
    };
  });
