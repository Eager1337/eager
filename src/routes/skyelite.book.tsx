import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Mail } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/skyelite/book")({
  head: () => ({ meta: [{ title: "Book, SkyElite" }] }),
  component: Book,
});

const bookingSchema = z.object({
  from: z.string().trim().min(2, "Origin is required").max(80),
  to: z.string().trim().min(2, "Destination is required").max(80),
  date: z.string().min(1, "Pick a date"),
  passengers: z.coerce.number().int().min(1, "At least 1 passenger").max(50, "Max 50"),
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(160),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

type BookingData = z.infer<typeof bookingSchema>;

type Errors = Partial<Record<keyof BookingData, string>>;

function makeRef() {
  return "SE-" + Math.random().toString(36).slice(2, 7).toUpperCase() + "-" + Date.now().toString(36).slice(-4).toUpperCase();
}

function Book() {
  const reduce = useReducedMotion();
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<null | { data: BookingData; ref: string }>(null);

  const mailto = useMemo(() => {
    if (!sent) return "";
    const { data, ref } = sent;
    const body = [
      `Reference: ${ref}`,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `From: ${data.from}`,
      `To: ${data.to}`,
      `Date: ${data.date}`,
      `Passengers: ${data.passengers}`,
      data.notes ? `Notes: ${data.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    return `mailto:ebeaver091@gmail.com?subject=${encodeURIComponent(
      `SkyElite booking ${ref}`,
    )}&body=${encodeURIComponent(body)}`;
  }, [sent]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const parsed = bookingSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof BookingData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSent({ data: parsed.data, ref: makeRef() });
  }

  return (
    <section className="pt-32 pb-24 px-6 sm:px-10 max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-[0.4em] text-white/60">Book your flight</p>
      <h1 className="mt-3 font-[Playfair_Display,serif] italic text-4xl sm:text-6xl">Let's get you airborne.</h1>
      <p className="mt-4 text-white/70 max-w-lg">
        Tell us where, when, and how many. We'll come back with options in under 10 minutes.
      </p>

      {sent ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
          role="status"
          aria-live="polite"
          className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-8 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
            <Check className="w-6 h-6" aria-hidden />
          </div>
          <h2 className="mt-4 text-2xl font-semibold">Request received.</h2>
          <p className="mt-2 text-white/70">
            Thanks {sent.data.name.split(" ")[0]}. Your reference is{" "}
            <span className="font-mono text-white">{sent.ref}</span>. Send the details to our concierge to confirm.
          </p>

          <dl className="mt-6 grid sm:grid-cols-2 gap-3 text-left text-sm">
            <Row label="Route" value={`${sent.data.from} → ${sent.data.to}`} />
            <Row label="Date" value={sent.data.date} />
            <Row label="Passengers" value={String(sent.data.passengers)} />
            <Row label="Email" value={sent.data.email} />
          </dl>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={mailto}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
            >
              <Mail className="w-4 h-4" aria-hidden /> Email concierge
            </a>
            <Link
              to="/skyelite"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
            >
              Back to home <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-10 grid sm:grid-cols-2 gap-4">
          <Field name="from" label="From" placeholder="e.g. Freetown (FNA)" error={errors.from} />
          <Field name="to" label="To" placeholder="e.g. Dubai (DXB)" error={errors.to} />
          <Field name="date" label="Date" type="date" error={errors.date} />
          <Field name="passengers" label="Passengers" type="number" placeholder="4" min={1} error={errors.passengers} />
          <Field name="name" label="Full name" placeholder="Your name" wide error={errors.name} />
          <Field name="email" label="Email" type="email" placeholder="you@email.com" wide error={errors.email} />
          <Field name="notes" label="Notes" placeholder="Anything we should know?" wide error={errors.notes} />
          <button
            type="submit"
            className="sm:col-span-2 mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black hover:bg-white/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1A]"
          >
            Send request <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </form>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <dt className="text-[10px] uppercase tracking-widest text-white/50">{label}</dt>
      <dd className="text-sm text-white mt-1 break-words">{value}</dd>
    </div>
  );
}

function Field({
  label,
  name,
  wide,
  error,
  ...rest
}: {
  label: string;
  name: string;
  wide?: boolean;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `field-${name}`;
  return (
    <label htmlFor={id} className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-xs uppercase tracking-widest text-white/60">{label}</span>
      <input
        id={id}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
        className={`rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition ${
          error ? "border-red-400/70 focus:border-red-400" : "border-white/15 focus:border-white"
        }`}
      />
      {error && (
        <span id={`${id}-error`} className="text-xs text-red-300">
          {error}
        </span>
      )}
    </label>
  );
}
