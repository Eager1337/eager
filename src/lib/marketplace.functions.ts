import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Public catalogue: active products, bundles and approved reviews. */
export const loadMarketplace = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const [products, bundles, reviews] = await Promise.all([
    db.from("products").select("*").eq("active", true).order("featured", { ascending: false }),
    db.from("product_bundles").select("*").eq("active", true),
    db.from("product_reviews").select("product_slug, author_name, rating, body, created_at").eq("approved", true),
  ]);
  return {
    products: products.data ?? [],
    bundles: bundles.data ?? [],
    reviews: reviews.data ?? [],
  };
});

export const getWishlist = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ sessionId: z.string().trim().min(4).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const { data: rows } = await publicClient()
      .from("wishlist_items")
      .select("product_slug")
      .eq("session_id", data.sessionId);
    return { slugs: (rows ?? []).map((r) => r.product_slug) };
  });

export const toggleWishlist = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        sessionId: z.string().trim().min(4).max(80),
        productSlug: z.string().trim().min(1).max(120),
        wanted: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const db = publicClient();
    if (data.wanted) {
      await db
        .from("wishlist_items")
        .insert({ session_id: data.sessionId, product_slug: data.productSlug });
    } else {
      await db
        .from("wishlist_items")
        .delete()
        .eq("session_id", data.sessionId)
        .eq("product_slug", data.productSlug);
    }
    return { ok: true };
  });

/** Public: submit a review. Held for admin approval before it appears. */
export const submitReview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        productSlug: z.string().trim().min(1).max(120),
        authorName: z.string().trim().min(1).max(80),
        authorEmail: z.string().trim().max(200).default(""),
        rating: z.number().int().min(1).max(5),
        body: z.string().trim().min(4).max(2000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("product_reviews").insert({
      product_slug: data.productSlug,
      author_name: data.authorName,
      author_email: data.authorEmail,
      rating: data.rating,
      body: data.body,
      approved: false,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Public: claim a download. Issues a license key, records the download and
 * returns the key plus the file link so the visitor gets both at once.
 */
export const claimDownload = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        productSlug: z.string().trim().min(1).max(120),
        customerName: z.string().trim().max(120).default(""),
        customerEmail: z.string().trim().email().max(200),
        sessionId: z.string().trim().max(80).default(""),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, name, slug, file_url, version, downloads_count, product_type:category")
      .eq("slug", data.productSlug)
      .maybeSingle();
    if (!product) throw new Error("That product is no longer available.");

    const block = () =>
      Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map((b) => b.toString(36).toUpperCase().padStart(2, "0"))
        .join("")
        .slice(0, 5);
    const licenseKey = `EB-${block()}-${block()}-${block()}`;

    const { error: licErr } = await supabaseAdmin.from("product_licenses").insert({
      product_slug: data.productSlug,
      license_key: licenseKey,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      status: "active",
      max_activations: 3,
    });
    if (licErr) throw new Error(licErr.message);

    await supabaseAdmin
      .from("products")
      .update({ downloads_count: Number(product.downloads_count ?? 0) + 1 })
      .eq("id", product.id);

    await supabaseAdmin.from("product_downloads").insert({
      product_name: product.name,
      product_type: String(product.product_type ?? "Template"),
      session_id: data.sessionId,
      referrer: "",
      country: "",
    });

    return {
      licenseKey,
      fileUrl: product.file_url ?? "",
      version: product.version ?? "1.0.0",
      name: product.name,
    };
  });
