import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Construction } from "lucide-react";
import { getPage, PAGES } from "../data/pages";

export const Route = createFileRoute("/portfolio-os/$slug")({
  loader: ({ params }) => {
    const page = getPage(params.slug);
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.page.title}, Portfolio OS` },
      { name: "description", content: loaderData.page.blurb },
      { property: "og:title", content: `${loaderData.page.title}, Portfolio OS` },
      { property: "og:description", content: loaderData.page.blurb },
    ] : [],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center text-white">
      <Link to="/portfolio-os" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">Back to Portfolio OS</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-8 text-white/70">{error.message}</div>
  ),
  component: GenericPage,
});

function GenericPage() {
  const { page } = Route.useLoaderData();
  const siblings = PAGES.filter((p) => p.group === page.group && p.slug !== page.slug);

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 text-white">
      <Link to="/portfolio-os" className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> Portfolio OS
      </Link>
      <div className="mt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">{page.group} · /{page.slug}</div>
      <h1 className="mt-2 text-5xl font-black tracking-tight sm:text-7xl" style={{ fontFamily: "'Kanit', sans-serif" }}>
        {page.title}
      </h1>
      <p className="mt-4 max-w-2xl text-white/70">{page.blurb}</p>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/70">
            <Construction className="h-3.5 w-3.5" /> Section preview
          </div>
          <p className="mt-4 text-white/80 leading-relaxed">
            This is the <strong>{page.title}</strong> surface of the Portfolio Operating System. The route is fully wired,
            SEO-tagged and discoverable from the command palette (⌘K). The deep content layout is built per page in Phase 3, from cinematic typography for narrative pages, to live charts on Metrics, to a real proposal generator on Pricing
            and a working AI assistant on /ai-assistant.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Cinematic motion", "Live data", "Investor-grade copy"].map((t) => (
              <div key={t} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/70">{t}</div>
            ))}
          </div>
        </div>
        <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/60">More in {page.group}</div>
          <ul className="mt-3 space-y-1">
            {siblings.map((s) => (
              <li key={s.slug}>
                <Link to="/portfolio-os/$slug" params={{ slug: s.slug }} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                  {s.title} <ArrowUpRight className="h-3.5 w-3.5 text-white/40" />
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}