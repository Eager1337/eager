import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PROJECTS, type Project } from "../data/projects";
import { useEffect, useState } from "react";
import { ProjectDetailModal } from "../components/portfolio-os/ProjectDetailModal";
import { trackEvent } from "../lib/portfolio-os-settings";
import { useContent } from "../lib/content-store";

export const Route = createFileRoute("/explore/$slug")({
  head: () => ({
    meta: [
      { title: "Explore case study, Eager Beaver" },
      { name: "description", content: "Premium project case study with metrics, problem, solution, stack, and conversion CTA." },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="text-sm uppercase tracking-widest text-white/60">404</div>
        <h1 className="mt-2 text-2xl font-bold">Project not found</h1>
        <Link to="/explore" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center text-sm text-white/70">{error.message}</div>
    </div>
  ),
  component: ProjectPage,
});

function ProjectPage() {
  const { slug } = Route.useParams();
  const { projects } = useContent();
  const project = projects.find((p) => p.slug === slug) ?? PROJECTS.find((p) => p.slug === slug);
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (project) trackEvent("project", project.slug);
  }, [project]);
  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
        <div>
          <div className="text-sm uppercase tracking-widest text-white/60">404</div>
          <h1 className="mt-2 text-2xl font-bold">Project not found</h1>
          <Link to="/explore" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
            <ArrowLeft className="h-4 w-4" /> Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const related = projects.filter((p) => p.category === project.category && p.slug !== project.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="relative h-[60vh] w-full overflow-hidden" style={{ background: project.preview }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-neutral-950" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-between px-6 py-10">
          <Link to="/explore" className="inline-flex w-fit items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur hover:bg-black/60">
            <ArrowLeft className="h-3.5 w-3.5" /> All projects
          </Link>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80">{project.category}</div>
            <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-7xl" style={{ fontFamily: "'Kanit', sans-serif" }}>
              {project.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/85">{project.tagline}</p>
            <button
              onClick={() => setOpen(true)}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90"
            >
              Open case study <ArrowUpRight className="h-4 w-4" />
            </button>
            <Link
              to="/landing/$slug"
              params={{ slug: project.slug }}
              className="ml-3 mt-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Premium landing <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {project.metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-3xl font-black tracking-tight">{m.value}</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-white/60">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-white/60">Problem</div>
            <p className="mt-3 text-white/85">{project.problem}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-white/60">Solution</div>
            <p className="mt-3 text-white/85">{project.solution}</p>
          </div>
        </div>

        <div className="mt-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/60">Stack</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <span key={s} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm">{s}</span>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/60">Feature set</div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {project.features.map((f) => (
              <li key={f} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/85">{f}</li>
            ))}
          </ul>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <div className="text-xs font-semibold uppercase tracking-widest text-white/60">More in {project.category}</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <Link key={p.slug} to="/explore/$slug" params={{ slug: p.slug }} className="group block overflow-hidden rounded-2xl border border-white/10 hover:border-white/30">
                  <div className="h-24" style={{ background: p.preview }} />
                  <div className="p-3">
                    <div className="text-sm font-semibold">{p.title}</div>
                    <div className="text-[11px] text-white/60">{p.tagline}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <ProjectDetailModal project={project} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}