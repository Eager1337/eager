import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ---------------- helpers ---------------- */

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
  return context.supabase;
}

const idSchema = z.object({ id: z.string().uuid() });

/* ---------------- clients ---------------- */

const clientSchema = z.object({
  name: z.string().trim().min(1).max(160),
  company: z.string().trim().max(200).default(""),
  email: z.string().trim().max(255).default(""),
  phone: z.string().trim().max(60).default(""),
  website: z.string().trim().max(300).default(""),
  address: z.string().trim().max(400).default(""),
  billing_info: z.string().trim().max(2000).default(""),
  contract_notes: z.string().trim().max(6000).default(""),
  project_notes: z.string().trim().max(6000).default(""),
  communication_log: z.string().trim().max(12000).default(""),
  feedback: z.string().trim().max(4000).default(""),
  documents: z
    .array(z.object({ name: z.string().max(200), url: z.string().max(1000) }))
    .max(50)
    .default([]),
  reminder: z.string().trim().max(400).default(""),
  follow_up_at: z.string().trim().max(40).nullable().default(null),
  status: z.enum(["lead", "active", "paused", "won", "lost", "completed"]).default("lead"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  archived: z.boolean().default(false),
});

export type ClientInput = z.input<typeof clientSchema>;

export const listClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await assertAdmin(context);
    const { data, error } = await db
      .from("clients")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { records: data ?? [] };
  });

export const saveClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid().nullable().default(null), values: clientSchema }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await assertAdmin(context);
    const payload = { ...data.values, follow_up_at: data.values.follow_up_at || null };
    if (data.id) {
      const { error } = await db.from("clients").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await db.from("clients").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row?.id as string };
  });

export const deleteClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ context, data }) => {
    const db = await assertAdmin(context);
    const { error } = await db.from("clients").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setClientArchived = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.extend({ archived: z.boolean() }).parse(d))
  .handler(async ({ context, data }) => {
    const db = await assertAdmin(context);
    const { error } = await db.from("clients").update({ archived: data.archived }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- projects ---------------- */

const projectSchema = z.object({
  client_id: z.string().uuid().nullable().default(null),
  name: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(4000).default(""),
  state: z.enum(["active", "completed", "on-hold"]).default("active"),
  progress: z.number().int().min(0).max(100).default(0),
  deadline: z.string().trim().max(40).nullable().default(null),
  budget: z.string().trim().max(80).default(""),
  estimated_hours: z.number().min(0).max(100000).default(0),
  completed_hours: z.number().min(0).max(100000).default(0),
  milestones: z
    .array(z.object({ title: z.string().max(200), done: z.boolean().default(false) }))
    .max(60)
    .default([]),
  tasks: z
    .array(z.object({ title: z.string().max(200), done: z.boolean().default(false) }))
    .max(200)
    .default([]),
  requirements: z.string().trim().max(8000).default(""),
  meeting_notes: z.string().trim().max(12000).default(""),
  deployment_notes: z.string().trim().max(8000).default(""),
  api_docs: z.string().trim().max(8000).default(""),
  design_assets: z
    .array(z.object({ name: z.string().max(200), url: z.string().max(1000) }))
    .max(60)
    .default([]),
  repo_url: z.string().trim().max(500).default(""),
  live_url: z.string().trim().max(500).default(""),
  archived: z.boolean().default(false),
});

export type ProjectInput = z.input<typeof projectSchema>;

export const listClientProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await assertAdmin(context);
    const { data, error } = await db
      .from("client_projects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { records: data ?? [] };
  });

export const saveClientProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid().nullable().default(null), values: projectSchema }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await assertAdmin(context);
    const payload = { ...data.values, deadline: data.values.deadline || null };
    if (data.id) {
      const { error } = await db.from("client_projects").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await db
      .from("client_projects")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row?.id as string };
  });

export const deleteClientProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ context, data }) => {
    const db = await assertAdmin(context);
    const { error } = await db.from("client_projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const duplicateClientProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ context, data }) => {
    const db = await assertAdmin(context);
    const { data: row, error } = await db
      .from("client_projects")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const { id, created_at, updated_at, ...rest } = row as Record<string, unknown>;
    const { data: copy, error: insertError } = await db
      .from("client_projects")
      .insert({ ...rest, name: `${String(rest.name)} (copy)` } as never)
      .select("id")
      .single();
    if (insertError) throw new Error(insertError.message);
    return { id: copy?.id as string };
  });

/* ---------------- workspace tools ---------------- */

