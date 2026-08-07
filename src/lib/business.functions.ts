import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Generic, allowlisted CRUD for the admin business tables.
 * Only the table names and columns listed below can ever be touched.
 */
const TABLE_FIELDS = {
  orders: [
    "product_name",
    "product_type",
    "amount",
    "currency",
    "status",
    "customer_name",
    "customer_email",
    "source",
    "notes",
  ],
  bookings: ["name", "email", "session_type", "scheduled_for", "status", "value", "notes"],
  booking_reminders: ["booking_id", "kind", "channel", "send_at", "subject", "body", "status", "sent_at"],
  business_expenses: ["label", "category", "amount", "spent_on", "notes"],
  business_goals: [
    "title",
    "category",
    "target_value",
    "current_value",
    "unit",
    "due_on",
    "status",
    "notes",
  ],
  team_members: ["name", "email", "role", "permissions", "status", "notes"],
  contracts: [
    "client_id",
    "client_name",
    "title",
    "value",
    "status",
    "starts_on",
    "ends_on",
    "terms",
    "signer_name",
    "signer_email",
    "signature_data",
    "signed_at",
    "signed_ip",
  ],
  proposals: [
    "client_name",
    "client_email",
    "title",
    "summary",
    "scope",
    "deliverables",
    "timeline",
    "price",
    "currency",
    "status",
    "valid_until",
    "notes",
  ],
  invoices: ["client_id", "client_name", "number", "amount", "status", "issued_on", "due_on", "notes"],
  security_findings: ["title", "severity", "category", "status", "source", "remediation"],
  admin_devices: ["label", "fingerprint", "trusted", "last_seen_at"],
  products: [
    "name",
    "slug",
    "category",
    "summary",
    "description",
    "price",
    "currency",
    "image_url",
    "file_url",
    "version",
    "changelog",
    "tags",
    "featured",
    "active",
    "downloads_count",
  ],
  product_bundles: [
    "name",
    "slug",
    "summary",
    "price",
    "currency",
    "discount_label",
    "image_url",
    "product_slugs",
    "active",
  ],
  product_reviews: ["product_slug", "author_name", "author_email", "rating", "body", "approved"],
  product_licenses: [
    "product_slug",
    "license_key",
    "customer_name",
    "customer_email",
    "status",
    "activations",
    "max_activations",
    "expires_on",
    "notes",
  ],
} as const;

export type BusinessTable = keyof typeof TABLE_FIELDS;

const tableSchema = z.enum(
  Object.keys(TABLE_FIELDS) as [BusinessTable, ...BusinessTable[]],
);

const valueSchema = z.union([
  z.string().max(400000),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.string().max(200)).max(50),
]);

async function adminDb(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
  return context.supabase;
}

function sanitize(table: BusinessTable, payload: Record<string, unknown>) {
  const allowed = TABLE_FIELDS[table] as readonly string[];
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    const isDateish = k.endsWith("_on") || k.endsWith("_at") || k.endsWith("_until");
    if (allowed.includes(k)) out[k] = v === "" && isDateish ? null : v;
  }
  return out;
}

export const listRows = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        table: tableSchema,
        orderBy: z.string().trim().max(40).default("created_at"),
        limit: z.number().int().min(1).max(1000).default(300),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { data: rows, error } = await db
      .from(data.table)
      .select("*")
      .order(data.orderBy, { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const upsertRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        table: tableSchema,
        id: z.string().uuid().nullable().default(null),
        values: z.record(valueSchema),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const values = sanitize(data.table, data.values);
    if (data.id) {
      const { error } = await db.from(data.table).update(values).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await db.from(data.table).insert(values).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row?.id as string };
  });

export const deleteRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ table: tableSchema, id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { error } = await db.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Read-only feeds: login history and audit trail for the security center. */
export const listLoginHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminDb(context);
    const { data, error } = await db
      .from("admin_login_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

/** Records the current admin session's device so device management is real. */
export const registerAdminDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        label: z.string().trim().max(160).default("This device"),
        fingerprint: z.string().trim().max(200).default(""),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { data: existing } = await db
      .from("admin_devices")
      .select("id")
      .eq("fingerprint", data.fingerprint)
      .maybeSingle();
    if (existing?.id) {
      await db.from("admin_devices").update({ last_seen_at: new Date().toISOString() }).eq("id", existing.id);
      return { ok: true, id: existing.id as string };
    }
    const { data: row, error } = await db
      .from("admin_devices")
      .insert({ label: data.label, fingerprint: data.fingerprint, trusted: false })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row?.id as string };
  });

/** Logs a sign-in outcome with approximate location, for login history. */
export const recordLoginAttempt = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        identifier: z.string().trim().max(160).default(""),
        outcome: z.enum(["success", "failed", "locked", "mfa_required"]).default("success"),
        device: z.string().trim().max(60).default(""),
        browser: z.string().trim().max(60).default(""),
        os: z.string().trim().max(60).default(""),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const country = getRequestHeader("cf-ipcountry") ?? "";
    const city = getRequestHeader("cf-ipcity") ?? "";
    await supabaseAdmin.from("admin_login_history").insert({
      identifier: data.identifier,
      outcome: data.outcome,
      ip: getRequestIP({ xForwardedFor: true }) ?? "",
      device: data.device,
      browser: data.browser,
      os: data.os,
      location_label: [city, country].filter(Boolean).join(", "),
    });
    return { ok: true };
  });
