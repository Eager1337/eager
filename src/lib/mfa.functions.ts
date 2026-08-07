import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function adminDb(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
  return context.supabase;
}

/* ---------------- 2FA (authenticator app) ---------------- */

export const getMfaState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminDb(context);
    const [{ data: totp }, { data: keys }, { data: alerts }, { data: settings }] = await Promise.all([
      db.from("admin_totp").select("enabled, confirmed_at, recovery_codes").eq("id", "global").maybeSingle(),
      db.from("admin_passkeys").select("id, label, created_at, last_used_at, algorithm").order("created_at", { ascending: false }),
      db.from("login_alerts").select("*").order("created_at", { ascending: false }).limit(100),
      db.from("admin_alert_settings").select("*").eq("id", "global").maybeSingle(),
    ]);
    return {
      totp: {
        enabled: Boolean(totp?.enabled),
        confirmedAt: (totp?.confirmed_at as string | null) ?? null,
        recoveryCount: ((totp?.recovery_codes as string[] | null) ?? []).length,
      },
      passkeys: keys ?? [],
      alerts: alerts ?? [],
      settings: settings ?? null,
    };
  });

/** Creates a fresh secret and returns the enrolment URI. Not enabled until confirmed. */
export const beginTotpEnrolment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminDb(context);
    const { randomBase32Secret, otpAuthUri } = await import("./webauthn.server");
    const secret = randomBase32Secret(32);
    const account = (process.env["OWNER_ACCOUNT_EMAIL"] ?? "owner").trim() || "owner";
    const { error } = await db
      .from("admin_totp")
      .update({ secret, enabled: false, confirmed_at: null })
      .eq("id", "global");
    if (error) throw new Error(error.message);
    return { secret, uri: otpAuthUri(secret, account) };
  });

export const confirmTotpEnrolment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ code: z.string().trim().max(10) }).parse(d))
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { verifyTotp } = await import("./webauthn.server");
    const { data: row } = await db.from("admin_totp").select("secret").eq("id", "global").maybeSingle();
    const secret = (row?.secret as string | undefined) ?? "";
    if (!(await verifyTotp(secret, data.code))) throw new Error("That code did not match. Try the next one.");

    const codes = Array.from({ length: 8 }, () =>
      Array.from(crypto.getRandomValues(new Uint8Array(5)))
        .map((b) => b.toString(36).padStart(2, "0"))
        .join("")
        .slice(0, 10)
        .toUpperCase(),
    );
    const { error } = await db
      .from("admin_totp")
      .update({ enabled: true, confirmed_at: new Date().toISOString(), recovery_codes: codes })
      .eq("id", "global");
    if (error) throw new Error(error.message);
    return { ok: true, recoveryCodes: codes };
  });

export const disableTotp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminDb(context);
    const { error } = await db
      .from("admin_totp")
      .update({ enabled: false, secret: "", confirmed_at: null, recovery_codes: [] })
      .eq("id", "global");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- Passkeys ---------------- */

/** Stateless, signed challenge so no server memory is needed between requests. */
export const getPasskeyChallenge = createServerFn({ method: "GET" }).handler(async () => {
  const { createChallenge } = await import("./challenge.server");
  return { challenge: await createChallenge() };
});

export const registerPasskey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        label: z.string().trim().min(1).max(80).default("Passkey"),
        attestationObject: z.string().max(20000),
        clientDataJSON: z.string().max(8000),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { parseAttestationObject, b64uToBytes } = await import("./webauthn.server");
    const { verifyChallenge } = await import("./challenge.server");

    const clientData = JSON.parse(new TextDecoder().decode(b64uToBytes(data.clientDataJSON))) as {
      type?: string;
      challenge?: string;
    };
    if (clientData.type !== "webauthn.create") throw new Error("Unexpected passkey ceremony.");
    if (!(await verifyChallenge(clientData.challenge ?? ""))) throw new Error("Passkey challenge expired.");

    const parsed = parseAttestationObject(data.attestationObject);
    const { error } = await db.from("admin_passkeys").insert({
      label: data.label,
      credential_id: parsed.credentialId,
      public_key: parsed.publicKey,
      algorithm: parsed.algorithm,
      sign_count: parsed.signCount,
    });
    if (error) throw new Error(error.message);
    await db.from("login_alerts").insert({
      event: "passkey_registered",
      detail: `New passkey registered: ${data.label}`,
      severity: "info",
    });
    return { ok: true };
  });

export const deletePasskey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { error } = await db.from("admin_passkeys").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- Login alerts ---------------- */

export const saveAlertSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        email: z.string().trim().max(200).default(""),
        alert_on_success: z.boolean().default(true),
        alert_on_failure: z.boolean().default(true),
        alert_on_new_device: z.boolean().default(true),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { error } = await db.from("admin_alert_settings").update(data).eq("id", "global");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const acknowledgeAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { error } = await db.from("login_alerts").update({ acknowledged: true }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
