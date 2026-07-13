import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, FileText, Code2, Zap, BarChart3, Palette, BookOpen, Copy, Mail, Lightbulb, AlertCircle, Play } from "lucide-react";
import type { Project } from "../../data/projects";

type Tab = "overview" | "problem" | "solution" | "stack" | "demo" | "design" | "metrics" | "docs" | "contact";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "problem", label: "Problem", icon: AlertCircle },
  { id: "solution", label: "Solution", icon: Lightbulb },
  { id: "stack", label: "Tech", icon: Code2 },
  { id: "demo", label: "Demo", icon: Play },
  { id: "design", label: "Design", icon: Palette },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
  { id: "docs", label: "Docs", icon: BookOpen },
  { id: "contact", label: "Clone / Contact", icon: Mail },
];

export function ProjectDetailModal({
  project,
  open,
  onClose,
}: {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (open) setTab("overview");
  }, [open, project?.slug]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", damping: 24, stiffness: 240 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 text-white shadow-2xl"
          >
            {/* Left header strip */}
            <div
              className="relative hidden w-64 shrink-0 flex-col p-6 md:flex"
              style={{ background: project.preview }}
            >
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-white/80">{project.category}</div>
                <h2 className="mt-3 text-2xl font-black leading-tight">{project.title}</h2>
                <p className="mt-2 text-sm text-white/80">{project.tagline}</p>
              </div>
              <nav className="relative mt-8 flex flex-col gap-1">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all ${tab === id ? "bg-white text-black" : "text-white/85 hover:bg-white/10"}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              {/* Mobile tabs */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 md:px-8">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-white/60">{project.category} · /explore/{project.slug}</div>
                  <div className="truncate text-lg font-bold md:hidden">{project.title}</div>
                </div>
                <button onClick={onClose} className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 px-5 py-2 md:hidden">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${tab === id ? "bg-white text-black" : "text-white/70 hover:bg-white/10"}`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8 md:py-8">
                {tab === "overview" && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                      <h3 className="text-xl font-bold">Overview</h3>
                      <p className="mt-3 text-white/75">{project.tagline}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {project.metrics.map((m) => (
                        <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-2xl font-black tracking-tight">{m.value}</div>
                          <div className="mt-1 text-[10px] uppercase tracking-widest text-white/60">{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card title="Problem" icon={AlertCircle}>{project.problem}</Card>
                      <Card title="Solution" icon={Lightbulb}>{project.solution}</Card>
                    </div>
                  </div>
                )}
                {tab === "problem" && <Card title="The real pain point" icon={AlertCircle}>{project.problem}</Card>}
                {tab === "solution" && <Card title="Our approach" icon={Lightbulb}>{project.solution}</Card>}
                {tab === "stack" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Stack & architecture</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.stack.map((s) => (
                        <span key={s} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm">{s}</span>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                      <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-white/70">{`┌─────────────────────────────┐
│  Edge / CDN  (Cloudflare)   │
├─────────────────────────────┤
│  ${project.stack[0] ?? "Next.js"} (SSR + RSC)        │
├─────────────────────────────┤
│  API · Auth · Realtime      │
├─────────────────────────────┤
│  ${project.stack[1] ?? "Postgres"} + Redis cache    │
└─────────────────────────────┘`}</pre>
                    </div>
                  </div>
                )}
                {tab === "demo" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Watch the demo</h3>
                    <div className="flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 text-white/60">
                      <div className="text-center">
                        <Play className="mx-auto h-10 w-10" />
                        <div className="mt-3 text-sm">Live demo opens in a new tab, request access below.</div>
                      </div>
                    </div>
                  </div>
                )}
                {tab === "design" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Design exploration</h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-[4/5] rounded-xl border border-white/10" style={{ background: project.preview, opacity: 0.6 + (i % 3) * 0.1 }} />
                      ))}
                    </div>
                  </div>
                )}
                {tab === "metrics" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Performance & impact</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {project.metrics.map((m) => (
                        <div key={m.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                          <div className="text-[11px] uppercase tracking-widest text-white/60">{m.label}</div>
                          <div className="mt-2 text-3xl font-black">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tab === "docs" && (
                  <div className="space-y-3 text-white/75">
                    <h3 className="text-xl font-bold">Documentation</h3>
                    <p>Architecture diagrams, API references, deploy guides and runbooks are bundled with every shipped project. Request the full doc set via the contact tab.</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs">Architecture</span>
                      <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs">API Reference</span>
                      <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs">Runbook</span>
                      <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs">Security review</span>
                    </div>
                  </div>
                )}
                {tab === "contact" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Clone this concept or talk to me</h3>
                    <p className="text-white/70">Want a private deployment of {project.title}, a tailored variant for your org, or a discovery call?</p>
                    <form onSubmit={(e) => e.preventDefault()} className="grid gap-3">
                      <input className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none" placeholder="Your name" />
                      <input className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none" placeholder="Work email" />
                      <textarea rows={4} className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none" placeholder={`Tell me what you'd build with ${project.title}…`} />
                      <div className="flex flex-wrap gap-3">
                        <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90"><Zap className="h-4 w-4" /> Send inquiry</button>
                        <button type="button" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"><Copy className="h-4 w-4" /> Clone concept</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white/85">
        <Icon className="h-4 w-4" /> {title}
      </div>
      <p className="text-white/75">{children}</p>
    </div>
  );
}