import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ---------------- Config ---------------- */

const DEFAULT_MAX_FAILS = 5;
const DEFAULT_LOCK_MINUTES = 15;

function clientIdentifier(fallback: string): string {
  const ip = getRequestIP({ xForwardedFor: true });
  return (ip && ip.trim()) || fallback || "unknown";
}

// Read the owner-tuned brute-force settings (falls back to defaults).
async function readSecurityConfig(admin: {
  from: (t: string) => any;
}): Promise<{ maxFails: number; lockMinutes: number }> {
  try {
    const { data } = await admin
      .from("security_settings")
      .select("max_fails, lock_minutes")
      .eq("id", "global")
      .maybeSingle();
    return {
      maxFails: data?.max_fails ?? DEFAULT_MAX_FAILS,
      lockMinutes: data?.lock_minutes ?? DEFAULT_LOCK_MINUTES,
    };
  } catch {
    return { maxFails: DEFAULT_MAX_FAILS, lockMinutes: DEFAULT_LOCK_MINUTES };
  }
}

/* ---------------- Audit log helper (service role) ---------------- */

async function writeAudit(
  admin: { from: (t: string) => any },
  adminEmail: string,
  action: string,
  targetId: string | null,
  details: string | null,
) {
  try {
    await admin.from("admin_audit_log").insert({
      admin_email: adminEmail || "",
      action,
      target_id: targetId,
      details,
    });
  } catch {
    /* never let audit logging break the action */
  }
}

/* ---------------- Intruder logging (public) ---------------- */

export const logIntruder = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      reason: z.string().max(200),
      usernameTried: z.string().max(200),
      photo: z.string().max(4_000_000).nullable(),
      userAgent: z.string().max(1000).default(""),
      language: z.string().max(100).default(""),
      platform: z.string().max(200).default(""),
      screen: z.string().max(50).default(""),
      timezone: z.string().max(100).default(""),
      deviceId: z.string().max(100).default(""),
      latitude: z.number().nullable().default(null),
      longitude: z.number().nullable().default(null),
      accuracy: z.number().nullable().default(null),
      locationLabel: z.string().max(300).default(""),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = clientIdentifier(data.deviceId);
    const { data: inserted, error } = await supabaseAdmin
      .from("intruder_events")
      .insert({
        reason: data.reason,
        username_tried: data.usernameTried,
        photo: data.photo,
        ip,
        user_agent: data.userAgent,
        language: data.language,
        platform: data.platform,
        screen: data.screen,
        timezone: data.timezone,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        location_label: data.locationLabel || null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: inserted?.id ?? null };
  });

/* ---------------- Brute-force lockout (public) ---------------- */

export const checkAdminLockout = createServerFn({ method: "POST" })
  .inputValidator(z.object({ deviceId: z.string().max(100).default("") }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { maxFails } = await readSecurityConfig(supabaseAdmin);
    const identifier = clientIdentifier(data.deviceId);
    const { data: row } = await supabaseAdmin
      .from("admin_login_attempts")
      .select("fail_count, locked_until")
      .eq("identifier", identifier)
      .maybeSingle();

    const now = Date.now();
    const lockedUntil = row?.locked_until ? new Date(row.locked_until).getTime() : 0;
    if (lockedUntil > now) {
      return {
        locked: true,
        lockedUntil: new Date(lockedUntil).toISOString(),
        secondsLeft: Math.ceil((lockedUntil - now) / 1000),
        attemptsRemaining: 0,
        maxFails,
      };
    }
    return {
      locked: false,
      lockedUntil: null,
      secondsLeft: 0,
      attemptsRemaining: Math.max(0, maxFails - (row?.fail_count ?? 0)),
      maxFails,
    };
  });

export const recordAdminFailure = createServerFn({ method: "POST" })
  .inputValidator(z.object({ deviceId: z.string().max(100).default("") }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { maxFails, lockMinutes } = await readSecurityConfig(supabaseAdmin);
    const identifier = clientIdentifier(data.deviceId);
    const now = Date.now();

    const { data: row } = await supabaseAdmin
      .from("admin_login_attempts")
      .select("fail_count, locked_until")
      .eq("identifier", identifier)
      .maybeSingle();

    const lockedUntil = row?.locked_until ? new Date(row.locked_until).getTime() : 0;
    if (lockedUntil > now) {
      return {
        locked: true,
        lockedUntil: new Date(lockedUntil).toISOString(),
        secondsLeft: Math.ceil((lockedUntil - now) / 1000),
        attemptsRemaining: 0,
        maxFails,
      };
    }

    const newCount = (row?.fail_count ?? 0) + 1;
    const shouldLock = newCount >= maxFails;
    const nextLockedUntil = shouldLock ? new Date(now + lockMinutes * 60_000) : null;

    await supabaseAdmin.from("admin_login_attempts").upsert(
      {
        identifier,
        fail_count: shouldLock ? 0 : newCount,
        locked_until: nextLockedUntil ? nextLockedUntil.toISOString() : null,
        updated_at: new Date(now).toISOString(),
      },
      { onConflict: "identifier" },
    );

    return {
      locked: shouldLock,
      lockedUntil: nextLockedUntil ? nextLockedUntil.toISOString() : null,
      secondsLeft: shouldLock ? lockMinutes * 60 : 0,
      attemptsRemaining: Math.max(0, maxFails - newCount),
      maxFails,
    };
  });

