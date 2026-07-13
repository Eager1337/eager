import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { Search, ArrowRight } from "lucide-react";
import { PROJECTS } from "../../data/projects";
import { PAGES } from "../../data/pages";
import { FEATURES } from "../../data/features";
import { useContent } from "../../lib/content-store";

interface Item { id: string; label: string; kind: "page" | "project" | "feature" | "legend" | "landing"; to: string }

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { projects, legends, landings } = useContent();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onCustom = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onCustom);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onCustom);
    };
  }, []);

  const liveProjects = projects.length ? projects : PROJECTS;
  const items: Item[] = useMemo(() => [
    { id: "home", label: "Home", kind: "page", to: "/" },
    { id: "explore", label: "Explore, 50 projects", kind: "page", to: "/explore" },
    { id: "portfolio-os", label: "Portfolio OS, 50 features", kind: "page", to: "/portfolio-os" },
    ...liveProjects.map((p) => ({ id: `proj-${p.slug}`, label: `${p.title} · ${p.category}`, kind: "project" as const, to: `/explore/${p.slug}` })),
    ...liveProjects.map((p) => ({ id: `landing-${p.slug}`, label: `${p.title} landing page`, kind: "landing" as const, to: `/landing/${p.slug}` })),
    ...legends.map((l) => ({ id: `legend-${l.slug}`, label: `${l.title} · Legend`, kind: "legend" as const, to: `/legends/${l.slug}` })),
    ...landings.map((l) => ({ id: `custom-${l.slug}`, label: `${l.title} · Custom landing`, kind: "landing" as const, to: `/landing/${l.slug}` })),
    ...PAGES.map((p) => ({ id: `page-${p.slug}`, label: `${p.title} · ${p.group}`, kind: "page" as const, to: `/portfolio-os/${p.slug}` })),
    ...FEATURES.map((f) => ({ id: `feat-${f.id}`, label: `${f.name} · ${f.group}`, kind: "feature" as const, to: `/portfolio-os#feature-${f.id}` })),
  ], [landings, legends, liveProjects]);

  const filtered = useMemo(() => {
    if (!q) return items.slice(0, 12);
    const lower = q.toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(lower)).slice(0, 20);
  }, [q, items]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/95 text-white shadow-2xl backdrop-blur"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-4 w-4 text-white/60" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search projects, pages, features…"
                className="w-full bg-transparent text-sm placeholder:text-white/40 focus:outline-none"
              />
              <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60">ESC</kbd>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-white/50">No results</li>}
              {filtered.map((it) => (
                <li key={it.id}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      setQ("");
                      navigate({ to: it.to });
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-white/10"
                  >
                    <span className="flex items-center gap-3">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] uppercase tracking-widest ${it.kind === "project" ? "bg-violet-500/20 text-violet-200" : it.kind === "page" ? "bg-sky-500/20 text-sky-200" : it.kind === "legend" ? "bg-rose-500/20 text-rose-200" : it.kind === "landing" ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-200"}`}>
                        {it.kind}
                      </span>
                      {it.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-white/40" />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}