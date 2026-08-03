import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

const SYSTEM_PROMPT = `You are the in-house AI operator for EagerBeaver (Alusine G. Dumbuya), a full-stack developer, systems builder and video editor who runs a premium portfolio platform.
You help with: answering questions about his projects, drafting client proposals, writing technical documentation, summarising meetings, drafting blog posts, generating UI ideas, designing database schemas, explaining and generating code, planning work and organising tasks.
Rules: be concise and practical, use markdown headings and bullet lists, give production-ready code when code is asked for, never use em dashes, and state assumptions instead of inventing client facts.`;

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(20000),
});

/** Admin-only AI assistant. Streams upstream, returns the finished answer. */
export const askWorkspaceAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        messages: z.array(messageSchema).min(1).max(40),
        task: z.string().trim().max(200).default(""),
        context: z.string().trim().max(20000).default(""),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured yet.");

    const instructions = [
      SYSTEM_PROMPT,
      data.task ? `Current task type: ${data.task}.` : "",
      data.context ? `Project context supplied by the owner:\n${data.context}` : "",
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
        input: data.messages.map((m) => ({
          role: m.role,
          content: [{ type: m.role === "user" ? "input_text" : "output_text", text: m.content }],
        })),
        stream: true,
        reasoning: { effort: "low", summary: "auto" },
      }),
    });

    if (res.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Top up to continue.");
    if (!res.ok || !res.body) throw new Error(`AI request failed (${res.status}).`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    let reasoning = "";

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
            if (evt.type === "response.reasoning_summary_text.delta" && evt.delta)
              reasoning += evt.delta;
          } catch {
            /* ignore partial frames */
          }
        }
      }
    }

    return {
      text: text.trim() || reasoning.trim() || "The model returned no content. Try rephrasing.",
      reasoning: reasoning.trim(),
    };
  });

/** Admin-only image studio. */
export const generateStudioImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        prompt: z.string().trim().min(3).max(2000),
        size: z.enum(["1024x1024", "1024x1536", "1536x1024"]).default("1024x1024"),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured yet.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "openai/gpt-image-1-mini",
        prompt: data.prompt,
        size: data.size,
        quality: "low",
        stream: false,
      }),
    });

    if (res.status === 429) throw new Error("Image rate limit reached. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Top up to continue.");
    if (!res.ok) throw new Error(`Image generation failed (${res.status}).`);

    const json = (await res.json()) as {
      data?: { b64_json?: string; url?: string }[];
    };
    const first = json.data?.[0];
    const image = first?.b64_json ? `data:image/png;base64,${first.b64_json}` : first?.url;
    if (!image) throw new Error("The model returned no image.");
    return { image };
  });
