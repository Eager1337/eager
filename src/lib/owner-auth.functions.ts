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
      code: z.string().trim().max(20).optional().default(""),
    }),
  )
  .handler(async ({ data }) => {
    // No credentials live in the codebase. Every value below is read from the
    // host environment at request time, so Lovable and Vercel behave the same
    // as long as both carry the same variables (see .env.example).
    const expectedUser = (process.env.OWNER_LOGIN_USERNAME ?? "").trim();
    const accepted = (process.env.OWNER_LOGIN_PASSWORDS ?? "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const ownerEmail = (process.env.OWNER_ACCOUNT_EMAIL ?? "").trim();
    const ownerPassword = process.env.OWNER_ACCOUNT_PASSWORD ?? "";

    const missing = [
      ...(expectedUser ? [] : ["OWNER_LOGIN_USERNAME"]),
      ...(accepted.length ? [] : ["OWNER_LOGIN_PASSWORDS"]),
      ...(ownerEmail ? [] : ["OWNER_ACCOUNT_EMAIL"]),
      ...(ownerPassword ? [] : ["OWNER_ACCOUNT_PASSWORD"]),
      ...(process.env.SUPABASE_URL ? [] : ["SUPABASE_URL"]),
      ...(process.env.SUPABASE_PUBLISHABLE_KEY ? [] : ["SUPABASE_PUBLISHABLE_KEY"]),
      ...(process.env.SUPABASE_SERVICE_ROLE_KEY ? [] : ["SUPABASE_SERVICE_ROLE_KEY"]),
    ];
    if (missing.length > 0) {
      return {
        ok: false as const,
        error: `Admin sign-in is not configured on this deployment. Missing: ${missing.join(", ")}.`,
      };
    }

    const userOk =
      expectedUser.length > 0 &&
      data.username.trim().toLowerCase() === expectedUser.toLowerCase();
    const passOk = accepted.includes(data.password);

    // Generic failure, never reveal which field was wrong.
    if (!userOk || !passOk) {
      return { ok: false as const };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Second factor: if an authenticator is enrolled, a valid code is required.
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

/**
 * Passkey sign-in. The browser runs a WebAuthn assertion against a stateless
 * challenge, the signature is verified here, and only then is a session minted.
 */
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
    const ownerEmail = (process.env.OWNER_ACCOUNT_EMAIL ?? "").trim();
    const ownerPassword = process.env.OWNER_ACCOUNT_PASSWORD ?? "";
    if (!ownerEmail || !ownerPassword) {
      return { ok: false as const, error: "Passkey sign-in is not configured on this deployment." };
    }

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
    const { data: signIn, error } = await anon.auth.signInWithPassword({
      email: ownerEmail,
      password: ownerPassword,
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
