import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function adminDb(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
  return context.supabase as any;
}

const provider = z.enum(["github", "lovable", "replit", "base44", "vercel", "link", "other"]);

export const listAdminProjectSources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminDb(context);
    const { data, error } = await db
      .from("admin_project_sources")
      .select("*, files:admin_project_files(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { sources: data ?? [] };
  });

export const saveAdminProjectSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().trim().min(1).max(120),
      provider,
      sourceUrl: z.string().trim().max(1000).default(""),
      previewUrl: z.string().trim().max(1000).default(""),
      description: z.string().trim().max(1000).default(""),
      status: z.string().trim().max(40).default("connected"),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const payload = {
      name: data.name,
      provider: data.provider,
      source_url: data.sourceUrl,
      preview_url: data.previewUrl || data.sourceUrl,
      description: data.description,
      status: data.status,
    };
    const result = data.id
      ? await db.from("admin_project_sources").update(payload).eq("id", data.id).select("*").single()
      : await db.from("admin_project_sources").insert(payload).select("*").single();
    if (result.error) throw new Error(result.error.message);
    return { source: result.data };
  });

export const deleteAdminProjectSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { error } = await db.from("admin_project_sources").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const uploadAdminProjectFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      sourceId: z.string().uuid().optional(),
      fileName: z.string().trim().min(1).max(255),
      contentType: z.string().trim().max(160).default("application/octet-stream"),
      dataUrl: z.string().max(35_000_000),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const match = /^data:([^;]+);base64,(.+)$/.exec(data.dataUrl);
    if (!match) throw new Error("Invalid file data.");
    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length > 25 * 1024 * 1024) throw new Error("Files are limited to 25 MB.");
    const safeName = data.fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 180);
    const storageKey = `projects/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("portfolio-media")
      .upload(storageKey, bytes, { contentType: data.contentType, upsert: false });
    if (uploadError) throw new Error(uploadError.message);
    const url = `/api/public/media/${encodeURIComponent(storageKey)}`;
    const { data: row, error } = await db
      .from("admin_project_files")
      .insert({
        source_id: data.sourceId ?? null,
        file_name: data.fileName,
        storage_key: storageKey,
        content_type: data.contentType,
        size_bytes: bytes.length,
        url,
      })
      .select("*")
      .single();
    if (error) {
      await supabaseAdmin.storage.from("portfolio-media").remove([storageKey]);
      throw new Error(error.message);
    }
    return { file: row };
  });

export const deleteAdminProjectFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), storageKey: z.string().max(500) }).parse(d))
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.storage.from("portfolio-media").remove([data.storageKey]);
    const { error } = await db.from("admin_project_files").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
