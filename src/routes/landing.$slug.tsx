import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, CheckCircle2, Code2 } from "lucide-react";
import { useContent } from "../lib/content-store";
import { PROJECTS } from "../data/projects";

export const Route = createFileRoute("/landing/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug}, Landing` },
      { name: "description", content: "A custom landing page." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Landing page not found</h1>
        <Link to="/" className="mt-4 inline-block text-sky-300 hover:underline">
          ← Home
        </Link>
      </div>
    </div>
  ),
  component: LandingPage,
});

function LandingPage() {
  const { slug } = Route.useParams();
  const { landings, projects } = useContent();
  const custom = landings.find((x) => x.slug === slug);
  const project = projects.find((x) => x.slug === slug) ?? PROJECTS.find((x) => x.slug === slug);
  const l = custom ?? (project && {
    slug: project.slug,
    title: project.title,
    kicker: `${project.category} case study`,
    tagline: project.tagline,
    body: `${project.problem}\n\n${project.solution}`,
    image: "",
    accent: project.accent,
    bg: "#050510",
    ctaLabel: "Open full case study",
    ctaHref: `/explore/${project.slug}`,
  });
  if (!l) throw notFound();

  const isExternal = /^https?:\/\//i.test(l.ctaHref);
  const stats = project?.metrics ?? [
    { label: "Launch speed", value: "Fast" },
    { label: "Pages", value: "1" },
    { label: "Focus", value: "Premium" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-white" style={{ background: `linear-gradient(135deg, ${l.bg}, #030308 70%)` }}>
      {/* animated glow */}
      <motion.div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: l.accent, opacity: 0.35 }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at top, black 30%, transparent 80%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </Link>

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.86fr)] lg:items-center">
          <div className="min-w-0">
            {l.kicker && (
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.24em] sm:tracking-[0.35em]"
                style={{ color: l.accent }}
              >
                {l.kicker}
              </div>
            )}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-3 max-w-4xl text-4xl font-black leading-[0.96] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ fontFamily: "'Kanit', sans-serif" }}
            >
              {l.title}
            </motion.h1>
            {l.tagline && <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">{l.tagline}</p>}
            {l.body && (
              <p className="mt-6 max-w-xl whitespace-pre-line text-sm leading-relaxed text-white/70 sm:text-base">
                {l.body}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {isExternal ? (
                <a
                  href={l.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
                  style={{ background: l.accent }}
                >
                  {l.ctaLabel}{" "}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              ) : (
                <Link
                  to={l.ctaHref as string}
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
                  style={{ background: l.accent }}
                >
                  {l.ctaLabel}{" "}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
              <Link
                to="/explore"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold hover:bg-white/10"
              >
                Explore case studies
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {stats.slice(0, 3).map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-2xl font-black" style={{ color: l.accent }}>{stat.value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-widest text-white/55">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10" style={{ background: project?.preview ?? l.accent }}>
              {l.image ? (
                <img src={l.image} alt={l.title} className="aspect-[16/10] h-full w-full object-cover" />
              ) : (
                <div className="grid aspect-[16/10] place-items-center p-8 text-center">
                  <div>
                    <BarChart3 className="mx-auto h-9 w-9 text-white/75" />
                    <div className="mt-3 text-2xl font-black" style={{ fontFamily: "'Kanit', sans-serif" }}>{l.title}</div>
                    <div className="mt-2 text-sm text-white/70">Premium landing generated from the live case study.</div>
                  </div>
                </div>
              )}
            </div>
            {project ? (
              <div className="mt-4 grid gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/55"><Code2 className="h-4 w-4" /> Stack</div>
                <div className="flex flex-wrap gap-2">
                  {project.stack.slice(0, 6).map((s) => <span key={s} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs">{s}</span>)}
                </div>
                <div className="grid gap-2">
                  {project.features.slice(0, 3).map((feature) => <div key={feature} className="flex items-center gap-2 text-sm text-white/75"><CheckCircle2 className="h-4 w-4" style={{ color: l.accent }} /> {feature}</div>)}
                </div>
                <Link to="/explore/$slug" params={{ slug: project.slug }} className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90">
                  Go to case study <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              null
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
