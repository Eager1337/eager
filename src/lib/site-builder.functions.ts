import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

async function adminDb(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
  return context.supabase;
}

const SYSTEM = `You are a senior product designer and front-end engineer. You generate complete, production quality single file websites.

Hard rules:
- Output ONE complete HTML document and nothing else. No markdown fences, no commentary.
- Everything inline: <style> in head, <script> at the end of body. No build step, no external JS frameworks.
- Tailwind is allowed only via the CDN script tag https://cdn.tailwindcss.com when it helps.
- Include a real navigation bar, a hero, at least four content sections, a contact or call to action block and a footer.
- Fully responsive from 320px up. No horizontal scrolling on any width.
- Accessible: semantic landmarks, alt text, visible focus rings, aria labels on icon buttons, and respect prefers-reduced-motion.
- Include working interactivity: mobile menu toggle, smooth scrolling anchors, scroll reveal animations, and any form validated in JS.
- Use a distinctive, committed visual direction. Never default purple gradients on white.
- SEO: unique <title> under 60 characters, meta description under 160 characters, Open Graph tags, and JSON-LD.
- Use https://images.unsplash.com/... style placeholder image URLs or inline SVG. Never reference local files.
- Never use em dashes anywhere in the output.`;

function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `site-${Date.now().toString(36)}`
  );
}

/** Admin: generate a complete website from a prompt and store it as a build. */
export const buildSiteFromPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        prompt: z.string().trim().min(8).max(6000),
        name: z.string().trim().max(120).default(""),
        style: z.string().trim().max(200).default(""),
        pages: z.string().trim().max(400).default(""),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured on this deployment.");

    const instructions = [
      SYSTEM,
      data.style ? `Visual direction requested: ${data.style}.` : "",
      data.pages ? `Sections or pages that must exist: ${data.pages}.` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        instructions,
        input: [
          {
            role: "user",
            content: [{ type: "input_text", text: `Build this website:\n\n${data.prompt}` }],
          },
        ],
        stream: true,
        reasoning: { effort: "low", summary: "auto" },
      }),
    });

    if (res.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Top up to continue.");
    if (!res.ok || !res.body) throw new Error(`Site generation failed (${res.status}).`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      for (const frame of frames) {
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload) as { type?: string; delta?: string };
            if (evt.type === "response.output_text.delta" && evt.delta) text += evt.delta;
          } catch {
            /* partial frame */
          }
        }
      }
    }

    let html = text.trim();
    const fenced = /```(?:html)?\s*([\s\S]*?)```/i.exec(html);
    if (fenced?.[1]) html = fenced[1].trim();
    if (!/<html[\s>]/i.test(html)) throw new Error("The model did not return a complete page. Try again.");
    html = html.replace(/\u2014/g, "-");

    const title = /<title>([^<]{2,120})<\/title>/i.exec(html)?.[1]?.trim() ?? "";
    const name = data.name.trim() || title || data.prompt.slice(0, 60);
    let slug = slugify(name);
    const { data: clash } = await db.from("ai_site_builds").select("id").eq("slug", slug).maybeSingle();
    if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const { data: row, error } = await db
      .from("ai_site_builds")
      .insert({
        slug,
        name,
        prompt: data.prompt,
        html,
        model: "openai/gpt-5.6-sol",
        published: false,
      })
      .select("id, slug, name, html, published, created_at")
      .single();
    if (error) throw new Error(error.message);
    return { build: row };
  });

export const listSiteBuilds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminDb(context);
    const { data, error } = await db
      .from("ai_site_builds")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { builds: data ?? [] };
  });

export const updateSiteBuild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().trim().max(120).optional(),
        html: z.string().max(400000).optional(),
        notes: z.string().max(4000).optional(),
        published: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { id, ...patch } = data;
    const { error } = await db.from("ai_site_builds").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSiteBuild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { error } = await db.from("ai_site_builds").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Public: a published generated site, served at /site/$slug. */
export const getPublishedSite = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().trim().max(80) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const db = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
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
    const { data: row } = await db
      .from("ai_site_builds")
      .select("name, html")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    return { site: row ?? null };
  });
