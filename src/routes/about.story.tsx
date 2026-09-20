import { createFileRoute } from "@tanstack/react-router";
import { StandardPage } from "../components/site/StandardPage";
import { Reveal } from "../components/Reveal";
import { PAGES } from "../data/site-pages";

const KEY = "about-story";

export const Route = createFileRoute("/about/story")({
  head: () => {
    const p = PAGES[KEY]!;
    return {
      meta: [
        { title: p.seoTitle },
        { name: "description", content: p.seoDescription },
        { property: "og:title", content: p.seoTitle },
        { property: "og:description", content: p.seoDescription },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PageRoute,
});

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
        <figure className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <blockquote className="text-base font-medium leading-relaxed sm:text-lg">
            “Sierra Leone to the world, no safety net, no rich family, no big agency behind me. Just
            the shot, the arc, and the net.”
          </blockquote>
          <figcaption className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
            Alusine G. Dumbuya · Eager Beaver
          </figcaption>
        </figure>
      </Reveal>
    </StandardPage>
  );
}
