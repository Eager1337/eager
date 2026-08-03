import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
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

const rangeSchema = z.object({
  from: z.string().trim().max(40).default(""),
  to: z.string().trim().max(40).default(""),
});

/** Everything the business intelligence dashboard needs, in one round trip. */
export const analyticsSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => rangeSchema.parse(d ?? {}))
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const from = data.from || new Date(Date.now() - 365 * 864e5).toISOString();
    const to = data.to || new Date(Date.now() + 864e5).toISOString();

    const visitsQ = db
      .from("site_visits")
      .select(
        "id, session_id, path, referrer, device, browser, os, language, timezone, screen, is_returning, country, region, city, duration_seconds, is_bounce, created_at",
      )
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: false })
      .limit(5000);

    const ordersQ = db
      .from("orders")
      .select("id, product_name, product_type, amount, currency, status, customer_name, customer_email, source, created_at")
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: false })
      .limit(2000);

    const downloadsQ = db
      .from("product_downloads")
      .select("id, product_name, product_type, session_id, referrer, country, created_at")
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: false })
      .limit(2000);

    const bookingsQ = db
      .from("bookings")
      .select("id, name, email, session_type, scheduled_for, status, value, created_at")
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: false })
      .limit(1000);

    const clientsQ = db
      .from("clients")
      .select("id, name, status, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);

    const expensesQ = db
      .from("business_expenses")
      .select("id, label, category, amount, spent_on")
      .order("spent_on", { ascending: false })
      .limit(1000);

    const leadsQ = db
      .from("leads")
      .select("id, email, source, created_at")
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: false })
      .limit(2000);

    const [visits, orders, downloads, bookings, clients, expenses, leads] = await Promise.all([
      visitsQ,
      ordersQ,
      downloadsQ,
      bookingsQ,
      clientsQ,
      expensesQ,
      leadsQ,
    ]);

    const liveSince = new Date(Date.now() - 5 * 60_000).toISOString();
    const live = await db
      .from("site_visits")
      .select("session_id")
      .gte("created_at", liveSince)
      .limit(500);

    const liveSessions = new Set((live.data ?? []).map((r: { session_id: string }) => r.session_id));

    return {
      visits: visits.data ?? [],
      orders: orders.data ?? [],
      downloads: downloads.data ?? [],
      bookings: bookings.data ?? [],
      clients: clients.data ?? [],
      expenses: expenses.data ?? [],
      leads: leads.data ?? [],
      liveVisitors: liveSessions.size,
      generatedAt: new Date().toISOString(),
    };
  });

/** Live visitor count only, cheap enough to poll. */
export const liveVisitorCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminDb(context);
    const { data } = await db
      .from("site_visits")
      .select("session_id")
      .gte("created_at", new Date(Date.now() - 5 * 60_000).toISOString())
      .limit(500);
    return { count: new Set((data ?? []).map((r: { session_id: string }) => r.session_id)).size };
  });

/** Public: records a digital product download so download analytics are real. */
export const recordDownload = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        productName: z.string().trim().max(160).default("CV"),
        productType: z.string().trim().max(60).default("document"),
        sessionId: z.string().trim().max(80).default(""),
        referrer: z.string().trim().max(600).default(""),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const country = getRequestHeader("cf-ipcountry") ?? "";
    await supabaseAdmin.from("product_downloads").insert({
      product_name: data.productName,
      product_type: data.productType,
      session_id: data.sessionId,
      referrer: data.referrer,
      country,
    });
    return { ok: true };
  });
