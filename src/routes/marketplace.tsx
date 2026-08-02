import { createFileRoute } from "@tanstack/react-router";
import { StandardPage } from "../components/site/StandardPage";
import { PAGES } from "../data/site-pages";

const KEY = "marketplace";

export const Route = createFileRoute("/marketplace")({
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
    />
  );
}
