import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  packageSlug: z.string().trim().max(60),
  packageName: z.string().trim().max(120),
  price: z.number().min(0).max(100000),
  scheduledFor: z.string().trim().min(10).max(40),
  timeZone: z.string().trim().max(60),
  notes: z.string().trim().max(4000).optional().default(""),
});

export type BookingRequestInput = z.input<typeof schema>;

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

/** Public: request a consultation slot and queue reminders plus the follow-up email. */
export const requestBooking = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const when = new Date(data.scheduledFor);
    if (Number.isNaN(when.getTime())) {
      return { ok: false as const, error: "That date and time could not be read." };
    }
    if (when.getTime() < Date.now() - 60_000) {
      return { ok: false as const, error: "Please pick a slot in the future." };
    }

    const { data: row, error } = await publicClient()
      .from("bookings")
      .insert({
        name: data.name,
        email: data.email,
        session_type: data.packageName,
        scheduled_for: when.toISOString(),
        status: "requested",
        value: data.price,
        notes: [data.notes, `Guest time zone: ${data.timeZone}`, `Package: ${data.packageSlug}`]
          .filter(Boolean)
          .join("\n"),
      })
      .select("id")
      .single();

    if (error) {
      console.error("[bookings] insert failed", error.message);
      return { ok: false as const, error: "Could not save the booking. Please try again." };
    }

    // Reminders and follow-up are queued server side with the privileged client.
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const start = when.getTime();
      await supabaseAdmin.from("booking_reminders").insert([
        {
          booking_id: row?.id ?? null,
          kind: "confirmation",
          channel: "email",
          send_at: new Date().toISOString(),
          subject: `Your ${data.packageName} is booked`,
          body: `Hi ${data.name}, your ${data.packageName} is confirmed for ${when.toISOString()} (shown to you in ${data.timeZone}). A calendar invite is attached from the booking page.`,
        },
        {
          booking_id: row?.id ?? null,
          kind: "reminder",
          channel: "email",
          send_at: new Date(start - 24 * 3600_000).toISOString(),
          subject: `Tomorrow: ${data.packageName}`,
          body: `Reminder that your ${data.packageName} runs tomorrow. Reply with anything you want covered first.`,
        },
        {
          booking_id: row?.id ?? null,
          kind: "reminder",
          channel: "email",
          send_at: new Date(start - 3600_000).toISOString(),
          subject: `Starting in one hour: ${data.packageName}`,
          body: "The meeting link is in your calendar invite. See you shortly.",
        },
        {
          booking_id: row?.id ?? null,
          kind: "follow-up",
          channel: "email",
          send_at: new Date(start + 24 * 3600_000).toISOString(),
          subject: `Recap and next steps, ${data.packageName}`,
          body: "Thanks for the session. Attached are the notes, the recommended next step and a scoped proposal if one was discussed.",
        },
      ]);
    } catch (e) {
      console.error("[bookings] reminder queue failed", e instanceof Error ? e.message : e);
    }

    return { ok: true as const, id: row?.id ?? null };
  });
