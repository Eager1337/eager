import { createServerFn } from "@tanstack/react-start";
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

/** Server-only client used by public read handlers. */
async function serverDb() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
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

/**
 * Short, memorable address. We keep only the first word or two so a published
 * site reads like hammakay.eager.app rather than a long sentence.
 */
function slugify(input: string) {
  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  let slug = "";
  for (const word of words) {
    const next = slug ? `${slug}-${word}` : word;
    if (next.length > 18) break;
    slug = next;
  }
  return (slug || words[0]?.slice(0, 18) || `site-${Date.now().toString(36).slice(-5)}`).slice(0, 24);
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
        assets: z.string().trim().max(6000).default(""),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { getAiProvider, supportsReasoning } = await import("./ai-provider.server");
    const provider = getAiProvider();
    if (!provider) {
      throw new Error(
        "AI is not configured on this deployment. Add OPENAI_API_KEY (or LOVABLE_API_KEY inside Lovable) and redeploy.",
      );
    }

    const instructions = [
      SYSTEM,
      data.style ? `Visual direction requested: ${data.style}.` : "",
      data.pages ? `Sections or pages that must exist: ${data.pages}.` : "",
      data.assets,
    ]
      .filter(Boolean)
      .join("\n\n");

    const res = await fetch(provider.chat.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...provider.chat.headers },
      body: JSON.stringify({
        model: provider.chat.model,
        instructions,
        input: [
          {
            role: "user",
            content: [{ type: "input_text", text: `Build this website:\n\n${data.prompt}` }],
          },
        ],
        stream: true,
        ...(supportsReasoning(provider.chat.model)
          ? { reasoning: { effort: "low", summary: "auto" } }
          : {}),
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
  .inputValidator((d: unknown) =>
    z
      .object({ kind: z.enum(["site", "app", "any"]).default("any") })
      .parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    let query = db.from("ai_site_builds").select("*").order("created_at", { ascending: false }).limit(100);
    if (data.kind !== "any") query = query.eq("build_type", data.kind);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return { builds: rows ?? [] };
  });

export const updateSiteBuild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().trim().max(120).optional(),
        slug: z.string().trim().max(24).optional(),
        html: z.string().max(400000).optional(),
        notes: z.string().max(4000).optional(),
        summary: z.string().trim().max(400).optional(),
        cover_image: z.string().trim().max(600).optional(),
        logo_url: z.string().trim().max(600).optional(),
        source_url: z.string().trim().max(600).optional(),
        short_name: z.string().trim().max(30).optional(),
        theme_color: z.string().trim().max(20).optional(),
        app_icon: z.string().trim().max(600).optional(),
        apk_url: z.string().trim().max(600).optional(),
        published: z.boolean().optional(),
        featured: z.boolean().optional(),
        framework: z.string().trim().max(40).optional(),
        project_files: z.record(z.string(), z.string()).optional(),
        dependencies: z.record(z.string(), z.string()).optional(),
        entry_file: z.string().trim().max(180).optional(),
        build_version: z.number().int().positive().optional(),
      })

      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { id, ...patch } = data;
    if (patch.slug !== undefined) {
      const clean = slugify(patch.slug);
      if (!clean) throw new Error("That address is not usable. Use letters and numbers.");
      const { data: clash } = await db
        .from("ai_site_builds")
        .select("id")
        .eq("slug", clean)
        .neq("id", id)
        .maybeSingle();
      if (clash) throw new Error("Another site already uses that address.");
      patch.slug = clean;
    }
    const { error } = await db.from("ai_site_builds").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true, slug: patch.slug };
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
    const { data: row } = await (await serverDb())
      .from("ai_site_builds")
      .select("name, html")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    return { site: row ?? null };
  });

/**
 * Admin: bring an existing site into the builder library.
 * Works for a plain link, a GitHub repository or Pages URL, another Lovable
 * project URL, or an HTML file / zip entry the browser already read as text.
 */
