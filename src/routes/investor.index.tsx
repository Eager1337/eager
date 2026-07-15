import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Shield, Bug, Network, Wrench, ArrowRight } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/Reveal";
import { investorPages } from "@/data/investor";

const icons = {
  cybersecurity: Shield,
  "ethical-hacking": Bug,
  "network-engineering": Network,
  "it-services": Wrench,
} as const;

export const Route = createFileRoute("/investor/")({
  head: () => ({
    meta: [
      { title: "Investor Suite, Cybersecurity, Ethical Hacking, Network & IT" },
      {
        name: "description",
        content:
          "Investor-facing capability pages: cybersecurity, ethical hacking, network engineering, and managed IT services with measurable outcomes.",
      },
      { property: "og:title", content: "Investor Suite" },
      { property: "og:description", content: "Capability pages with measurable outcomes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvestorIndex,
  notFoundComponent: () => {
    throw notFound();
  },
});

function InvestorIndex() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.35),transparent_45%),radial-gradient(circle_at_75%_75%,rgba(236,72,153,0.25),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80 backdrop-blur">
              Investor Suite
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] text-white sm:text-6xl">
              Four practices. One operator. Measurable outcomes.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 max-w-2xl text-base text-white/80 sm:text-lg">
              Deep capability across security, offensive testing, networking, and managed
              IT. Each practice ships with KPIs, case studies, and a fixed-price scoping
              path.
            </p>
          </Reveal>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <RevealStagger className="grid gap-5 sm:grid-cols-2">
          {investorPages.map((page) => {
            const Icon = icons[page.slug];
            return (
              <RevealItem key={page.slug}>
                <Link
                  to="/investor/$slug"
                  params={{ slug: page.slug }}
                  className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div>
                    <div
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                      style={{ background: page.gradient }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {page.eyebrow}
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">
                      {page.headline}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {page.lede}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary">
                    Explore practice
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </section>
    </div>
  );
}