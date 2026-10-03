import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_BASE64_CHARS = Math.ceil(MAX_FILE_BYTES * 4 / 3) + 256;

async function adminDb(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
  return context.supabase;
}

async function storageAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(240),
  mimeType: z.string().trim().max(160).default("application/octet-stream"),
  size: z.number().int().positive().max(MAX_FILE_BYTES),
  base64: z.string().min(8).max(MAX_BASE64_CHARS),
});

const aiResultSchema = z.object({
  title: z.string().max(240).default(""),
  document_type: z.enum(["assignment", "project", "notebook", "slides", "lecture_notes", "timetable", "exam", "syllabus", "reading", "other"]).default("other"),
  subject_code: z.string().max(80).default(""),
  subject_name: z.string().max(180).default(""),
  department: z.string().max(180).default(""),
  semester: z.string().max(80).default(""),
  academic_year: z.string().max(80).default(""),
  lecturer: z.string().max(180).default(""),
  due_date: z.string().max(40).default(""),
  summary: z.string().max(1200).default(""),
  tags: z.array(z.string().max(60)).max(20).default([]),
  extracted_text: z.string().max(20000).default(""),
  confidence: z.number().min(0).max(1).default(0),
  schedule: z.array(z.object({
    day_of_week: z.number().int().min(0).max(6),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    room: z.string().max(120).default(""),
    lecturer: z.string().max(180).default(""),
    note: z.string().max(300).default(""),
    subject_code: z.string().max(80).default(""),
    subject_name: z.string().max(180).default(""),
  })).max(500).default([]),
});

function dataUrl(mime: string, base64: string) {
  return `data:${mime || "application/octet-stream"};base64,${base64}`;
}

function responseText(payload: any) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  const parts: string[] = [];
  for (const item of payload?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n");
}

