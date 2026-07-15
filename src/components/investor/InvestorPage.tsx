import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { type ReactNode } from "react";
import { Reveal, RevealStagger, RevealItem } from "@/components/Reveal";

export type InvestorMetric = { label: string; value: string; note?: string };
export type InvestorPillar = { title: string; body: string; icon?: ReactNode };

export function InvestorPage({
  eyebrow,
  title,
  lede,
  gradient,
  metrics,
  pillars,
  services,
  outcomes,
  cta,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  gradient: string;
  metrics: InvestorMetric[];
  pillars: InvestorPillar[];
  services: string[];
  outcomes: { label: string; body: string }[];
  cta: { title: string; body: string };
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="relative overflow-hidden border-b border-border"
        style={{ background: gradient }}
      >
        <div className="absolute inset-0 opacity-30 mix-blend-overlay [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <Link
            to="/investor"
            className="mb-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Investor Suite
          </Link>
          <Reveal direction="up">
            <div className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
              {eyebrow}
            </div>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] text-white sm:text-6xl">
              {title}
            </h1>
          </Reveal>
          <Reveal direction="up" delay={0.2}>
            <p className="mt-5 max-w-2xl text-base text-white/85 sm:text-lg">{lede}</p>
          </Reveal>
          <RevealStagger className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {metrics.map((m) => (
              <RevealItem
                key={m.label}
                className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur"
              >
                <div className="text-2xl font-black text-white sm:text-3xl">{m.value}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/70">
                  {m.label}
                </div>
                {m.note ? (
                  <div className="mt-2 text-xs text-white/60">{m.note}</div>
                ) : null}
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <Reveal>
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Core pillars
          </h2>
        </Reveal>
        <RevealStagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <RevealItem
              key={p.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-lg font-bold text-foreground">{p.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </RevealItem>
          ))}
        </RevealStagger>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1.2fr]">
          <Reveal direction="right">
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">
              What I deliver
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              End-to-end capability, sold as outcomes not hours. Every engagement ships
              with measurable KPIs and a written handover.
            </p>
          </Reveal>
          <RevealStagger className="grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <RevealItem
                key={s}
                className="flex items-start gap-3 rounded-xl border border-border bg-background p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{s}</span>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <Reveal>
          <h2 className="text-3xl font-black leading-tight sm:text-4xl">
            Measurable outcomes
          </h2>
        </Reveal>
        <RevealStagger className="mt-8 grid gap-4 sm:grid-cols-3">
          {outcomes.map((o) => (
            <RevealItem
              key={o.label}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {o.label}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground">{o.body}</p>
            </RevealItem>
          ))}
        </RevealStagger>
      </section>

      <section
        className="relative overflow-hidden border-t border-border"
        style={{ background: gradient }}
      >
        <div className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-24">
          <Reveal>
            <h2 className="text-3xl font-black leading-tight text-white sm:text-5xl">
              {cta.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/85 sm:text-base">
              {cta.body}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg transition hover:scale-[1.02]"
            >
              Book an intro call
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}