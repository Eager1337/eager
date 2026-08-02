import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { PROJECT_DETAILS } from "../data/site-pages";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => {
    const project = PROJECT_DETAILS[params.slug];
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Project not found" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.project;
    const description = `${p.tagline} ${p.outcome}`;
    return {
      meta: [
        { title: `${p.name} Case Study | Project Details` },
        { name: "description", content: description },
        { property: "og:title", content: `${p.name} Case Study` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProjectDetailRoute,
  errorComponent: () => <Missing />,
  notFoundComponent: () => <Missing />,
});

function Missing() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-20">
      <h1 className="text-2xl font-bold">That project is not available</h1>
      <Link to="/projects" className="mt-4 inline-flex text-sm font-semibold text-primary">
        Browse all projects
      </Link>
    </main>
  );
}

function ProjectDetailRoute() {
  const { project } = Route.useLoaderData();
  const rows: { label: string; value: string }[] = [
    { label: "Role", value: project.role },
    { label: "Timeline", value: project.timeline },
    { label: "Stack", value: project.stack.join(", ") },
  ];
  const sections: { label: string; value: string }[] = [
    { label: "The problem", value: project.problem },
    { label: "What I built", value: project.solution },
    { label: "The result", value: project.outcome },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <Link
          to="/projects"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All projects
        </Link>
        <Reveal>
          <p className="mt-8 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
            Project details
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{project.name}</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{project.tagline}</p>
        </Reveal>

        <Reveal delay={0.05}>
          <dl className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-3">
            {rows.map((r) => (
              <div key={r.label}>
                <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">{r.label}</dt>
                <dd className="mt-1 text-sm font-medium">{r.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {sections.map((s, i) => (
          <Reveal key={s.label} delay={0.05 + i * 0.05}>
            <section className="mt-10">
              <h2 className="text-lg font-semibold">{s.label}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.value}</p>
            </section>
          </Reveal>
        ))}

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Start a similar project
            </Link>
            <Link
              to="/case-studies"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-border px-5 text-sm font-semibold"
            >
              Read the case studies
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