async function analyzeFile(input: {
  fileName: string;
  mimeType: string;
  base64: string;
  knownSubjects: Array<{ code: string; name: string; department?: string; semester?: string }>;
}) {
  const { getAiProviders, supportsReasoning } = await import("./ai-provider.server");
  const providers = getAiProviders();
  if (!providers.length) throw new Error("Academic AI is not configured. The library will continue using its always-on local organizer.");

  const knownSubjects = input.knownSubjects
    .filter((subject) => subject.name || subject.code)
    .slice(0, 100)
    .map((subject) => ({
      code: subject.code || "",
      name: subject.name || "",
      department: subject.department || "",
      semester: subject.semester || "",
    }));

  const prompt = `You are the document-reading engine for a university academic library.
Read the uploaded file carefully, including small text inside images and timetable cells. Return ONLY data matching the requested JSON schema.

TIMETABLE RULES:
- If this is a timetable/class schedule, treat it as a table, not ordinary prose.
- Inspect every visible row, day header and time cell. Preserve every visible class as a separate schedule entry.
- Read subject codes/names, lecturer names, room numbers and notes exactly when visible.
- Do not skip dense or small rows. If a time has no minutes, use :00.
- Use 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday.
- A timetable can contain many modules; create an entry for every clearly readable class.

MODULE/FOLDER RULES:
- Assign every document to the best matching university module.
- Prefer an exact match from EXISTING MODULES when the file contains or clearly implies that module.
- Create a new module only when the file clearly identifies a module not already listed.
- Never invent a module just to fill a field.
- For assignments, projects, notes, slides and exams, use the course heading/code, filename, lecturer and document content together.

READER RULES:
- Extract useful readable text into extracted_text so the admin dashboard can display it without a download.
- For image-only timetables, extracted_text should contain a concise transcription of the visible timetable and important headers.
- Do not hallucinate unreadable text; use [unclear] where necessary.

EXISTING MODULES:
${JSON.stringify(knownSubjects)}

FILENAME: ${input.fileName}

Return the complete classification and extraction. Use empty strings or [] only when a value genuinely cannot be determined.`;

  const isImage = /^image\/(png|jpe?g|webp|gif)$/i.test(input.mimeType);
  const content = isImage
    ? [
        { type: "input_image", image_url: dataUrl(input.mimeType, input.base64), detail: "high" },
        { type: "input_text", text: prompt },
      ]
    : [
        { type: "input_file", filename: input.fileName, file_data: dataUrl(input.mimeType, input.base64) },
        { type: "input_text", text: prompt },
      ];

  const jsonSchema = {
    type: "object", additionalProperties: false,
    properties: {
      title: { type: "string" }, document_type: { type: "string", enum: ["assignment","project","notebook","slides","lecture_notes","timetable","exam","syllabus","reading","other"] },
      subject_code: { type: "string" }, subject_name: { type: "string" }, department: { type: "string" }, semester: { type: "string" }, academic_year: { type: "string" }, lecturer: { type: "string" }, due_date: { type: "string" }, summary: { type: "string" },
      tags: { type: "array", items: { type: "string" }, maxItems: 20 }, extracted_text: { type: "string" }, confidence: { type: "number", minimum: 0, maximum: 1 },
      schedule: { type: "array", maxItems: 500, items: { type: "object", additionalProperties: false, properties: { day_of_week: { type: "integer", minimum: 0, maximum: 6 }, start_time: { type: "string", pattern: "^\\d{2}:\\d{2}$" }, end_time: { type: "string", pattern: "^\\d{2}:\\d{2}$" }, room: { type: "string" }, lecturer: { type: "string" }, note: { type: "string" }, subject_code: { type: "string" }, subject_name: { type: "string" } }, required: ["day_of_week","start_time","end_time","room","lecturer","note","subject_code","subject_name"] } },
    },
    required: ["title","document_type","subject_code","subject_name","department","semester","academic_year","lecturer","due_date","summary","tags","extracted_text","confidence","schedule"],
  };

  let lastStatus = 0;
  for (const provider of providers) {
    const request = async (withSchema: boolean) => fetch(provider.chat.url, {
      method: "POST", headers: { "Content-Type": "application/json", ...provider.chat.headers },
      body: JSON.stringify({ model: provider.chat.model, input: [{ role: "user", content }], ...(supportsReasoning(provider.chat.model) ? { reasoning: { effort: "medium", summary: "auto" } } : {}), ...(withSchema ? { text: { format: { type: "json_schema", name: "academic_document_analysis", strict: true, schema: jsonSchema } } } : {}) }),
    });
    let res = await request(true);
    if (res.status === 400) res = await request(false);
    lastStatus = res.status;
    if (res.ok) {
      const payload = await res.json();
      let text = responseText(payload).trim().replaceAll(String.fromCharCode(96), "").trim();
      try { return aiResultSchema.parse(JSON.parse(text)); } catch { /* try the next configured provider */ }
    }
    if (![402, 429, 500, 502, 503, 504].includes(res.status)) break;
  }
  throw new Error(`Academic AI provider unavailable (status ${lastStatus || "unknown"}); use the always-on local organizer.`);

}

