import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Search, Sun, X, ArrowRight, LayoutDashboard, LayoutGrid, User, BarChart3, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PAGES } from "../data/pages";
import { FEATURES } from "../data/features";
import { useContent } from "../lib/content-store";
import { useInvestorMode } from "../lib/investor-mode";

type Result = { id: string; label: string; meta: string; to: string };

export function GlobalSiteTools() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, legends, landings } = useContent();
  const { investorMode, toggle: toggleInvestor, hydrated: investorHydrated } = useInvestorMode();
  const onAbout = location.pathname === "/portfolio";

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-theme-mode") as "dark" | "light" | null;
    const next = saved ?? "dark";
    setTheme(next);
    document.documentElement.dataset.themeMode = next;
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.themeMode = next;
    window.localStorage.setItem("portfolio-theme-mode", next);
  };

  const items = useMemo<Result[]>(() => [
    { id: "home", label: "Home", meta: "Page", to: "/" },
    { id: "explore", label: "Explore projects", meta: "Project grid", to: "/explore" },
    { id: "legends", label: "Legends", meta: "Cinematic pages", to: "/legends" },
    { id: "portfolio", label: "About Eager Beaver", meta: "Portfolio", to: "/portfolio" },
    ...projects.map((p) => ({ id: `p-${p.slug}`, label: p.title, meta: `${p.category} case study`, to: `/explore/${p.slug}` })),
    ...projects.map((p) => ({ id: `pl-${p.slug}`, label: `${p.title} landing`, meta: "Premium landing page", to: `/landing/${p.slug}` })),
    ...legends.map((l) => ({ id: `l-${l.slug}`, label: l.title, meta: "Legend", to: `/legends/${l.slug}` })),
    ...landings.map((l) => ({ id: `c-${l.slug}`, label: l.title, meta: "Custom landing", to: `/landing/${l.slug}` })),
    ...PAGES.slice(0, 50).map((p) => ({ id: `os-${p.slug}`, label: p.title, meta: `Portfolio OS · ${p.group}`, to: `/portfolio-os/${p.slug}` })),
    ...FEATURES.slice(0, 50).map((f) => ({ id: `f-${f.id}`, label: f.name, meta: `Feature · ${f.group}`, to: `/portfolio-os#feature-${f.id}` })),
  ], [landings, legends, projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 10);
    return items.filter((item) => `${item.label} ${item.meta}`.toLowerCase().includes(q)).slice(0, 18);
  }, [items, query]);

  const go = (to: string) => {
    setSearchOpen(false);
    setQuery("");
    navigate({ to: to as never });
  };

  return (
    <>
      <AnimatePresence>
        {investorHydrated && investorMode && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed inset-x-0 top-0 z-[130] border-b border-amber-300/40 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-black shadow-xl"
          >
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2 text-center text-[12px] font-semibold sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" /> Investor Mode
              </span>
              <span className="opacity-80">Ships production apps in weeks, not months</span>
              <span className="opacity-80">50+ features across 52 shipped pages</span>
              <span className="opacity-80">Full-stack · systems · measurable impact</span>
              <button
                onClick={toggleInvestor}
                className="rounded-full bg-black/85 px-3 py-1 text-[11px] font-bold text-amber-300 hover:bg-black"
              >
                Exit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-3 left-3 right-3 z-[120] grid grid-cols-[auto_auto_1fr] items-center gap-2 sm:left-auto sm:right-4 sm:flex sm:w-auto">
        <button
          onClick={() => setSearchOpen(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-black/75 px-4 text-xs font-semibold text-white shadow-2xl backdrop-blur-xl transition-colors hover:bg-black sm:min-w-40 sm:justify-start"
        >
          <Search className="h-4 w-4" /> <span className="hidden sm:inline">Search</span>
        </button>
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark and light mode"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/75 text-white shadow-2xl backdrop-blur-xl transition-colors hover:bg-black"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <div className="flex min-w-0 justify-end gap-2 overflow-x-auto sm:overflow-visible">
          <button
            onClick={toggleInvestor}
            aria-pressed={investorMode}
            title="Investor Mode: pitch-focused messaging"
            className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-2xl backdrop-blur-xl transition-colors ${
              investorHydrated && investorMode
                ? "border-amber-300/60 bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:opacity-90"
                : "border-white/20 bg-black/75 text-white hover:bg-black"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />{" "}
            {investorHydrated && investorMode ? "Investor: ON" : "Investor Mode"}
          </button>
          <Link
            to="/portfolio"
            aria-current={onAbout ? "page" : undefined}
            className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-2xl backdrop-blur-xl ${
              onAbout
                ? "border-fuchsia-400/60 bg-gradient-to-r from-fuchsia-500/30 to-sky-500/30 text-white ring-1 ring-fuchsia-400/50"
                : "border-white/20 bg-black/75 text-white hover:bg-black"
            }`}
          >
            <User className="h-3.5 w-3.5" /> About
          </Link>
          <Link to="/portfolio-os" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-xl hover:bg-black">
            <LayoutGrid className="h-3.5 w-3.5" /> Portfolio OS
          </Link>
          <Link to="/admin" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-xl hover:bg-black">
            <LayoutDashboard className="h-3.5 w-3.5" /> Admin
          </Link>
          <Link to="/portfolio-os/suite" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500 px-3 text-xs font-semibold text-white shadow-2xl hover:opacity-90">
            <BarChart3 className="h-3.5 w-3.5" /> Suite
          </Link>
        </div>


      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[350] bg-black/75 p-3 pt-16 backdrop-blur-xl sm:p-6 sm:pt-[12vh]"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 text-white shadow-2xl"
            >
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/10 px-4 py-4">
                <Search className="h-5 w-5 text-white/60" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find Explore projects, Legends, pages, case studies…"
                  className="min-w-0 bg-transparent text-base outline-none placeholder:text-white/35"
                />
                <button onClick={() => setSearchOpen(false)} className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Close search">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[65vh] overflow-y-auto p-2">
                {filtered.map((item) => (
                  <button key={item.id} onClick={() => go(item.to)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-4 py-3 text-left hover:bg-white/10">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{item.label}</span>
                      <span className="block truncate text-xs text-white/50">{item.meta}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </button>
                ))}
                {filtered.length === 0 && <div className="px-4 py-10 text-center text-sm text-white/50">No matching result.</div>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}