export const importSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        name: z.string().trim().max(120).default(""),
        url: z.string().trim().max(600).default(""),
        html: z.string().max(400000).default(""),
        summary: z.string().trim().max(400).default(""),
        kind: z.enum(["link", "github", "zip", "lovable", "upload"]).default("link"),
        publish: z.boolean().default(true),
        featured: z.boolean().default(true),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    if (!data.url && !data.html) throw new Error("Provide a link or a file to import.");

    let html = data.html.trim();
    let url = data.url.trim();

    // Turn a GitHub repo link into its Pages URL so the preview has something to show.
    const repo = /^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)/i.exec(url);
    if (repo && data.kind === "github") {
      url = `https://${repo[1]!.toLowerCase()}.github.io/${repo[2]!.replace(/\.git$/, "")}/`;
    }

    // Try to snapshot the page so the preview keeps working even if the link dies.
    if (!html && url) {
      try {
        const res = await fetch(url, { headers: { "user-agent": "PortfolioOS-Importer" } });
        if (res.ok) {
          const text = await res.text();
          if (/<html[\s>]/i.test(text) && text.length < 380000) html = text;
        }
      } catch {
        /* keep the live link only */
      }
    }

    const title = /<title>([^<]{2,120})<\/title>/i.exec(html)?.[1]?.trim() ?? "";
    const name = data.name.trim() || title || (url ? new URL(url).hostname : "Imported site");
    let slug = slugify(name);
    const { data: clash } = await db.from("ai_site_builds").select("id").eq("slug", slug).maybeSingle();
    if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const { data: row, error } = await db
      .from("ai_site_builds")
      .insert({
        slug,
        name,
        prompt: `Imported from ${data.kind}: ${data.url || "uploaded file"}`,
        html,
        summary: data.summary,
        source_kind: data.kind,
        source_url: url,
        model: "import",
        published: data.publish,
        featured: data.featured,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { build: row };
  });

/** Public: the published sites shown in the portfolio showcase. */
export const listShowcaseSites = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await (await serverDb())
    .from("ai_site_builds")
    .select("slug, name, summary, cover_image, source_kind, source_url, created_at, html")
    .eq("published", true)
    .eq("build_type", "site")
    .order("created_at", { ascending: false })
    .limit(60);
  return {
    sites: (data ?? []).map((s) => ({
      slug: s.slug,
      name: s.name,
      summary: s.summary ?? "",
      cover: s.cover_image ?? "",
      kind: s.source_kind ?? "prompt",
      sourceUrl: s.source_url ?? "",
      createdAt: s.created_at,
      hasSnapshot: Boolean(s.html),
    })),
  };
});

/** Admin: duplicate an existing build as an unpublished draft copy. */
export const cloneSiteBuild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), name: z.string().trim().max(120).default("") }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { data: src, error: readErr } = await db
      .from("ai_site_builds")
      .select("*")
      .eq("id", data.id)
      .single();
    if (readErr || !src) throw new Error("That build could not be found.");

    const name = data.name.trim() || `${src.name} copy`;
    let slug = slugify(name);
    const { data: clash } = await db.from("ai_site_builds").select("id").eq("slug", slug).maybeSingle();
    if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const { data: row, error } = await db
      .from("ai_site_builds")
      .insert({
        slug,
        name,
        prompt: src.prompt,
        html: src.html,
        summary: src.summary,
        logo_url: src.logo_url,
        cover_image: src.cover_image,
        source_kind: src.source_kind,
        source_url: src.source_url,
        model: src.model,
        build_type: src.build_type ?? "site",
        short_name: src.short_name,
        theme_color: src.theme_color,
        app_icon: src.app_icon,
        cloned_from: src.id,
        published: false,
        featured: false,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { build: row };
  });

const APK_RELEASE_BASE = "https://github.com/Eager1337/eager/releases/download";

function apkReleaseUrl(slug: string) {
  return `${APK_RELEASE_BASE}/app-${encodeURIComponent(slug)}/${encodeURIComponent(slug)}.apk`;
}

const APP_SYSTEM = `You are a senior mobile product engineer. You generate complete, installable single file web apps that feel native on Android and on desktop.

Hard rules:
- Output ONE complete HTML document and nothing else. No markdown fences, no commentary.
- Everything inline: <style> in head, <script> at the end of body. No build step, no external JS frameworks.
- Design for a phone first: 360px wide viewport, safe area padding, bottom tab bar with at least three tabs, and app-like screen transitions.
- Also work on a desktop window: centre the app column and keep it usable up to 1400px.
- Real working interactivity with client side state: navigation between screens, forms with validation, list add and delete, and data persisted in localStorage so it survives a restart.
- Include an offline friendly empty state and never depend on a network request to render the first screen.
- Accessible: semantic landmarks, alt text, visible focus rings, aria labels on icon buttons, respect prefers-reduced-motion, minimum 44px touch targets.
- Do not add a manifest link or a service worker registration. The host page adds those.
- Use a distinctive, committed visual direction. Never default purple gradients on white.
- Use https://images.unsplash.com/... style placeholder image URLs or inline SVG. Never reference local files.
- Never use em dashes anywhere in the output.`;