const toolSchema = z.object({
  name: z.string().trim().min(1).max(120),
  url: z.string().trim().min(1).max(600),
  category: z.string().trim().max(80).default("General"),
  notes: z.string().trim().max(4000).default(""),
  icon: z.string().trim().max(400).default(""),
  favorite: z.boolean().default(false),
  pinned: z.boolean().default(false),
});

export type ToolInput = z.input<typeof toolSchema>;

export const listWorkspaceTools = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await assertAdmin(context);
    const { data, error } = await db
      .from("workspace_tools")
      .select("*")
      .order("pinned", { ascending: false })
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return { records: data ?? [] };
  });

export const saveWorkspaceTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid().nullable().default(null), values: toolSchema }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await assertAdmin(context);
    if (data.id) {
      const { error } = await db.from("workspace_tools").update(data.values).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await db
      .from("workspace_tools")
      .insert(data.values)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row?.id as string };
  });

export const deleteWorkspaceTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ context, data }) => {
    const db = await assertAdmin(context);
    const { error } = await db.from("workspace_tools").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const touchWorkspaceTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.extend({ openCount: z.number().int().min(0) }).parse(d))
  .handler(async ({ context, data }) => {
    const db = await assertAdmin(context);
    const { error } = await db
      .from("workspace_tools")
      .update({ last_opened_at: new Date().toISOString(), open_count: data.openCount + 1 })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const seedWorkspaceTools = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        tools: z
          .array(
            z.object({
              name: z.string().max(120),
              url: z.string().max(600),
              category: z.string().max(80),
            }),
          )
          .max(60),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await assertAdmin(context);
    const { data: existing } = await db.from("workspace_tools").select("name");
    const have = new Set((existing ?? []).map((r: { name: string }) => r.name.toLowerCase()));
    const rows = data.tools.filter((t) => !have.has(t.name.toLowerCase()));
    if (!rows.length) return { inserted: 0 };
    const { error } = await db.from("workspace_tools").insert(rows as never);
    if (error) throw new Error(error.message);
    return { inserted: rows.length };
  });

/* ---------------- knowledge base ---------------- */

const knowledgeSchema = z.object({
  title: z.string().trim().min(1).max(240),
  kind: z
    .enum([
      "research",
      "article",
      "video",
      "documentation",
      "api",
      "design",
      "ui-idea",
      "startup-idea",
      "business-idea",
      "marketing-idea",
      "ai-prompt",
      "meeting",
      "note",
    ])
    .default("note"),
  url: z.string().trim().max(1000).default(""),
  body: z.string().trim().max(30000).default(""),
  tags: z.array(z.string().trim().max(40)).max(24).default([]),
  favorite: z.boolean().default(false),
});

export type KnowledgeInput = z.input<typeof knowledgeSchema>;

export const listKnowledge = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await assertAdmin(context);
    const { data, error } = await db
      .from("knowledge_items")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return { records: data ?? [] };
  });

export const saveKnowledge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid().nullable().default(null), values: knowledgeSchema }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await assertAdmin(context);
    if (data.id) {
      const { error } = await db.from("knowledge_items").update(data.values).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await db
      .from("knowledge_items")
      .insert(data.values)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row?.id as string };
  });

export const deleteKnowledge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ context, data }) => {
    const db = await assertAdmin(context);
    const { error } = await db.from("knowledge_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- visitor tracking ---------------- */

export const recordVisit = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        sessionId: z.string().trim().max(80).default(""),
        path: z.string().trim().max(500).default("/"),
        referrer: z.string().trim().max(600).default(""),
        device: z.string().trim().max(40).default(""),
        browser: z.string().trim().max(60).default(""),
        os: z.string().trim().max(60).default(""),
        language: z.string().trim().max(40).default(""),
        timezone: z.string().trim().max(80).default(""),
        screen: z.string().trim().max(40).default(""),
        isReturning: z.boolean().default(false),
        userAgent: z.string().trim().max(600).default(""),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = getRequestIP({ xForwardedFor: true }) ?? "";
    const country = getRequestHeader("cf-ipcountry") ?? "";
    const region = getRequestHeader("cf-region") ?? "";
    const city = getRequestHeader("cf-ipcity") ?? "";
    const { error } = await supabaseAdmin.from("site_visits").insert({
      session_id: data.sessionId,
      path: data.path,
      referrer: data.referrer,
      device: data.device,
      browser: data.browser,
      os: data.os,
      language: data.language,
      timezone: data.timezone,
      screen: data.screen,
      is_returning: data.isReturning,
      ip,
      user_agent: data.userAgent,
      country,
      region,
      city,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listVisits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await assertAdmin(context);
    const { data, error } = await db
      .from("site_visits")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return { records: data ?? [] };
  });
