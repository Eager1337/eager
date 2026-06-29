import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X, BookOpen, Mail, GraduationCap, Code2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "EagerBeaver — Portfolio Book" },
      { name: "description", content: "Senior Software Engineer portfolio: about, services, process, testimonials, and featured projects." },
      { property: "og:title", content: "EagerBeaver — Portfolio Book" },
      { property: "og:description", content: "An interactive portfolio book by EagerBeaver, Senior Software Engineer." },
    ],
  }),
  component: PortfolioBook,
});

type Project = {
  title: string;
  tagline: string;
  problem: string;
  solution: string;
  stack: string[];
};

const PROJECTS: Project[] = [
  {
    title: "DataCore",
    tagline: "Real-time analytics for ops teams",
    problem: "Ops teams were stitching together CSVs and dashboards, losing hours every week reconciling numbers across tools.",
    solution: "A streaming analytics layer with a unified schema, sub-second queries, and shareable, embeddable charts.",
    stack: ["TypeScript", "Next.js", "ClickHouse", "Kafka", "Tailwind"],
  },
  {
    title: "Taskora",
    tagline: "Async-first project management",
    problem: "Remote teams burned out on meetings used to keep delivery on track.",
    solution: "Threaded tasks, automatic stand-ups, and AI summaries that replace status meetings with quick reads.",
    stack: ["React", "Node", "Postgres", "Prisma", "OpenAI"],
  },
  {
    title: "Deck",
    tagline: "AI pitch deck generator",
    problem: "Founders spent days designing decks instead of refining their story.",
    solution: "Prompt-to-deck pipeline that drafts narrative, layout and visuals, then exports clean PPTX and PDF.",
    stack: ["TanStack Start", "Cloudflare Workers", "Supabase", "Lovable AI"],
  },
  {
    title: "Limkokwing Connect",
    tagline: "Campus student portal",
    problem: "Students juggled scattered portals for results, fees, and timetables.",
    solution: "One mobile-first portal with offline support, push reminders, and SSO across faculty services.",
    stack: ["React Native", "tRPC", "Postgres", "Redis"],
  },
];

const TOC = [
  { id: 0, label: "Cover" },
  { id: 1, label: "About" },
  { id: 2, label: "Services" },
  { id: 3, label: "Process" },
  { id: 4, label: "Featured Projects" },
  { id: 5, label: "Testimonials" },
  { id: 6, label: "Contact" },
];

const DURATION = 700;