/** Free, credit-less classification from the file name and known modules. */
function offlineClassify(
  fileName: string,
  known: Array<{ code?: string; name?: string; department?: string; semester?: string }>,
) {
  const base = fileName.replace(/\.[a-z0-9]+$/i, "");
  const lower = base.toLowerCase();
  const words = lower.replace(/[_\-.]+/g, " ");
  const type =
    /time ?table|schedule/.test(words) ? "timetable"
    : /assign|homework|\bhw\b|coursework/.test(words) ? "assignment"
    : /project/.test(words) ? "project"
    : /slide|lecture|\bppt\b/.test(words) ? (/note/.test(words) ? "lecture_notes" : "slides")
    : /note/.test(words) ? "lecture_notes"
    : /exam|quiz|test|midterm|final/.test(words) ? "exam"
    : /syllabus|outline/.test(words) ? "syllabus"
    : /reading|chapter|paper|article/.test(words) ? "reading"
    : "other";
  const match = known.find((s) => {
    const code = (s.code ?? "").toLowerCase().replace(/\s+/g, "");
    const name = (s.name ?? "").toLowerCase();
    return (code && lower.replace(/[\s_\-]+/g, "").includes(code)) || (name.length > 3 && words.includes(name));
  });
  const codeMatch = base.match(/\b([A-Za-z]{2,5})[\s_\-]?(\d{3,4})\b/);
  return {
    title: base.replace(/[_\-]+/g, " ").trim() || fileName,
    document_type: type,
    subject_code: match?.code ?? (codeMatch ? `${codeMatch[1].toUpperCase()}${codeMatch[2]}` : ""),
    subject_name: match?.name ?? (codeMatch ? `${codeMatch[1].toUpperCase()} ${codeMatch[2]}` : ""),
    department: match?.department ?? "",
    semester: match?.semester ?? "",
    academic_year: (base.match(/20\d{2}\s?[\/\-]\s?20?\d{2}/)?.[0] ?? ""),
    lecturer: "",
    due_date: "",
    summary: "Saved with the always-on Academic organizer. Full AI re-analysis will run automatically when a configured provider is available.",
    tags: [type],
    extracted_text: "",
    confidence: 0.3,
    schedule: [] as Array<{ day_of_week: number; start_time: string; end_time: string; room: string; lecturer: string; note: string; subject_code: string; subject_name: string }>,
  };
}

async function findOrCreateSubject(
  db: any,
  ownerId: string,
  input: { code: string; name: string; department?: string; semester?: string; academicYear?: string },
) {
  const code = input.code.trim();
  const name = input.name.trim();
  if (!name && !code) return null;

  let query = db.from("academic_subjects").select("*").eq("owner_id", ownerId).limit(1);
  query = code ? query.ilike("code", code) : query.ilike("name", name);
  const { data: existing } = await query.maybeSingle();
  if (existing) {
    const { data: updated } = await db.from("academic_subjects").update({
      name: name || existing.name,
      code: code || existing.code,
      department: input.department?.trim() || existing.department,
      semester: input.semester?.trim() || existing.semester,
      academic_year: input.academicYear?.trim() || existing.academic_year,
      updated_at: new Date().toISOString(),
    }).eq("id", existing.id).eq("owner_id", ownerId).select("*").single();
    return updated ?? existing;
  }

  const { data: created, error } = await db.from("academic_subjects").insert({
    owner_id: ownerId,
    name: name || code,
    code,
    department: input.department?.trim() || "",
    semester: input.semester?.trim() || "",
    academic_year: input.academicYear?.trim() || "",
  }).select("*").single();
  if (error) throw new Error(error.message);
  return created;
}

