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
  })).max(200).default([]),
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
}) {
  const { getAiProvider, supportsReasoning } = await import("./ai-provider.server");
  const provider = getAiProvider();
  if (!provider) throw new Error("AI is not configured. Add OPENAI_API_KEY or the Lovable AI key and redeploy.");

  const prompt = `You are an academic document librarian. Analyze the uploaded university file and return ONLY valid JSON matching this schema:
{
  "title": "short title",
  "document_type": "assignment|project|notebook|slides|lecture_notes|timetable|exam|syllabus|reading|other",
  "subject_code": "",
  "subject_name": "",
  "department": "",
  "semester": "",
  "academic_year": "",
  "lecturer": "",
  "due_date": "YYYY-MM-DD or empty",
  "summary": "concise useful summary",
  "tags": ["..."],
  "confidence": 0.0,
  "schedule": [
    {"day_of_week":0,"start_time":"08:00","end_time":"10:00","room":"","lecturer":"","note":"","subject_code":"","subject_name":""}
  ]
}
For schedule day_of_week use 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday.
Infer the academic subject/module from the timetable, assignment header, filename and document content. Do not invent details. If the file is a timetable, extract as many class rows as can be read. If it is not a timetable, schedule must be [].
If multiple subjects appear, use the primary subject for the document and put the other subjects in tags. Use empty strings when unknown. Keep confidence between 0 and 1.`;

  const isImage = /^image\/(png|jpe?g|webp|gif)$/i.test(input.mimeType);
  const content = isImage
    ? [
        { type: "input_image", image_url: dataUrl(input.mimeType, input.base64) },
        { type: "input_text", text: `${prompt}\nFilename: ${input.fileName}` },
      ]
    : [
        {
          type: "input_file",
          filename: input.fileName,
          file_data: dataUrl(input.mimeType, input.base64),
        },
        { type: "input_text", text: prompt },
      ];

  const res = await fetch(provider.chat.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...provider.chat.headers },
    body: JSON.stringify({
      model: provider.chat.model,
      input: [{ role: "user", content }],
      ...(supportsReasoning(provider.chat.model)
        ? { reasoning: { effort: "low", summary: "auto" } }
        : {}),
    }),
  });
  if (res.status === 429) throw new Error("AI rate limit reached. Try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted. Top up to continue.");
  if (!res.ok) throw new Error(`Academic AI failed (${res.status}).`);
  const payload = await res.json();
  let text = responseText(payload).trim();
  const fenced = /\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`/i.exec(text);
  if (fenced?.[1]) text = fenced[1].trim();
  try {
    return aiResultSchema.parse(JSON.parse(text));
  } catch {
    throw new Error("The AI returned an unreadable classification. Try the document again.");
  }
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
  const ai = await analyzeFile(input);
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
    tags: ai.tags,
    lecturer: ai.lecturer,
    due_date: dueDate,
    semester: ai.semester,
    academic_year: ai.academic_year,
    ai_confidence: ai.confidence,
    ai_status: "processed",
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
    if (subjectError) throw new Error(subjectError.message);
    if (docError) throw new Error(docError.message);
    if (scheduleError) throw new Error(scheduleError.message);

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
      const { data: url } = await storageAdmin().then((s) => s.storage.from("academic-library").createSignedUrl(doc.storage_path, 3600));
      if (url?.signedUrl) signed.set(doc.id, url.signedUrl);
    }

    return {
      subjects: subjects ?? [],
      documents: (docs ?? []).map((doc: any) => ({ ...doc, preview_url: signed.get(doc.id) ?? "" })),
      schedule: schedule ?? [],
      folders: Array.from(bySubject.entries()).map(([subjectId, documents]) => ({ subjectId, documents })),
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
