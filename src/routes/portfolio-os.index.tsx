import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { FEATURES, FEATURE_GROUPS, type Feature } from "../data/features";
import { PAGES, PAGE_GROUPS } from "../data/pages";

export const Route = createFileRoute("/portfolio-os/")({
  head: () => ({
    meta: [
      { title: "Portfolio OS, 50 features + 50 pages" },
      { name: "description", content: "Inspect every feature and every page that powers the portfolio operating system." },
      { property: "og:title", content: "Portfolio OS" },
      { property: "og:description", content: "50 investor-grade features + 50 pages, all interactive." },
    ],
  }),
  component: PortfolioOSIndex,
});

function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.Square;
  return <Cmp className={className} />;
}

function PortfolioOSIndex() {
  const [tab, setTab] = useState<"features" | "pages">("features");
  const featuresByGroup = useMemo(() => {
    const map = new Map<string, Feature[]>();
    FEATURE_GROUPS.forEach((g) => map.set(g, FEATURES.filter((f) => f.group === g)));
    return map;
  }, []);

  return (
    <div className="mx-auto max-w-7xl overflow-hidden px-5 py-10 pb-28 sm:px-6 sm:py-14">
      <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">/portfolio-os</div>
      <h1 className="mt-2 max-w-5xl text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl" style={{ fontFamily: "'Kanit', sans-serif" }}>
        The operating system<br />
        <span className="bg-gradient-to-r from-fuchsia-400 to-sky-400 bg-clip-text text-transparent">behind the portfolio</span>
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
        50 investor-grade features and 50 pages, organized like a real OS. Press <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px]">⌘K</kbd> to jump to any one.
      </p>

      <div className="mt-8 inline-grid w-full grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur sm:w-auto">
        {(["features", "pages"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-3 text-[11px] font-semibold uppercase tracking-widest transition-colors sm:px-5 sm:py-2 sm:text-xs ${tab === t ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
          >
            {t === "features" ? "50 Features" : "50 Pages"}
          </button>
        ))}
      </div>

      {tab === "features" && (
        <div className="mt-10 space-y-12">
          {FEATURE_GROUPS.map((group) => (
            <section key={group}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">{group}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(featuresByGroup.get(group) ?? []).map((f) => (
                  <motion.div
                    key={f.id}
                    id={`feature-${f.id}`}
                    whileHover={{ y: -4 }}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur transition-colors hover:border-white/25"
                  >
                    <div className="flex items-start justify-between">
                      <Icon name={f.icon} className="h-5 w-5 text-white/80" />
                      <span className={`text-[9px] font-semibold uppercase tracking-widest ${f.status === "live" ? "text-emerald-400" : f.status === "beta" ? "text-amber-400" : "text-white/40"}`}>
                        {f.status}
                      </span>
                    </div>
                    <div className="mt-4 text-[10px] font-mono text-white/40">#{String(f.id).padStart(2, "0")}</div>
                    <h3 className="mt-1 text-sm font-bold">{f.name}</h3>
                    <p className="mt-2 text-xs text-white/65">{f.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === "pages" && (
        <div className="mt-10 space-y-12">
          {PAGE_GROUPS.map((group) => (
            <section key={group}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">{group}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {PAGES.filter((p) => p.group === group).map((p) => (
                  <Link
                    key={p.slug}
                    to="/portfolio-os/$slug"
                    params={{ slug: p.slug }}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/25"
                  >
                    <div className="text-[10px] font-mono text-white/40">/{p.slug}</div>
                    <div className="mt-1 text-sm font-bold">{p.title}</div>
                    <div className="mt-2 text-xs text-white/65 line-clamp-2">{p.blurb}</div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}