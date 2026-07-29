import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, ArrowRight, Loader2, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitLead } from "../lib/leads.functions";
import { downloadCvPdf } from "../lib/pdf-exports";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & project brief, Eager Beaver" },
      {
        name: "description",
        content:
          "Send a project brief to Alusine G. Dumbuya (Eager Beaver). Web, backend, systems and video work, replies within 24 hours.",
      },
      { property: "og:title", content: "Contact & project brief, Eager Beaver" },
      {
        property: "og:description",
        content: "Tell me about your project and get the CV plus client ratings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4";

const STORAGE_KEY = "eb:contact:services";

function useTypewriter(text: string, speed = 38, startDelay = 600, instant = false) {
  const [displayed, setDisplayed] = useState(instant ? text : "");
  const [done, setDone] = useState(instant);
  useEffect(() => {
    if (instant) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const start = setTimeout(() => {
      const id = setInterval(() => {
        i += 1;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(id);
          setDone(true);
        }
      }, speed);
    }, startDelay);
    return () => clearTimeout(start);
  }, [text, speed, startDelay, instant]);
  return { displayed, done };
}

const OPTIONS = ["Brand", "Digital", "Campaign", "Other"];

function ContactPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const send = useServerFn(submitLead);
  const [form, setForm] = useState({ name: "", email: "", company: "", budget: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { displayed, done } = useTypewriter("we'd love to\nhear from you!", 38, 600, !!reduce);
  const [services, setServices] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((s) => OPTIONS.includes(s)) : [];
    } catch {
      return [];
    }
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    } catch {
      /* ignore quota */
    }
  }, [services]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Respect reduced motion: just show a static frame, no autoplay, no scrub.
    if (reduce) {
      video.pause();
      video.removeAttribute("autoplay");
      return;
    }
    if (window.innerWidth < 1024) {
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.play().catch(() => {});
      return;
    }
    let prevX: number | null = null;
    const onMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      if (prevX == null) {
        prevX = e.clientX;
        return;
      }
      const delta = e.clientX - prevX;
      prevX = e.clientX;
      if (!video.duration || Number.isNaN(video.duration)) return;
      const target = video.currentTime + (delta / window.innerWidth) * 0.8 * video.duration;
      video.currentTime = Math.max(0, Math.min(video.duration, target));
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce]);

  const toggle = (opt: string) =>
    setServices((prev) => (prev.includes(opt) ? prev.filter((p) => p !== opt) : [...prev, opt]));

  const set = (k: keyof typeof form, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = "Please enter a valid email address.";
    if (form.message.trim().length < 10)
      next.message = "Tell me a little more, at least 10 characters.";
    if (form.message.length > 4000) next.message = "Please keep the brief under 4000 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSending(true);
    try {
      const res = await send({
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim(),
          budget: form.budget.trim(),
          message: form.message.trim(),
          services,
          source: "contact" as const,
        },
      });
      if (!res.ok) throw new Error(res.error);
      await navigate({ to: "/thank-you" });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const fade = reduce
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="relative bg-white text-neutral-900 font-sans selection:bg-[#EAECE9] selection:text-[#1C2E1E] antialiased overflow-x-hidden flex flex-col lg:block lg:min-h-screen">
      <header className="absolute top-0 left-0 right-0 z-30 px-6 lg:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[21px] sm:text-[26px] tracking-tight text-black font-medium select-none">
            Mainframe®
          </span>
          <span className="text-[25px] sm:text-[30px] text-black select-none tracking-[-0.02em] font-medium leading-none mb-1">
            ✱
          </span>
        </div>
        <nav aria-label="Primary" className="hidden md:flex items-center gap-3 text-[18px] text-black">
          <a className="hover:opacity-60 transition-opacity" href="#">Labs</a>
          <span aria-hidden>,</span>
          <a className="hover:opacity-60 transition-opacity" href="#">Studio</a>
          <span aria-hidden>,</span>
          <a className="hover:opacity-60 transition-opacity" href="#">Openings</a>
          <span aria-hidden>,</span>
          <a className="hover:opacity-60 transition-opacity" href="#">Shop</a>
        </nav>
        <a
          href="mailto:ebeaver091@gmail.com"
          className="hidden md:inline text-[18px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity"
        >
          Get in touch
        </a>
      </header>

      <div className="order-last lg:order-none relative lg:absolute lg:inset-0 lg:z-0 overflow-hidden pointer-events-none w-full aspect-square md:aspect-video lg:aspect-auto lg:h-full bg-neutral-50 lg:bg-transparent">
        <video
          ref={videoRef}
          src={VIDEO_URL}
          muted
          playsInline
          preload="auto"
          aria-hidden
          className="w-full h-full object-cover object-right lg:object-right-bottom"
        />
      </div>

      <div className="relative z-10 lg:absolute lg:inset-0 lg:z-10 flex items-center px-6 lg:px-16 py-20 lg:py-0">
        <div className="max-w-2xl">
          <motion.div {...fade} transition={{ duration: reduce ? 0 : 0.6 }}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[1.02] text-[#1C2E1E] whitespace-pre-line">
              {displayed}
              {!done && <span className="animate-blink" aria-hidden>|</span>}
            </h1>
          </motion.div>
          <motion.div {...fade} transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.1 }}>
            <p className="mt-6 text-lg md:text-xl text-[#5A635A] leading-relaxed font-normal mb-14 max-w-2xl">
              Whether you have questions, feedback, drop us a message and we'll get back to you as soon as possible.
            </p>
          </motion.div>

          <h2 className="text-2xl font-medium tracking-tight mb-2 text-[#1C2E1E]">What sort of service?</h2>
          <p className="opacity-85 text-[#738273] mb-8">Select all that apply</p>
          <div role="group" aria-label="Service types" className="flex flex-wrap gap-3">
            {OPTIONS.map((opt) => {
              const active = services.includes(opt);
              return (
                <motion.button
                  key={opt}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(opt)}
                  whileTap={reduce ? undefined : { scale: 0.96 }}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1C2E1E] ${
                    active
                      ? "bg-[#1C2E1E] text-white shadow-md shadow-emerald-950/5"
                      : "bg-white text-[#1C2E1E] border border-[#F1F3F1] hover:bg-[#F1F3F1]/55"
                  }`}
                >
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        initial={reduce ? false : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Check className="w-4 h-4" aria-hidden />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {opt}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6" aria-live="polite">
            {services.length === 0 ? (
              <p className="italic text-xs" style={{ opacity: 0.5 }}>
                Please click to select services above.
              </p>
            ) : (
              <motion.div
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: reduce ? 0 : 0.3 }}
                className="bg-[#FAFBF9] border border-[#F1F3F1] rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <p className="text-sm text-[#1C2E1E]">
                  Ready to inquire about: <span className="font-medium">{services.join(", ")}</span>
                </p>
                <a
                  href={`mailto:ebeaver091@gmail.com?subject=Inquiry: ${encodeURIComponent(services.join(", "))}`}
                  className="inline-flex items-center gap-1.5 text-[#4D6D47] uppercase text-xs font-semibold hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D6D47] rounded"
                >
                  Let's Go <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </a>
              </motion.div>
            )}
          </div>

          <form onSubmit={onSubmit} noValidate className="mt-12 space-y-4" aria-label="Project brief">
            <h2 className="text-2xl font-medium tracking-tight text-[#1C2E1E]">Send a brief</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Your name"
                value={form.name}
                onChange={(v) => set("name", v)}
                error={errors.name}
                autoComplete="name"
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => set("email", v)}
                error={errors.email}
                autoComplete="email"
              />
              <Field
                label="Company (optional)"
                value={form.company}
                onChange={(v) => set("company", v)}
                autoComplete="organization"
              />
              <Field
                label="Budget (optional)"
                value={form.budget}
                onChange={(v) => set("budget", v)}
                placeholder="e.g. $2,000 - $5,000"
              />
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm text-[#5A635A]">What are we building?</span>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                aria-invalid={!!errors.message}
                className={`w-full rounded-2xl border bg-white px-4 py-3 text-[#1C2E1E] outline-none transition-colors focus:border-[#1C2E1E] ${
                  errors.message ? "border-red-400" : "border-[#E3E7E3]"
                }`}
              />
              {errors.message && <span className="mt-1 block text-xs text-red-600">{errors.message}</span>}
            </label>

            {serverError && (
              <p role="alert" className="text-sm text-red-600">
                {serverError}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#1C2E1E] px-7 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Send brief
              </button>
              <button
                type="button"
                onClick={() => void downloadCvPdf()}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#E3E7E3] bg-white px-7 text-sm text-[#1C2E1E] hover:bg-[#F1F3F1]"
              >
                <Download className="h-4 w-4" /> Download my CV
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-[#5A635A]">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-[48px] w-full rounded-full border bg-white px-4 text-[#1C2E1E] outline-none transition-colors focus:border-[#1C2E1E] ${
          error ? "border-red-400" : "border-[#E3E7E3]"
        }`}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
