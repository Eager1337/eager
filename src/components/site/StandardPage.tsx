import { Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Search, ChevronDown } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "../Reveal";
import { SITE_NAV } from "../../data/site-nav";

export type PageBlock = {
  title: string;
  body: string;
  meta?: string;
  tags?: string[];
  href?: string;
  to?: string;
};

/** Shared shell for the standard content pages so every page is consistent and responsive. */
export function StandardPage({
  eyebrow,
  title,
  intro,
  blocks,
  layout = "cards",
  cta,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  blocks: PageBlock[];
  layout?: "cards" | "list" | "faq";
  cta?: { label: string; to: string };
  children?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blocks;
    return blocks.filter((b) =>
      `${b.title} ${b.body} ${b.meta ?? ""} ${(b.tags ?? []).join(" ")}`.toLowerCase().includes(q),
    );
  }, [blocks, query]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
        <Reveal>
          <Link
            to="/portfolio"
            className="inline-flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to the portfolio
          </Link>
        </Reveal>

        <Reveal delay={0.05}>
          <p className="mt-8 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{intro}</p>
        </Reveal>

        {blocks.length > 4 ? (
          <Reveal delay={0.1}>
            <div className="relative mt-8 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search this page"
                aria-label={`Search ${title}`}
                className="min-h-[44px] w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </Reveal>
        ) : null}

        {layout === "faq" ? (
          <div className="mt-10 space-y-3">
            {filtered.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.03}>
                <div className="rounded-2xl border border-border bg-card">
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    aria-expanded={openIndex === i}
                    className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold"
                  >
                    {b.title}
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openIndex === i ? (
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <RevealStagger
            className={
              layout === "list" ? "mt-10 space-y-3" : "mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {filtered.map((b) => (
              <RevealItem key={b.title}>
                <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-primary/50">
                  {b.meta ? (
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{b.meta}</p>
                  ) : null}
                  <h2 className="mt-1 text-base font-semibold">{b.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
                  {b.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {b.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {b.to ? (
                    <Link
                      to={b.to}
                      className="mt-4 inline-flex min-h-[44px] items-center text-sm font-semibold text-primary"
                    >
                      Learn more
                    </Link>
                  ) : b.href ? (
                    <a
                      href={b.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex min-h-[44px] items-center text-sm font-semibold text-primary"
                    >
                      Open link
                    </a>
                  ) : null}
                </article>
              </RevealItem>
            ))}
          </RevealStagger>
        )}

        {filtered.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">Nothing matched that search.</p>
        ) : null}

        {children}

        <Reveal delay={0.1}>
          <div className="mt-14 rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-xl font-semibold">{cta?.label ?? "Start a project"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Send a short brief and you will get a reply with scope, timeline and a fixed price.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to={cta?.to ?? "/contact"}
                className="inline-flex min-h-[44px] items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                {cta?.label ?? "Contact me"}
              </Link>
              <Link
                to="/cv"
                className="inline-flex min-h-[44px] items-center rounded-xl border border-border px-5 text-sm font-semibold"
              >
                Download CV
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <nav aria-label="Site map" className="mt-12 border-t border-border pt-8">
            <h2 className="text-sm font-semibold">Explore the rest of the portfolio</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {SITE_NAV.map((n) => (
                <Link
                  key={n.to + n.label}
                  to={n.to}
                  className="flex min-h-[44px] items-center rounded-lg px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>
        </Reveal>
      </div>
    </main>
  );
}
