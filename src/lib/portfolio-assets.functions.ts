import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "portfolio-media";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

/** Public: list all portfolio image overrides (key -> url). */
export const listPortfolioAssets = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabasePublic = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabasePublic
    .from("portfolio_assets")
    .select("key, url, content_type, updated_at");
  if (error) throw new Error(error.message);
  return { assets: data ?? [] };
});

/** Admin: upload/replace a portfolio image. dataUrl is a base64 data URI. */
export const uploadPortfolioAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      key: z
        .string()
        .min(1)
        .max(160)
        .regex(/^[a-zA-Z0-9._-]+$/, "Key may only contain letters, numbers, dot, dash, underscore"),
      dataUrl: z.string().max(16_000_000),
    }),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const match = /^data:([^;]+);base64,(.+)$/.exec(data.dataUrl);
    if (!match) throw new Error("Invalid image data.");
    const contentType = match[1];
    const bytes = Buffer.from(match[2], "base64");

    const { error: upErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(data.key, bytes, { contentType, upsert: true });
    if (upErr) throw new Error(upErr.message);

    const url = `/api/public/media/${encodeURIComponent(data.key)}`;
    const { error: rowErr } = await supabaseAdmin
      .from("portfolio_assets")
      .upsert(
        { key: data.key, url, content_type: contentType, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
    if (rowErr) throw new Error(rowErr.message);

    return { ok: true as const, key: data.key, url };
  });

/** Admin: remove a portfolio image override (falls back to the built-in image). */
export const deletePortfolioAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ key: z.string().min(1).max(160) }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.storage.from(BUCKET).remove([data.key]);
    const { error } = await supabaseAdmin.from("portfolio_assets").delete().eq("key", data.key);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
