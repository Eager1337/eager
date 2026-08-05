import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Download, FileText, Handshake, Loader2, Quote } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "../components/Reveal";
import { downloadPitchDeckPdf } from "../lib/pdf-exports";
import {
  PRESS_BOILERPLATE,
  PRESS_COMPETITORS,
  PRESS_FACTS,
  PRESS_METRICS,
  PRESS_PARTNERSHIPS,
  PRESS_SUMMARY,
} from "../data/press-kit";
import portrait from "../assets/portrait-red.jpg.asset.json";
import portraitAlt from "../assets/portrait-black-standing.jpg.asset.json";

const TITLE = "Investor Press Kit, Eager Beaver Product Studio";
const DESC =
  "Executive summary, key metrics, competitor comparison, partnerships, downloadable pitch deck and press materials for the Eager Beaver product studio.";

export const Route = createFileRoute("/press-kit")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:image", content: portrait.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: portrait.url },
    ],
  }),
  component: PressKitPage,
});

function PressKitPage() {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const deck = async () => {
    setBusy(true);
    try {
      await downloadPitchDeckPdf();
    } finally {
      setBusy(false);
    }
  };

  const copyBoilerplate = async () => {
    try {
      await navigator.clipboard.writeText(PRESS_BOILERPLATE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
        <Link
          to="/investor"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to investor relations
        </Link>

        <Reveal>
          <p className="mt-8 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
            Investor press kit
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Everything an investor or journalist needs, in one page.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{DESC}</p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-7 grid grid-cols-[minmax(0,1fr)] gap-3 sm:flex sm:flex-wrap">
            <button
              onClick={deck}
              disabled={busy}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download the pitch deck (PDF)
            </button>
            <Link
              to="/cv"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border px-5 text-sm font-semibold transition hover:bg-card"
            >
              <FileText className="h-4 w-4" /> Founder CV
            </Link>
            <button
              onClick={copyBoilerplate}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border px-5 text-sm font-semibold transition hover:bg-card"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Quote className="h-4 w-4" />}
              {copied ? "Boilerplate copied" : "Copy boilerplate"}
            </button>
          </div>
        </Reveal>

        <Section title="Executive summary" eyebrow="01">
          <div className="space-y-4">
            {PRESS_SUMMARY.map((p) => (
              <p key={p} className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {p}
              </p>
            ))}
          </div>
        </Section>

        <Section title="Key metrics" eyebrow="02">
          <RevealStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRESS_METRICS.map((m) => (
              <RevealItem key={m.label}>
                <div className="h-full rounded-2xl border border-border bg-card p-5">
                  <div className="text-3xl font-black tracking-tight text-primary">{m.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {m.label}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.note}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </Section>

        <Section title="Competitor comparison" eyebrow="03">
          <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {["Option", "Positioning", "Speed", "Ownership", "Pricing"].map((h) => (
                    <th key={h} className="border-b border-border pb-3 pr-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRESS_COMPETITORS.map((c) => (
                  <tr key={c.name} className={c.us ? "bg-primary/5" : undefined}>
                    <td className={`border-b border-border py-4 pr-4 font-semibold ${c.us ? "text-primary" : ""}`}>
                      {c.name}
                    </td>
                    <td className="border-b border-border py-4 pr-4 text-muted-foreground">{c.positioning}</td>
                    <td className="border-b border-border py-4 pr-4 text-muted-foreground">{c.speed}</td>
                    <td className="border-b border-border py-4 pr-4 text-muted-foreground">{c.ownership}</td>
                    <td className="border-b border-border py-4 pr-4 text-muted-foreground">{c.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Partnerships" eyebrow="04">
          <RevealStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRESS_PARTNERSHIPS.map((p) => (
              <RevealItem key={p.name}>
                <div className="h-full rounded-2xl border border-border bg-card p-5">
                  <div className="flex min-w-0 items-center gap-2">
                    <Handshake className="h-4 w-4 shrink-0 text-primary" />
                    <h3 className="truncate text-base font-semibold">{p.name}</h3>
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{p.kind}</div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </Section>

        <Section title="Press materials" eyebrow="05">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-base font-semibold">Boilerplate</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{PRESS_BOILERPLATE}</p>
              <h3 className="mt-6 text-base font-semibold">Fact sheet</h3>
              <dl className="mt-3 space-y-3">
                {PRESS_FACTS.map((f) => (
                  <div key={f.label} className="grid grid-cols-[minmax(0,1fr)] gap-1 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4">
                    <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{f.label}</dt>
                    <dd className="min-w-0 text-sm">
                      <span className="font-semibold">{f.value}</span>
                      <span className="block text-muted-foreground">{f.note}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[portrait, portraitAlt].map((asset, i) => (
                <figure key={asset.url} className="overflow-hidden rounded-2xl border border-border bg-card">
                  <img
                    src={asset.url}
                    alt={`Founder portrait ${i + 1} of the Eager Beaver product studio`}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover"
                  />
                  <figcaption className="flex items-center justify-between gap-2 p-3 text-xs text-muted-foreground">
                    <span className="truncate">Portrait {i + 1}</span>
                    <a
                      href={asset.url}
                      download
                      className="inline-flex min-h-[36px] shrink-0 items-center gap-1 rounded-lg border border-border px-2 font-medium transition hover:bg-background"
                    >
                      <Download className="h-3.5 w-3.5" /> Save
                    </a>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </Section>

        <Reveal>
          <div className="mt-16 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-xl font-bold sm:text-2xl">Press and investment enquiries</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Send a brief and you will get a reply within one business day, including references and a walkthrough of any
              platform in the portfolio.
            </p>
            <Link
              to="/contact"
              className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Contact the studio
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14 sm:mt-20">
      <Reveal>
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="shrink-0 text-xs font-black text-primary">{eyebrow}</span>
          <h2 className="truncate text-xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        </div>
      </Reveal>
      <div className="mt-6">{children}</div>
    </section>
  );
}