export const clearAdminFailures = createServerFn({ method: "POST" })
  .inputValidator(z.object({ deviceId: z.string().max(100).default("") }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const identifier = clientIdentifier(data.deviceId);
    await supabaseAdmin.from("admin_login_attempts").delete().eq("identifier", identifier);
    return { ok: true };
  });

/* ---------------- Admin role (authenticated) ---------------- */

export const claimAdminIfUnclaimed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if ((count ?? 0) === 0) {
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: context.userId, role: "admin" });
      return { claimed: true, isAdmin: true };
    }

    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { claimed: false, isAdmin: Boolean(isAdmin) };
  });

export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(isAdmin) };
  });

/* ---------------- Intruder review (admin only) ---------------- */

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

function adminEmail(context: { claims: any }): string {
  return (context.claims?.email as string | undefined) ?? "";
}

export const listIntruders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("intruder_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await writeAudit(
      supabaseAdmin,
      adminEmail(context),
      "viewed_intruders",
      null,
      `Viewed ${data?.length ?? 0} intruder capture(s)`,
    );
    return { records: data ?? [] };
  });

export const deleteIntruderRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("intruder_events")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await writeAudit(supabaseAdmin, adminEmail(context), "deleted_intruder", data.id, "Deleted a single capture");
    return { ok: true };
  });

export const clearAllIntruders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("intruder_events")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw new Error(error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await writeAudit(supabaseAdmin, adminEmail(context), "cleared_all_intruders", null, "Cleared all captures");
    return { ok: true };
  });

/* ---------------- Audit log (admin only) ---------------- */

export const listAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return { records: data ?? [] };
  });

/* ---------------- Configurable security settings (admin only) ---------------- */

export const getSecuritySettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("security_settings")
      .select("max_fails, lock_minutes, updated_at")
      .eq("id", "global")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      maxFails: data?.max_fails ?? DEFAULT_MAX_FAILS,
      lockMinutes: data?.lock_minutes ?? DEFAULT_LOCK_MINUTES,
      updatedAt: data?.updated_at ?? null,
    };
  });

export const updateSecuritySettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      maxFails: z.number().int().min(1).max(20),
      lockMinutes: z.number().int().min(1).max(1440),
    }),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("security_settings")
      .update({
        max_fails: data.maxFails,
        lock_minutes: data.lockMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "global");
    if (error) throw new Error(error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await writeAudit(
      supabaseAdmin,
      adminEmail(context),
      "updated_security_settings",
      null,
      `Max attempts ${data.maxFails}, lockout ${data.lockMinutes}m`,
    );
    return { ok: true };
  });

/* ---------------- Privacy settings (admin only) ---------------- */

// Daily cron runs at 03:00 UTC, compute the next occurrence.
function nextPurgeAtISO(): string {
  const now = new Date();
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 3, 0, 0, 0),
  );
  if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString();
}

export const getPrivacySettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("privacy_settings")
      .select("retention_days, auto_delete, updated_at, last_cleanup_at, last_cleanup_count, last_cleanup_ok")
      .eq("id", "global")
      .maybeSingle();
    if (error) throw new Error(error.message);
    const autoDelete = data?.auto_delete ?? false;
    const retentionDays = data?.retention_days ?? 0;
    return {
      retentionDays,
      autoDelete,
      updatedAt: data?.updated_at ?? null,
      lastCleanupAt: data?.last_cleanup_at ?? null,
      lastCleanupCount: data?.last_cleanup_count ?? null,
      lastCleanupOk: data?.last_cleanup_ok ?? null,
      nextPurgeAt: autoDelete && retentionDays > 0 ? nextPurgeAtISO() : null,
    };
  });

export const updatePrivacySettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      retentionDays: z.number().int().min(0).max(3650),
      autoDelete: z.boolean(),
    }),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("privacy_settings")
      .update({
        retention_days: data.retentionDays,
        auto_delete: data.autoDelete,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "global");
    if (error) throw new Error(error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await writeAudit(
      supabaseAdmin,
      adminEmail(context),
      "updated_privacy_settings",
      null,
      `Auto-delete ${data.autoDelete ? "on" : "off"}, retention ${data.retentionDays}d`,
    );
    return { ok: true };
  });

export const purgeExpiredNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: settings } = await supabaseAdmin
      .from("privacy_settings")
      .select("retention_days")
      .eq("id", "global")
      .maybeSingle();
    const days = settings?.retention_days ?? 0;
    if (days <= 0) {
      await writeAudit(supabaseAdmin, adminEmail(context), "purged_expired", null, "Purge skipped, no retention set");
      return { deleted: 0, retentionDays: 0 };
    }
    const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
    const { data, error } = await supabaseAdmin
      .from("intruder_events")
      .delete()
      .lt("created_at", cutoff)
      .select("id");
    if (error) throw new Error(error.message);
    const deleted = data?.length ?? 0;
    await supabaseAdmin
      .from("privacy_settings")
      .update({
        last_cleanup_at: new Date().toISOString(),
        last_cleanup_count: deleted,
        last_cleanup_ok: true,
      })
      .eq("id", "global");
    await writeAudit(
      supabaseAdmin,
      adminEmail(context),
      "purged_expired",
      null,
      `Manually purged ${deleted} capture(s) older than ${days}d`,
    );
    return { deleted, retentionDays: days };
  });
