import { createFileRoute } from "@tanstack/react-router";
import { Github, GraduationCap, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { StandardPage } from "../components/site/StandardPage";
import { Reveal } from "../components/Reveal";
import { PAGES } from "../data/site-pages";

const KEY = "about";

export const Route = createFileRoute("/about/")({
  head: () => {
    const p = PAGES[KEY]!;
    return {
      meta: [
        { title: p.seoTitle },
        { name: "description", content: p.seoDescription },
        { property: "og:title", content: p.seoTitle },
        { property: "og:description", content: p.seoDescription },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PageRoute,
});

const FACTS = [
  { icon: MapPin, label: "Based in", value: "Freetown, Sierra Leone" },
  { icon: GraduationCap, label: "Studying at", value: "Limkokwing University" },
  {
    icon: Mail,
    label: "Email",
    value: "ebeaver091@gmail.com",
    href: "mailto:ebeaver091@gmail.com",
  },
  { icon: Phone, label: "Phone", value: "+232 33 695 803", href: "tel:+23233695803" },
  {
    icon: Github,
    label: "GitHub",
    value: "github.com/Eager1337",
    href: "https://github.com/Eager1337?tab=repositories",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "eager-beaver",
    href: "https://www.linkedin.com/in/eager-beaver-03ab9040b",
  },
];

function PageRoute() {
  const p = PAGES[KEY]!;
  return (
    <StandardPage
      eyebrow={p.eyebrow}
      title={p.title}
      intro={p.intro}
      blocks={p.blocks}
      layout={p.layout}
      cta={p.cta}
    >
      <Reveal delay={0.1}>
        <section
          aria-label="Quick facts"
          className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8"
        >
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Quick facts
          </h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FACTS.map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0">
                  <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {f.label}
                  </dt>
                  <dd className="mt-0.5 truncate text-sm font-medium">
                    {f.href ? (
                      <a
                        href={f.href}
                        target={f.href.startsWith("http") ? "_blank" : undefined}
                        rel={f.href.startsWith("http") ? "noreferrer" : undefined}
                        className="transition hover:text-primary"
                      >
                        {f.value}
                      </a>
                    ) : (
                      f.value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </section>
      </Reveal>
    </StandardPage>
  );
}