/** Admin: generate an installable app from a prompt. */
export const buildAppFromPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        prompt: z.string().trim().min(8).max(6000),
        name: z.string().trim().max(120).default(""),
        style: z.string().trim().max(200).default(""),
        screens: z.string().trim().max(400).default(""),
        themeColor: z.string().trim().max(20).default("#0A0A0A"),
        assets: z.string().trim().max(6000).default(""),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { getAiProvider, supportsReasoning } = await import("./ai-provider.server");
    const provider = getAiProvider();
    if (!provider) {
      throw new Error(
        "AI is not configured on this deployment. Add OPENAI_API_KEY (or LOVABLE_API_KEY inside Lovable) and redeploy.",
      );
    }

    const instructions = [
      APP_SYSTEM,
      data.style ? `Visual direction requested: ${data.style}.` : "",
      data.screens ? `Screens that must exist: ${data.screens}.` : "",
      data.assets,
    ]
      .filter(Boolean)
      .join("\n\n");

    const res = await fetch(provider.chat.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...provider.chat.headers },
      body: JSON.stringify({
        model: provider.chat.model,
        instructions,
        input: [
          {
            role: "user",
            content: [{ type: "input_text", text: `Build this app:\n\n${data.prompt}` }],
          },
        ],
        stream: true,
        ...(supportsReasoning(provider.chat.model)
          ? { reasoning: { effort: "low", summary: "auto" } }
          : {}),
      }),
    });

    if (res.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Top up to continue.");
    if (!res.ok || !res.body) throw new Error(`App generation failed (${res.status}).`);

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
    if (!/<html[\s>]/i.test(html)) throw new Error("The model did not return a complete app. Try again.");
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
        build_type: "app",
        short_name: name.split(/\s+/).slice(0, 2).join(" ").slice(0, 12),
        theme_color: data.themeColor || "#0A0A0A",
        published: false,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { build: row };
  });


const REAL_APP_SYSTEM = `You are Eager's senior full-stack app engineer. Generate a REAL runnable Vite + React application, not a static HTML mockup.

Return ONLY valid JSON with this exact shape:
{
  "name": "string",
  "summary": "string",
  "framework": "vite-react",
  "entryFile": "src/main.jsx",
  "dependencies": {"react":"18.3.1","react-dom":"18.3.1"},
  "files": {
    "package.json": "string",
    "index.html": "string",
    "src/main.jsx": "string",
    "src/App.jsx": "string",
    "src/styles.css": "string"
  }
}

Rules:
- The files must form a runnable Vite React project.
- package.json must contain scripts for dev, build and preview.
- Use React components and real client-side state. Do not fake buttons or screens.
- Include responsive mobile-first UI, navigation, forms, validation, empty/loading/error states where relevant.
- Keep all application logic in src/ and styles in src/styles.css.
- Do not require a backend unless the user explicitly asks for one. If backend functionality is requested, create a clearly isolated service adapter with safe mock fallback.
- No secrets, API keys or service credentials.
- Use accessible semantic HTML, keyboard support, 44px touch targets and reduced-motion support.
- The first screen must render without a network request.
- Never use em dashes.
- Keep the project compact enough to preview in a browser.
`;