async function processAcademicDocument(
  db: any,
  ownerId: string,
  storage: any,
  docId: string,
  input: { fileName: string; mimeType: string; base64: string },
) {
  const { data: subjectRows, error: subjectError } = await db
    .from("academic_subjects")
    .select("code,name,department,semester")
    .eq("owner_id", ownerId)
    .order("name")
    .limit(100);
  if (subjectError) throw new Error(subjectError.message);

  // Never block an upload on AI: if credits run out, the key is missing or the
  // model fails, sort the file from its name and mark it for a later re-analyze.
  let aiOk = true;
  const ai = await analyzeFile({ ...input, knownSubjects: subjectRows ?? [] }).catch(() => {
    aiOk = false;
    return offlineClassify(input.fileName, subjectRows ?? []);
  });
  const subject = await findOrCreateSubject(db, ownerId, {
    code: ai.subject_code,
    name: ai.subject_name,
    department: ai.department,
    semester: ai.semester,
    academicYear: ai.academic_year,
  });

  const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(ai.due_date) ? ai.due_date : null;
  const { error: updateError } = await db.from("academic_documents").update({
    subject_id: subject?.id ?? null,
    document_type: ai.document_type,
    title: ai.title || input.fileName,
    summary: ai.summary,
    extracted_text: ai.extracted_text,
    tags: ai.tags,
    lecturer: ai.lecturer,
    due_date: dueDate,
    semester: ai.semester,
    academic_year: ai.academic_year,
    ai_confidence: ai.confidence,
    ai_status: aiOk ? "processed" : "needs_ai",
    updated_at: new Date().toISOString(),
  }).eq("id", docId).eq("owner_id", ownerId);
  if (updateError) throw new Error(updateError.message);

  await db.from("academic_schedule_entries").delete().eq("document_id", docId).eq("owner_id", ownerId);
  if (ai.schedule.length) {
    const rows = [];
    for (const entry of ai.schedule) {
      const entrySubject = await findOrCreateSubject(db, ownerId, {
        code: entry.subject_code,
        name: entry.subject_name,
        semester: ai.semester,
        academicYear: ai.academic_year,
      });
      rows.push({
        owner_id: ownerId,
        subject_id: entrySubject?.id ?? subject?.id ?? null,
        document_id: docId,
        day_of_week: entry.day_of_week,
        start_time: entry.start_time,
        end_time: entry.end_time,
        room: entry.room,
        lecturer: entry.lecturer || ai.lecturer,
        note: entry.note,
      });
    }
    const { error } = await db.from("academic_schedule_entries").insert(rows);
    if (error) throw new Error(error.message);
  }

  const { data: row, error } = await db.from("academic_documents").select("*").eq("id", docId).eq("owner_id", ownerId).single();
  if (error) throw new Error(error.message);
  return row;
}

export const uploadAcademicDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => uploadSchema.parse(d))
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    if (data.size > MAX_FILE_BYTES) throw new Error("File is too large. Maximum size is 15 MB.");
    const raw = Buffer.from(data.base64, "base64");
    if (raw.byteLength !== data.size) throw new Error("Uploaded file size could not be verified.");
    const storage = await storageAdmin();
    const { data: buckets } = await storage.storage.listBuckets();
    if (!buckets?.some((bucket: any) => bucket.name === "academic-library")) {
      const { error: bucketError } = await storage.storage.createBucket("academic-library", { public: false });
      if (bucketError && !/already exists/i.test(bucketError.message)) {
        throw new Error(`Academic storage is not ready: ${bucketError.message}`);
      }
    }
    const docId = crypto.randomUUID();
    const safeName = data.fileName.replace(/[^a-zA-Z0-9._ -]+/g, "_").slice(0, 180);
    const path = `${context.userId}/${docId}-${safeName}`;
    const { error: uploadError } = await storage.storage.from("academic-library").upload(path, raw, {
      contentType: data.mimeType || "application/octet-stream",
      upsert: false,
    });
    if (uploadError) throw new Error(uploadError.message);

    const { error: insertError } = await db.from("academic_documents").insert({
      id: docId,
      owner_id: context.userId,
      file_name: data.fileName,
      mime_type: data.mimeType || "application/octet-stream",
      file_size: data.size,
      storage_path: path,
      ai_status: "processing",
    });
    if (insertError) {
      await storage.storage.from("academic-library").remove([path]);
      throw new Error(insertError.message);
    }

    try {
      const row = await processAcademicDocument(db, context.userId, storage, docId, {
        fileName: data.fileName,
        mimeType: data.mimeType,
        base64: data.base64,
      });
      return { document: row };
    } catch (error) {
      await db.from("academic_documents").update({
        ai_status: "failed",
        summary: error instanceof Error ? error.message : "AI classification failed",
      }).eq("id", docId).eq("owner_id", context.userId);
      return { document: await db.from("academic_documents").select("*").eq("id", docId).single().then((r: any) => r.data), warning: error instanceof Error ? error.message : "AI classification failed" };
    }
  });