function PortfolioBook() {
  const [page, setPage] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [flipping, setFlipping] = useState<"next" | "prev" | null>(null);
  const [modal, setModal] = useState<Project | null>(null);
  const lastPage = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const u = () => setReducedMotion(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);

  const total = TOC.length;

  const goTo = useCallback(
    (next: number) => {
      if (flipping) return;
      const clamped = Math.max(0, Math.min(total - 1, next));
      if (clamped === page) return;
      const dir = clamped > page ? "next" : "prev";
      lastPage.current = page;
      if (reducedMotion) {
        setPage(clamped);
        return;
      }
      setFlipping(dir);
      window.setTimeout(() => {
        setPage(clamped);
        setFlipping(null);
      }, DURATION);
    },
    [flipping, page, reducedMotion, total],
  );

  const next = useCallback(() => goTo(page + 1), [goTo, page]);
  const prev = useCallback(() => goTo(page - 1), [goTo, page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modal) {
        if (e.key === "Escape") setModal(null);
        return;
      }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      else if (e.key === "Home") { e.preventDefault(); goTo(0); }
      else if (e.key === "End") { e.preventDefault(); goTo(total - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo, total, modal]);

  const currentContent = useMemo(() => renderPage(page, setModal), [page]);
  const prevContent = useMemo(() => renderPage(lastPage.current, setModal), [page]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-10"
      style={{
        background: "radial-gradient(circle at 20% 10%, #1f2937, #0b0f17 60%)",
        fontFamily: "Inter, sans-serif",
        color: "#f8fafc",
      }}
    >
      <header className="w-full max-w-5xl mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] opacity-80">
          <BookOpen size={16} /> Portfolio Book
        </div>
        <a
          href="/"
          className="text-xs uppercase tracking-[0.2em] opacity-70 hover:opacity-100 transition-opacity"
        >
          ← Back to home
        </a>
      </header>

      <div className="w-full max-w-5xl grid gap-6 md:grid-cols-[200px_1fr]">
        {/* TOC */}
        <nav aria-label="Table of contents" className="md:sticky md:top-6 self-start">
          <p className="text-[10px] uppercase tracking-[0.25em] opacity-60 mb-3">Contents</p>
          <ul className="space-y-1">
            {TOC.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => goTo(item.id)}
                  aria-current={page === item.id ? "page" : undefined}
                  className="w-full text-left text-sm px-3 py-2 rounded-md transition-colors"
                  style={{
                    background: page === item.id ? "rgba(255,255,255,0.08)" : "transparent",
                    color: page === item.id ? "#fff" : "rgba(255,255,255,0.65)",
                  }}
                >
                  <span className="opacity-50 mr-2 tabular-nums">{String(item.id).padStart(2, "0")}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Book */}
        <div className="relative" style={{ perspective: "2400px" }}>
          <div
            className="relative mx-auto"
            style={{
              width: "100%",
              maxWidth: 720,
              aspectRatio: "3 / 4",
              transformStyle: "preserve-3d",
            }}
            role="region"
            aria-roledescription="book"
            aria-label={`Page ${page + 1} of ${total}: ${TOC[page].label}`}
          >
            {/* Spine shadow */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 w-3 rounded-l-md"
              style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0))", zIndex: 30 }}
            />
            {/* Edge stack */}
            <div
              aria-hidden
              className="absolute -bottom-2 left-2 right-2 h-2 rounded-b-md"
              style={{ background: "rgba(255,255,255,0.08)", filter: "blur(1px)" }}
            />
            <div
              aria-hidden
              className="absolute -bottom-3 left-4 right-4 h-2 rounded-b-md"
              style={{ background: "rgba(255,255,255,0.05)", filter: "blur(2px)" }}
            />

            {/* Static (current) page */}
            <div
              key={`static-${page}`}
              className="absolute inset-0 rounded-md overflow-hidden shadow-2xl"
              style={{
                background: page === 0 ? coverGradient() : pageBackground(),
                animation: reducedMotion ? undefined : "fadeIn 400ms ease",
              }}
            >
              {currentContent}
            </div>

            {/* Flipping overlay */}
            {flipping && !reducedMotion && (
              <div
                aria-hidden
                className="absolute inset-0 rounded-md overflow-hidden shadow-2xl"
                style={{
                  transformOrigin: flipping === "next" ? "left center" : "right center",
                  animation: `${flipping === "next" ? "flipNext" : "flipPrev"} ${DURATION}ms cubic-bezier(0.4,0,0.2,1) forwards`,
                  background: lastPage.current === 0 ? coverGradient() : pageBackground(),
                  zIndex: 20,
                  backfaceVisibility: "hidden",
                }}
              >
                {prevContent}
              </div>
            )}

            {/* Controls */}
            <div className="absolute inset-x-0 -bottom-16 flex items-center justify-between px-2">
              <button
                onClick={prev}
                disabled={page === 0}
                aria-label="Previous page"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 disabled:opacity-30 hover:bg-white/10 transition"
              >
                <ArrowLeft size={16} /> Prev
              </button>
              <span className="text-xs uppercase tracking-[0.2em] opacity-60">
                {String(page + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
              <button
                onClick={next}
                disabled={page === total - 1}
                aria-label="Next page"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 disabled:opacity-30 hover:bg-white/10 transition"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${modal.title} details`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", animation: reducedMotion ? undefined : "fadeIn 200ms ease" }}
          onClick={() => setModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-2xl p-8 text-neutral-900"
            style={{ background: "#fff", animation: reducedMotion ? undefined : "popIn 220ms cubic-bezier(0.4,0,0.2,1)" }}
          >
            <button
              onClick={() => setModal(null)}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100"
            >
              <X size={18} />
            </button>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Featured project</p>
            <h3 style={{ fontFamily: "Anton, sans-serif", fontSize: 40, lineHeight: 1, letterSpacing: "-0.02em" }} className="mt-2 uppercase">
              {modal.title}
            </h3>
            <p className="text-sm text-neutral-600 mt-1">{modal.tagline}</p>

            <div className="mt-6 space-y-4">
              <Block label="Problem" text={modal.problem} />
              <Block label="Solution" text={modal.solution} />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">Stack</p>
                <div className="flex flex-wrap gap-2">
                  {modal.stack.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
        @keyframes flipNext {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-180deg); }
        }
        @keyframes flipPrev {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(180deg); }
        }
      `}</style>
    </div>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-1">{label}</p>
      <p className="text-sm text-neutral-800 leading-relaxed">{text}</p>
    </div>
  );
}

function coverGradient() {
  return "linear-gradient(135deg, #f4845f 0%, #e94e77 50%, #6b46c1 100%)";
}
function pageBackground() {
  return "linear-gradient(180deg, #fdfaf3 0%, #f3ecdc 100%)";
}

function PageShell({ title, children, dark = false }: { title?: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`h-full w-full p-8 sm:p-12 overflow-auto ${dark ? "text-white" : "text-neutral-900"}`}>
      {title && (
        <>
          <p className={`text-[10px] uppercase tracking-[0.3em] ${dark ? "opacity-70" : "text-neutral-500"}`}>Chapter</p>
          <h2
            style={{ fontFamily: "Anton, sans-serif", fontSize: "clamp(36px, 6vw, 64px)", lineHeight: 0.95, letterSpacing: "-0.02em" }}
            className="mt-1 uppercase"
          >
            {title}
          </h2>
          <div className={`h-px my-6 ${dark ? "bg-white/20" : "bg-neutral-300"}`} />
        </>
      )}
      {children}
    </div>
  );
}

function renderPage(i: number, openModal: (p: Project) => void) {
  switch (i) {
    case 0:
      return (
        <div className="h-full w-full flex flex-col justify-between p-10 sm:p-14 text-white">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] opacity-90">
            <Sparkles size={14} /> EagerBeaver · 2026
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] opacity-80">Portfolio</p>
            <h1
              style={{ fontFamily: "Anton, sans-serif", fontSize: "clamp(56px, 10vw, 120px)", lineHeight: 0.9, letterSpacing: "-0.02em" }}
              className="mt-3 uppercase"
            >
              The Book of<br /> EagerBeaver
            </h1>
            <p className="mt-6 max-w-md text-white/85">
              Senior Software Engineer crafting durable products from idea to ship.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] opacity-80">
            <GraduationCap size={14} /> Limkokwing University
          </div>
        </div>
      );
    case 1:
      return (
        <PageShell title="About">
          <p className="text-base leading-relaxed text-neutral-800">
            I'm <strong>EagerBeaver</strong>, a Senior Software Engineer studying at Limkokwing University.
            I build full-stack products with a bias for clean systems, fast UX, and durable architecture.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-sm text-neutral-700">
            <li className="p-4 rounded-lg bg-white/60 border border-neutral-200">6+ yrs shipping web products</li>
            <li className="p-4 rounded-lg bg-white/60 border border-neutral-200">TypeScript · React · Node · Postgres</li>
            <li className="p-4 rounded-lg bg-white/60 border border-neutral-200">Edge-first, serverless, realtime</li>
            <li className="p-4 rounded-lg bg-white/60 border border-neutral-200">Design-engineering mindset</li>
          </ul>
        </PageShell>
      );
    case 2:
      return (
        <PageShell title="Services">
          <div className="grid gap-4">
            {[
              { t: "Product Engineering", d: "End-to-end builds — discovery, architecture, ship." },
              { t: "Web Apps & Dashboards", d: "React, TanStack, Next.js. Fast, accessible, typed." },
              { t: "APIs & Data", d: "Postgres, Prisma, tRPC, event streams." },
              { t: "AI Integrations", d: "LLM features that actually ship to production." },
            ].map((s) => (
              <div key={s.t} className="p-5 rounded-xl border border-neutral-200 bg-white/70">
                <div className="flex items-center gap-2">
                  <Code2 size={16} className="text-neutral-500" />
                  <h3 className="font-semibold">{s.t}</h3>
                </div>
                <p className="text-sm text-neutral-600 mt-1">{s.d}</p>
              </div>
            ))}
          </div>
        </PageShell>
      );
    case 3:
      return (
        <PageShell title="Process">
          <ol className="space-y-5">
            {[
              ["Discover", "Audit goals, users, constraints. Define what 'done' looks like."],
              ["Design", "Wireframe flows, pick a stack, derisk the hard parts first."],
              ["Build", "Small PRs, instrumented from day one, daily demos."],
              ["Launch", "Ship behind flags, watch metrics, iterate weekly."],
            ].map(([t, d], idx) => (
              <li key={t} className="flex gap-4">
                <div className="shrink-0 w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-semibold">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{t}</h3>
                  <p className="text-sm text-neutral-600">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </PageShell>
      );
    case 4:
      return (
        <PageShell title="Featured Projects">
          <div className="grid gap-4">
            {PROJECTS.map((p) => (
              <div key={p.title} className="p-5 rounded-xl border border-neutral-200 bg-white/70 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-neutral-600">{p.tagline}</p>
                </div>
                <button
                  onClick={() => openModal(p)}
                  className="shrink-0 text-xs uppercase tracking-[0.2em] px-3 py-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-700 transition"
                >
                  Learn more
                </button>
              </div>
            ))}
          </div>
        </PageShell>
      );
    case 5:
      return (
        <PageShell title="Testimonials">
          <div className="space-y-5">
            {[
              { q: "EagerBeaver shipped what three contractors couldn't. Clean code, calm comms.", a: "— CTO, Fintech Startup" },
              { q: "He turned our messy data into a product. Our team finally trusts the dashboards.", a: "— Head of Ops, Logistics Co." },
              { q: "Rare blend of design taste and engineering rigor.", a: "— Design Director, Agency" },
            ].map((t) => (
              <figure key={t.a} className="p-5 rounded-xl border border-neutral-200 bg-white/70">
                <blockquote className="text-neutral-800">"{t.q}"</blockquote>
                <figcaption className="text-xs text-neutral-500 mt-2 uppercase tracking-[0.2em]">{t.a}</figcaption>
              </figure>
            ))}
          </div>
        </PageShell>
      );
    case 6:
      return (
        <PageShell title="Contact">
          <p className="text-neutral-700">Let's build something durable.</p>
          <a
            href="mailto:ebeaver091@gmail.com"
            className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-full bg-neutral-900 text-white hover:bg-neutral-700 transition"
          >
            <Mail size={16} /> ebeaver091@gmail.com
          </a>
          <p className="text-xs text-neutral-500 mt-8 uppercase tracking-[0.2em]">
            Limkokwing University · Open to senior roles
          </p>
        </PageShell>
      );
    default:
      return null;
  }
}