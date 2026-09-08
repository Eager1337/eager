import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowUpRight, Globe, Sparkles } from "lucide-react";

import { listShowcaseSites } from "../lib/site-builder.functions";

export const Route = createFileRoute("/showcase")({
  head: () => ({
    meta: [
      { title: "AI Build Showcase, live sites by Eager Beaver" },
      {
        name: "description",
        content:
          "Live previews of websites and apps built in the Eager Beaver AI builder, from landing pages to full product dashboards.",
      },
      { property: "og:title", content: "AI Build Showcase, Eager Beaver" },
      {
        property: "og:description",
        content: "Browse live previews of AI-built websites and apps, each opening in a full screen preview.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShowcasePage,
});

function ShowcasePage() {
  const list = useServerFn(listShowcaseSites);
  const { data, isPending, isError } = useQuery({
    queryKey: ["showcase-sites"],
    queryFn: () => list({}),
  });

  const sites = data?.sites ?? [];

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to the portfolio
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">AI Build Showcase</h1>
            <p className="mt-2 max-w-2xl text-white/55 leading-relaxed">
              Every site built or imported in the studio and marked as published lands here, with a live
              full screen preview.
            </p>
          </div>
        </div>

        {isPending ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
            ))}
          </div>
        ) : isError ? (
          <p className="mt-12 text-white/50">The showcase could not load right now. Please refresh.</p>
        ) : sites.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <Globe className="mx-auto h-8 w-8 text-white/40" />
            <p className="mt-4 text-white/55">
              No published builds yet. Publish one from the AI Website Builder in the dashboard and it
              appears here instantly.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <article
                key={site.slug}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:border-white/25"
              >
                <div className="aspect-[16/10] overflow-hidden bg-white/5">
                  {site.cover ? (
                    <img
                      src={site.cover}
                      alt={`${site.name} preview`}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-white/25">
                      <Globe className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-[11px] uppercase tracking-widest text-white/35">
                    {site.kind === "prompt" ? "Built from a prompt" : site.kind}
                  </span>
                  <h2 className="mt-2 text-lg font-semibold">{site.name}</h2>
                  {site.summary ? (
                    <p className="mt-2 line-clamp-3 text-sm text-white/55 leading-relaxed">{site.summary}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {site.hasSnapshot ? (
                      <Link
                        to="/site/$slug"
                        params={{ slug: site.slug }}
                        className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black"
                      >
                        Open preview <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                    {site.sourceUrl ? (
                      <a
                        href={site.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm"
                      >
                        Live site <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