function extractJson(text: string) {
  const cleaned = text.trim().replace(/^\`\`\`(?:json)?/i, "").replace(/\`\`\`$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The AI did not return a valid app project.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callAppProjectAI(
  prompt: string,
  contextText = "",
) {
  const { getAiProvider, supportsReasoning } = await import("./ai-provider.server");
  const provider = getAiProvider();
  if (!provider) throw new Error("AI is not configured on this deployment. Add OPENAI_API_KEY and redeploy.");
  const res = await fetch(provider.chat.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...provider.chat.headers },
    body: JSON.stringify({
      model: provider.chat.model,
      instructions: REAL_APP_SYSTEM,
      input: [{
        role: "user",
        content: [{ type: "input_text", text: contextText ? `${prompt}\n\nCURRENT PROJECT:\n${contextText}` : prompt }],
      }],
      stream: false,
      ...(supportsReasoning(provider.chat.model) ? { reasoning: { effort: "low", summary: "auto" } } : {}),
    }),
  });
  if (res.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Top up to continue.");
  if (!res.ok) throw new Error(`AI generation failed (${res.status}).`);
  const payload = await res.json();
  const text =
    payload.output_text ??
    payload.output?.flatMap((item: any) => item.content ?? []).map((part: any) => part.text ?? "").join("") ??
    "";
  return extractJson(text);
}

export const buildRealAppFromPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      prompt: z.string().trim().min(8).max(6000),
      name: z.string().trim().max(120).default(""),
      style: z.string().trim().max(300).default(""),
      screens: z.string().trim().max(600).default(""),
      themeColor: z.string().trim().max(20).default("#0A0A0A"),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const project = await callAppProjectAI(
      `Build this real application:\n\n${data.prompt}\n\nVisual direction: ${data.style || "premium, modern, native-feeling"}\nRequired screens: ${data.screens || "choose the screens required by the product"}\nTheme color: ${data.themeColor}`,
    );
    if (project.framework !== "vite-react" || !project.files || typeof project.files !== "object") {
      throw new Error("The AI returned an incomplete project.");
    }
    const files = Object.fromEntries(
      Object.entries(project.files).filter(([path, value]) => path.length < 180 && typeof value === "string"),
    );
    if (!files["package.json"] || !files["src/main.jsx"] || !files["src/App.jsx"]) {
      throw new Error("The generated project is missing required Vite files.");
    }
    const rawName = data.name.trim() || String(project.name || "Eager App");
    let slug = slugify(rawName);
    const { data: clash } = await db.from("ai_site_builds").select("id").eq("slug", slug).maybeSingle();
    if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    const { data: row, error } = await db.from("ai_site_builds").insert({
      slug,
      name: rawName,
      prompt: data.prompt,
      html: String(files["index.html"] || ""),
      model: "openai/gpt-5.6-sol",
      build_type: "app",
      framework: "vite-react",
      project_files: files,
      dependencies: project.dependencies || {},
      entry_file: String(project.entryFile || "src/main.jsx"),
      build_version: 1,
      short_name: rawName.split(/\s+/).slice(0, 2).join(" ").slice(0, 12),
      theme_color: data.themeColor || "#0A0A0A",
      summary: String(project.summary || ""),
      published: false,
    }).select("*").single();
    if (error) throw new Error(error.message);
    return { build: row };
  });

export const editRealAppWithAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      instruction: z.string().trim().min(4).max(3000),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const db = await adminDb(context);
    const { data: current, error } = await db.from("ai_site_builds").select("project_files, dependencies, name, framework").eq("id", data.id).single();
    if (error || !current) throw new Error("App project not found.");
    if (current.framework !== "vite-react") throw new Error("This app is not a real project yet. Duplicate it with the real builder first.");
    const files = (current.project_files && typeof current.project_files === "object" ? current.project_files : {}) as Record<string, string>;
    const project = await callAppProjectAI(
      `Modify the existing app according to this instruction:\n\n${data.instruction}\n\nReturn the complete updated project. Preserve existing functionality unless the instruction changes it.`,
      JSON.stringify({ name: current.name, framework: current.framework, dependencies: current.dependencies || {}, files }),
    );
    const nextFiles = Object.fromEntries(
      Object.entries(project.files || {}).filter(([path, value]) => path.length < 180 && typeof value === "string"),
    );
    if (!nextFiles["package.json"] || !nextFiles["src/main.jsx"] || !nextFiles["src/App.jsx"]) {
      throw new Error("The AI returned an incomplete project.");
    }
    const { data: row, error: updateError } = await db.from("ai_site_builds").update({
      project_files: nextFiles,
      dependencies: project.dependencies || current.dependencies || {},
      entry_file: String(project.entryFile || "src/main.jsx"),
      html: String(nextFiles["index.html"] || ""),
      summary: String(project.summary || ""),
      build_version: Number(current.build_version || 1) + 1,
    }).eq("id", data.id).select("*").single();
    if (updateError) throw new Error(updateError.message);
    return { build: row };
  });

/** Public: one published build of either kind, with its app metadata. */
export const getPublishedBuild = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ slug: z.string().trim().max(80), kind: z.enum(["site", "app", "any"]).default("any") }).parse(d),
  )
  .handler(async ({ data }) => {
    let query = (await serverDb())
      .from("ai_site_builds")
      .select("name, short_name, html, theme_color, app_icon, logo_url, summary, apk_url, build_type, updated_at")
      .eq("slug", data.slug)
      .eq("published", true);
    if (data.kind !== "any") query = query.eq("build_type", data.kind);
    const { data: row } = await query.maybeSingle();
    return { build: row ? { ...row, apk_url: row.apk_url || (data.kind === "app" ? apkReleaseUrl(data.slug) : "") } : null };
  });

/** Public: published installable apps. */
export const listShowcaseApps = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await (await serverDb())
    .from("ai_site_builds")
    .select("slug, name, short_name, summary, app_icon, logo_url, theme_color, apk_url, created_at, updated_at")
    .eq("published", true)
    .eq("build_type", "app")
    .order("created_at", { ascending: false })
    .limit(60);
  return {
    apps: (data ?? []).map((a) => ({
      slug: a.slug,
      name: a.name,
      shortName: a.short_name ?? a.name,
      summary: a.summary ?? "",
      icon: a.app_icon ?? a.logo_url ?? "",
      themeColor: a.theme_color ?? "#0A0A0A",
      apkUrl: a.apk_url || apkReleaseUrl(a.slug),
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    })),
  };
});


/** Public Build Studio: two free AI generations per visitor token, with an IP safety cap. */
const demoBuildSchema = z.object({
  kind: z.enum(["site", "app"]),
  prompt: z.string().trim().min(8).max(1600),
  clientToken: z.string().trim().min(20).max(120),
});

async function generatePublicDemoHtml(kind: "site" | "app", prompt: string) {
  const { getAiProvider, supportsReasoning } = await import("./ai-provider.server");
  const provider = getAiProvider();
  if (!provider) {
    throw new Error("AI builder is not configured yet. Please contact Eager Beaver.");
  }

  const instructions = kind === "site" ? SYSTEM : APP_SYSTEM;
  const requestText = kind === "site"
    ? `Build this website as a public Eager Beaver demo:
${prompt}`
    : `Build this installable-style web app as a public Eager Beaver demo:
${prompt}`;

  const res = await fetch(provider.chat.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...provider.chat.headers },
    body: JSON.stringify({
      model: provider.chat.model,
      instructions,
      input: [{ role: "user", content: [{ type: "input_text", text: requestText }] }],
      stream: true,
      ...(supportsReasoning(provider.chat.model)
        ? { reasoning: { effort: "low", summary: "auto" } }
        : {}),
    }),
  });

  if (res.status === 429) throw new Error("AI is busy right now. Please try again shortly.");
  if (res.status === 402) throw new Error("AI credits are currently exhausted. Please contact Eager Beaver.");
  if (!res.ok || !res.body) throw new Error(`AI generation failed (${res.status}).`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let html = "";
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
          if (evt.type === "response.output_text.delta" && evt.delta) html += evt.delta;
        } catch {
          /* Ignore partial SSE frames. */
        }
      }
    }
  }

  html = html.trim();
  const fenced = /\`\`\`(?:html)?\s*([\s\S]*?)\`\`\`/i.exec(html);
  if (fenced?.[1]) html = fenced[1].trim();
  if (!/<html[\s>]/i.test(html)) throw new Error("The AI did not return a complete preview. Try a more specific prompt.");
  return html.replace(/\u2014/g, "-").slice(0, 400000);
}

export const buildPublicDemo = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => demoBuildSchema.parse(d))
  .handler(async ({ data }) => {
    const { enforceRateLimit } = await import("./rate-limit.server");
    const [visitor, ip] = await Promise.all([
      enforceRateLimit("public-demo-builder", data.clientToken, 2, 86400, 86400),
      enforceRateLimit("public-demo-builder-ip", data.kind, 10, 86400, 86400),
    ]);
    if (!visitor.allowed || !ip.allowed) {
      const retryAfter = Math.max(visitor.retryAfterSeconds, ip.retryAfterSeconds);
      throw new Error(`Your two free AI prompts are used. Please contact Eager Beaver or subscribe to continue.${retryAfter ? ` Try again after ${Math.ceil(retryAfter / 3600)}h.` : ""}`);
    }

    const html = await generatePublicDemoHtml(data.kind, data.prompt);
    const title = /<title>([^<]{2,120})<\/title>/i.exec(html)?.[1]?.trim() ?? "Eager Beaver AI Preview";
    return { html, title };
  });
