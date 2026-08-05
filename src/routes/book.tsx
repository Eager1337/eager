import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  Check,
  Clock,
  Globe2,
  Loader2,
  NotebookPen,
} from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "../components/Reveal";
import { requestBooking } from "../lib/booking.functions";
import {
  CONSULTATION_PACKAGES,
  SLOT_HOURS_UTC,
  TIME_ZONES,
  findPackage,
} from "../data/consultations";

const TITLE = "Book a Consultation, Eager Beaver Product Studio";
const DESC =
  "Pick a consultation package, choose a slot in your own time zone, add meeting notes and get a calendar invite plus automated reminders and a follow-up recap.";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookPage,
});

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fmtInZone(d: Date, tz: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz,
    }).format(d);
  } catch {
    return d.toUTCString();
  }
}

function icsStamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function downloadIcs(opts: { title: string; start: Date; minutes: number; notes: string; email: string }) {
  const end = new Date(opts.start.getTime() + opts.minutes * 60_000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eager Beaver//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@eagerbeaver`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(opts.start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:${(opts.notes || "Consultation with Eager Beaver product studio.").replace(/\n/g, "\\n")}`,
    "LOCATION:Google Meet link sent by email",
    `ORGANIZER;CN=Eager Beaver:mailto:ebeaver091@gmail.com`,
    `ATTENDEE;CN=${opts.email}:mailto:${opts.email}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Consultation starts in one hour",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `consultation-${isoDate(opts.start)}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function googleCalendarUrl(opts: { title: string; start: Date; minutes: number; notes: string }) {
  const end = new Date(opts.start.getTime() + opts.minutes * 60_000);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${icsStamp(opts.start)}/${icsStamp(end)}`,
    details: opts.notes || "Consultation with the Eager Beaver product studio.",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

function BookPage() {
  const submit = useServerFn(requestBooking);
  const guessedZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Freetown";
    } catch {
      return "Africa/Freetown";
    }
  }, []);

  const [slug, setSlug] = useState(CONSULTATION_PACKAGES[0]!.slug);
  const [tz, setTz] = useState(guessedZone);
  const [day, setDay] = useState(() => isoDate(new Date(Date.now() + 86_400_000)));
  const [hour, setHour] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const pkg = findPackage(slug);
  const zones = useMemo(
    () => Array.from(new Set([guessedZone, ...TIME_ZONES])).filter(Boolean),
    [guessedZone],
  );

  const slotDate = (h: number) => new Date(`${day}T${String(h).padStart(2, "0")}:00:00.000Z`);
  const chosen = hour === null ? null : slotDate(hour);
  const meetingTitle = `${pkg.name} with Eager Beaver`;

  const send = async () => {
    setError("");
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Please enter a valid email.");
    if (!chosen) return setError("Please pick a time slot.");
    setBusy(true);
    try {
      const res = await submit({
        data: {
          name: name.trim(),
          email: email.trim(),
          packageSlug: pkg.slug,
          packageName: pkg.name,
          price: pkg.price,
          scheduledFor: chosen.toISOString(),
          timeZone: tz,
          notes: notes.trim(),
        },
      });
      if (!res.ok) setError(res.error);
      else setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
        <Link
          to="/portfolio"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the portfolio
        </Link>

        <Reveal>
          <p className="mt-8 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
            Book a consultation
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Pick a package, pick a slot in your own time zone.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{DESC}</p>
        </Reveal>

        <section className="mt-12">
          <h2 className="text-xl font-bold sm:text-2xl">Consultation packages</h2>
          <RevealStagger className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONSULTATION_PACKAGES.map((p) => {
              const active = p.slug === slug;
              return (
                <RevealItem key={p.slug}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSlug(p.slug)}
                    className={`h-full w-full rounded-2xl border p-5 text-left transition ${
                      active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{p.best}</div>
                    <h3 className="mt-2 text-base font-semibold">{p.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" /> {p.minutes} min
                      <span className="font-semibold text-primary">
                        {p.price === 0 ? "Free" : `$${p.price}`}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
                    <ul className="mt-3 space-y-1.5">
                      {p.includes.map((i) => (
                        <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                          <span className="min-w-0">{i}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                </RevealItem>
              );
            })}
          </RevealStagger>
        </section>

        <section className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <CalendarDays className="h-4 w-4 text-primary" /> Choose a slot
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="min-w-0 text-sm">
                <span className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Date
                </span>
                <input
                  type="date"
                  value={day}
                  min={isoDate(new Date())}
                  onChange={(e) => {
                    setDay(e.target.value);
                    setHour(null);
                  }}
                  className="min-h-[44px] w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
                />
              </label>
              <label className="min-w-0 text-sm">
                <span className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Your time zone
                </span>
                <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-background px-3">
                  <Globe2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <select
                    value={tz}
                    onChange={(e) => setTz(e.target.value)}
                    className="min-h-[44px] min-w-0 flex-1 bg-transparent text-sm outline-none"
                  >
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {z.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>

            <div className="mt-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Available times, converted to {tz.replace(/_/g, " ")}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SLOT_HOURS_UTC.map((h) => {
                  const d = slotDate(h);
                  const past = d.getTime() < Date.now();
                  const active = hour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={past}
                      aria-pressed={active}
                      onClick={() => setHour(h)}
                      className={`min-h-[44px] rounded-xl border px-2 text-xs font-medium transition disabled:opacity-35 ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-primary/60"
                      }`}
                    >
                      {fmtInZone(d, tz)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="min-w-0 text-sm">
                <span className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Full name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  className="min-h-[44px] w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
                />
              </label>
              <label className="min-w-0 text-sm">
                <span className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  className="min-h-[44px] w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm">
              <span className="mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <NotebookPen className="h-3.5 w-3.5" /> Meeting notes and agenda
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={4000}
                placeholder="What should we cover first? Links, budget, deadlines."
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>

            {error && (
              <p role="alert" className="mt-3 text-sm text-rose-500">
                {error}
              </p>
            )}

            <button
              onClick={send}
              disabled={busy || done}
              className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {done ? "Booking confirmed" : `Confirm ${pkg.name}`}
            </button>
          </div>

          <aside className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-lg font-bold">Your booking</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Package" value={`${pkg.name} · ${pkg.minutes} min`} />
              <Row label="Investment" value={pkg.price === 0 ? "Free" : `$${pkg.price}`} />
              <Row label="Your time" value={chosen ? fmtInZone(chosen, tz) : "Pick a slot"} />
              <Row
                label="Studio time"
                value={chosen ? fmtInZone(chosen, "Africa/Freetown") : "Pick a slot"}
              />
            </dl>

            {done ? (
              <div className="mt-5 space-y-3">
                <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500">
                  Booked. Reminders 24 hours and 1 hour before, plus a recap and next-steps email the day
                  after, are queued automatically.
                </p>
                <button
                  onClick={() =>
                    chosen &&
                    downloadIcs({
                      title: meetingTitle,
                      start: chosen,
                      minutes: pkg.minutes,
                      notes,
                      email,
                    })
                  }
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold transition hover:bg-background"
                >
                  <CalendarPlus className="h-4 w-4" /> Add to Apple or Outlook (.ics)
                </button>
                {chosen && (
                  <a
                    href={googleCalendarUrl({
                      title: meetingTitle,
                      start: chosen,
                      minutes: pkg.minutes,
                      notes,
                    })}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold transition hover:bg-background"
                  >
                    <CalendarDays className="h-4 w-4" /> Add to Google Calendar
                  </a>
                )}
                <Link
                  to="/contact"
                  className="block text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  Send extra material before the call
                </Link>
              </div>
            ) : (
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {[
                  "Slots are shown in your own time zone automatically.",
                  "Calendar sync for Google, Apple and Outlook after confirming.",
                  "Reminder emails 24 hours and 1 hour before the session.",
                  "Recap, notes and next steps sent the day after.",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="min-w-0">{t}</span>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
      <dt className="min-w-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="shrink-0 text-right text-sm font-medium">{value}</dd>
    </div>
  );
}