export const listAcademicLibrary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminDb(context);
    const [{ data: subjects, error: subjectError }, { data: docs, error: docError }, { data: schedule, error: scheduleError }] = await Promise.all([
      db.from("academic_subjects").select("*").eq("owner_id", context.userId).order("name"),
      db.from("academic_documents").select("*").eq("owner_id", context.userId).order("created_at", { ascending: false }).limit(500),
      db.from("academic_schedule_entries").select("*").eq("owner_id", context.userId).order("day_of_week").order("start_time"),
    ]);
    const missingSchema = [subjectError, docError, scheduleError].find((error: any) =>
      error?.code === "42P01" || error?.code === "PGRST205" || /does not exist|could not find the table/i.test(error?.message ?? ""),
    );
    if (missingSchema) {
      return {
        subjects: [],
        documents: [],
        schedule: [],
        folders: [],
        setupRequired: true,
        storageReady: false,
        setupMessage: "Academic Library storage is waiting for its Supabase migration. The dashboard remains available while it is being connected.",
      };
    }
    if (subjectError) throw new Error(subjectError.message);
    if (docError) throw new Error(docError.message);
    if (scheduleError) throw new Error(scheduleError.message);

    const storage = await storageAdmin();
    const { data: buckets } = await storage.storage.listBuckets();
    const storageReady = Boolean(buckets?.some((bucket: any) => bucket.name === "academic-library"));
    if (!storageReady) {
      const { error: bucketError } = await storage.storage.createBucket("academic-library", { public: false });
      if (bucketError && !/already exists/i.test(bucketError.message)) {
        return {
          subjects: subjects ?? [],
          documents: [],
          schedule: schedule ?? [],
          folders: [],
          setupRequired: true,
          storageReady: false,
          setupMessage: `Academic storage is not ready yet: ${bucketError.message}`,
        };
      }
    }

    const subjectIds = new Set((subjects ?? []).map((s: any) => s.id));
    const bySubject = new Map<string, any[]>();
    for (const doc of docs ?? []) {
      const key = doc.subject_id && subjectIds.has(doc.subject_id) ? doc.subject_id : "uncategorized";
      const list = bySubject.get(key) ?? [];
      list.push(doc);
      bySubject.set(key, list);
    }

    const signed = new Map<string, string>();
    for (const doc of docs ?? []) {
      const { data: url } = await storage.storage.from("academic-library").createSignedUrl(doc.storage_path, 3600);
      if (url?.signedUrl) signed.set(doc.id, url.signedUrl);
    }

    return {
      subjects: subjects ?? [],
      documents: (docs ?? []).map((doc: any) => ({ ...doc, preview_url: signed.get(doc.id) ?? "" })),
      schedule: schedule ?? [],
      folders: Array.from(bySubject.entries()).map(([subjectId, documents]) => ({ subjectId, documents })),
      setupRequired: false,
      storageReady: true,
    };
  });

export const deleteAcademicDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { data: doc, error } = await db.from("academic_documents").select("storage_path").eq("id", data.id).eq("owner_id", context.userId).single();
    if (error || !doc) throw new Error("Document not found.");
    const storage = await storageAdmin();
    await storage.storage.from("academic-library").remove([doc.storage_path]);
    await db.from("academic_documents").delete().eq("id", data.id).eq("owner_id", context.userId);
    return { ok: true };
  });

export const reprocessAcademicDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { data: doc, error } = await db.from("academic_documents").select("id,file_name,mime_type,storage_path").eq("id", data.id).eq("owner_id", context.userId).single();
    if (error || !doc) throw new Error("Document not found.");
    const storage = await storageAdmin();
    const { data: file, error: downloadError } = await storage.storage.from("academic-library").download(doc.storage_path);
    if (downloadError || !file) throw new Error("Stored file could not be read.");
    const bytes = Buffer.from(await file.arrayBuffer());
    const row = await processAcademicDocument(db, context.userId, storage, doc.id, {
      fileName: doc.file_name,
      mimeType: doc.mime_type,
      base64: bytes.toString("base64"),
    });
    return { document: row };
  });
