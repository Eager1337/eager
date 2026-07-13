import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Bookmark, BookmarkCheck, GitCompare, ArrowUpRight } from "lucide-react";
import { CATEGORIES, type Project, type ProjectCategory } from "../data/projects";
import { useContent } from "../lib/content-store";
import { ProjectCard } from "../components/portfolio-os/ProjectCard";
import { ProjectDetailModal } from "../components/portfolio-os/ProjectDetailModal";
import { trackEvent } from "../lib/portfolio-os-settings";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore, 50 production-grade case studies" },
      {
        name: "description",
        content:
          "Browse 50 showcase websites across education, medical, government, AI, creator economy, advanced systems and more.",
      },
      { property: "og:title", content: "Explore 50 Sites, Portfolio OS" },
      {
        property: "og:description",
        content: "Filter, search, and dive into 50 production-grade case studies.",
      },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<ProjectCategory | "All">("All");
  const [open, setOpen] = useState<Project | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const { projects: PROJECTS } = useContent();

  const openProject = (p: Project) => {
    trackEvent("project", p.slug);
    setOpen(p);
  };

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      if (active !== "All" && p.category !== active) return false;
      if (q) {
        const s = q.toLowerCase();
        return (
          p.title.toLowerCase().includes(s) ||
          p.tagline.toLowerCase().includes(s) ||
          p.stack.join(" ").toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [q, active, PROJECTS]);

  const toggleBookmark = (slug: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.12),transparent_50%)]" />

      <header className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="mt-6 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
              /explore
            </div>
            <h1
              className="mt-2 text-4xl font-black tracking-tight sm:text-6xl"
              style={{ fontFamily: "'Kanit', sans-serif" }}
            >
              50 production-grade
              <br />
              <span className="bg-gradient-to-r from-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
                case studies
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <GitCompare className="mr-1.5 inline h-3 w-3" />
              Compare mode
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <BookmarkCheck className="mr-1.5 inline h-3 w-3" />
              {bookmarks.size} saved
            </span>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
          <Search className="h-4 w-4 text-white/60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Live search across 50 projects, try 'AI', 'Sierra Leone', or 'Postgres'…"
            className="flex-1 bg-transparent text-sm placeholder:text-white/40 focus:outline-none"
          />
          <span className="text-[10px] text-white/40">{filtered.length} match</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${active === c ? "border-white bg-white text-black" : "border-white/15 text-white/70 hover:border-white/30 hover:text-white"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <motion.div
          layout
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((p) => (
            <div key={p.slug} className="relative">
              <ProjectCard project={p} onOpen={() => openProject(p)} />
              <Link
                to="/landing/$slug"
                params={{ slug: p.slug }}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur hover:bg-black/70"
              >
                Landing <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(p.slug);
                }}
                className="absolute right-3 top-3 z-20 rounded-full bg-black/40 p-2 text-white backdrop-blur hover:bg-black/60"
                aria-label="Bookmark project"
              >
                {bookmarks.has(p.slug) ? (
                  <BookmarkCheck className="h-4 w-4 text-amber-300" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </motion.div>
        {filtered.length === 0 && (
          <div className="py-24 text-center text-white/50">
            No projects match, try another filter.
          </div>
        )}
      </main>

      <ProjectDetailModal project={open} open={!!open} onClose={() => setOpen(null)} />
    </div>
  );
}
