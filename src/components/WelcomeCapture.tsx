import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Mail, Download, CheckCircle2, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { submitLead } from "../lib/leads.functions";
import { downloadCvPdf } from "../lib/pdf-exports";

const KEY = "eb:welcome:v1";

/**
 * Visitor welcome flow. When someone lands on the site we offer the CV and
 * client ratings, capture their email and queue the welcome email that carries
 * the same download link.
 */
export function WelcomeCapture() {
  const reduce = useReducedMotion();
  const send = useServerFn(submitLead);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;
    try {
      if (window.localStorage.getItem(KEY)) return;
    } catch {
      return;
    }
    const t = setTimeout(() => setOpen(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setState("error");
      return;
    }
    setState("sending");
    try {
      const res = await send({ data: { email: value, source: "welcome" } });
      if (!res.ok) throw new Error(res.error);
      setState("done");
      try {
        window.localStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
      void downloadCvPdf();
    } catch {
      setState("error");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label="Welcome, get the CV and client ratings"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
          className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-sm rounded-2xl border border-white/10 bg-[#0d0d10]/95 p-5 text-white shadow-2xl backdrop-blur-xl sm:left-auto sm:right-6 sm:bottom-6"
        >
          <button
            onClick={dismiss}
            aria-label="Close welcome message"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          {state === "done" ? (
            <div className="pr-6">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <p className="mt-3 text-sm font-semibold">You are on the list</p>
              <p className="mt-1 text-xs text-white/60">
                The welcome email with my CV and client ratings is queued for {email}. Your download
                also started right now.
              </p>
              <button
                onClick={() => void downloadCvPdf()}
                className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-white px-4 text-xs font-semibold text-black hover:bg-white/90"
              >
                <Download className="h-3.5 w-3.5" /> Download again
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="pr-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
                <Mail className="h-3.5 w-3.5" /> Welcome
              </div>
              <p className="mt-2 text-sm font-semibold">Get my CV and client ratings</p>
              <p className="mt-1 text-xs text-white/60">
                Drop your email and I send the full CV, rate card and verified client ratings.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                placeholder="you@company.com"
                aria-label="Your email address"
                className="mt-3 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-white/40"
              />
              {state === "error" && (
                <p className="mt-2 text-xs text-red-400">
                  Please enter a valid email address and try again.
                </p>
              )}
              <button
                type="submit"
                disabled={state === "sending"}
                className="mt-3 inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-60"
              >
                {state === "sending" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Send me the CV
              </button>
            </form>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}