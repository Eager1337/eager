import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const leadSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(160).optional().default(""),
  budget: z.string().trim().max(80).optional().default(""),
  services: z.array(z.string().trim().max(60)).max(12).optional().default([]),
  message: z.string().trim().max(4000).optional().default(""),
  source: z.enum(["contact", "welcome", "cv"]).default("contact"),
});

export type LeadInput = z.input<typeof leadSchema>;

function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Public: store a lead and queue the welcome email (CV + ratings). */
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const { error } = await publicClient()
      .from("leads")
      .insert({
        name: data.name || null,
        email: data.email,
        company: data.company || null,
        budget: data.budget || null,
        services: data.services ?? [],
        message: data.message || null,
        source: data.source,
        cv_link_sent: true,
        welcome_email_status: "queued",
      });

    if (error) {
      console.error("[leads] insert failed", error.message);
      return { ok: false as const, error: "Could not save your message. Please try again." };
    }
    return { ok: true as const };
  });

/** Admin only: list captured leads. */
export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("leads")
      .select("id, name, email, company, budget, services, message, source, welcome_email_status, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return { ok: false as const, leads: [], error: error.message };
    return { ok: true as const, leads: data ?? [] };
  });