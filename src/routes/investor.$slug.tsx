import { createFileRoute, notFound } from "@tanstack/react-router";
import { InvestorPage } from "@/components/investor/InvestorPage";
import { findInvestorPage } from "@/data/investor";

export const Route = createFileRoute("/investor/$slug")({
  head: ({ params }) => {
    const page = params?.slug ? findInvestorPage(params.slug) : undefined;
    const title = page ? `${page.headline}, Investor Suite` : "Investor practice";
    const description = page?.lede ?? "Investor-facing capability page.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    const page = findInvestorPage(params.slug);
    if (!page) throw notFound();
    return { page };
  },
  component: InvestorSlug,
  errorComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p>Practice not found.</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p>Practice not found.</p>
    </div>
  ),
});

function InvestorSlug() {
  const { slug } = Route.useParams();
  const page = findInvestorPage(slug);
  if (!page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p>Practice not found.</p>
      </div>
    );
  }
  return (
    <InvestorPage
      eyebrow={page.eyebrow}
      title={page.title}
      lede={page.lede}
      gradient={page.gradient}
      metrics={page.metrics}
      pillars={page.pillars}
      services={page.services}
      outcomes={page.outcomes}
      cta={page.cta}
    />
  );
}