import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "portfolio-media";

export type CvProfile = {
  full_name: string;
  headline: string;
  summary: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  skills: string[];
  experience: { role: string; org: string; period: string; detail: string }[];
  education: { school: string; credential: string; period: string }[];
  certifications: string[];
  languages: string[];
  ratings: { label: string; score: number }[];
  file_url: string;
  file_name: string;
};

export const EMPTY_CV: CvProfile = {
  full_name: "",
  headline: "",
  summary: "",
  location: "",
  email: "",
  phone: "",
  website: "",
  skills: [],
  experience: [],
  education: [],
  certifications: [],
  languages: [],
  ratings: [],
  file_url: "",
  file_name: "",
};

const cvSchema = z.object({
  full_name: z.string().max(160).default(""),
  headline: z.string().max(240).default(""),
  summary: z.string().max(4000).default(""),
  location: z.string().max(160).default(""),
  email: z.string().max(200).default(""),
  phone: z.string().max(60).default(""),
  website: z.string().max(300).default(""),
  skills: z.array(z.string().max(80)).max(80).default([]),
  experience: z
    .array(
      z.object({
        role: z.string().max(160).default(""),
        org: z.string().max(160).default(""),
        period: z.string().max(80).default(""),
        detail: z.string().max(2000).default(""),
      }),
    )
    .max(40)
    .default([]),
  education: z
    .array(
      z.object({
        school: z.string().max(200).default(""),
        credential: z.string().max(200).default(""),
        period: z.string().max(80).default(""),
      }),
    )
    .max(30)
    .default([]),
  certifications: z.array(z.string().max(200)).max(60).default([]),
  languages: z.array(z.string().max(80)).max(30).default([]),
  ratings: z
    .array(z.object({ label: z.string().max(120).default(""), score: z.number().min(0).max(5) }))
    .max(20)
    .default([]),
});

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    }),
  );
}

/** Public: the CV shown on /cv and used by the PDF export. */
export const getCvProfile = createServerFn({ method: "GET" }).handler(async () => {
  const db = await publicClient();
  const { data } = await db.from("cv_profile").select("*").eq("id", "global").maybeSingle();
  return { cv: { ...EMPTY_CV, ...(data ?? {}) } as CvProfile };
});

/** Admin: save every CV field. */
export const saveCvProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(cvSchema)
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("cv_profile")
      .upsert({ id: "global", ...data, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Admin: upload a CV file (PDF, Word, image) from the computer. */
export const uploadCvFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      fileName: z.string().min(1).max(200),
      dataUrl: z.string().max(24_000_000),
    }),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const match = /^data:([^;]+);base64,(.+)$/.exec(data.dataUrl);
    if (!match) throw new Error("Invalid file data.");
    const contentType = match[1];
    const bytes = Buffer.from(match[2], "base64");
    const safe = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const key = `cv/${Date.now()}-${safe}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(key, bytes, { contentType, upsert: true });
    if (upErr) throw new Error(upErr.message);

    const url = `/api/public/media/${encodeURIComponent(key)}`;
    const { error } = await supabaseAdmin
      .from("cv_profile")
      .upsert(
        { id: "global", file_url: url, file_name: safe, updated_at: new Date().toISOString() },
        { onConflict: "id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true as const, url, fileName: safe };
  });

/** Admin: drop the uploaded file and fall back to the generated PDF. */
export const clearCvFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("cv_profile")
      .upsert(
        { id: "global", file_url: "", file_name: "", updated_at: new Date().toISOString() },
        { onConflict: "id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
