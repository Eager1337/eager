import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { CargoxLanding } from "@/components/cargox/CargoxLanding";
import { cargoxBySlug, CARGOX_VARIANTS } from "@/data/cargox";

export const Route = createFileRoute("/cargox/$slug")({
  head: ({ params }) => {
    const v = cargoxBySlug(params.slug);
    const title = v ? `CARGOX GROUP · ${v.kicker}` : "CARGOX GROUP";
    const desc = v ? `${v.tagline} — ${v.taglineSub.join(" ")}` : "CARGOX GROUP landing";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Landing page not found</h1>
      <Link to="/cargox" className="text-yellow-400 underline">
        See all CARGOX pages
      </Link>
    </div>
  ),
  loader: ({ params }) => {
    const v = cargoxBySlug(params.slug);
    if (!v) throw notFound();
    return v;
  },
  component: CargoxSlugPage,
});

function CargoxSlugPage() {
  const { slug } = Route.useParams();
  const variant = cargoxBySlug(slug);
  if (!variant) return null;
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&display=swap"
      />
      <CargoxLanding variant={variant} />
      <CargoxNav currentSlug={slug} />
    </>
  );
}

function CargoxNav({ currentSlug }: { currentSlug: string }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-wrap gap-1.5 max-w-[92vw] justify-center bg-black/70 backdrop-blur rounded-full px-3 py-2 border border-white/10">
      {CARGOX_VARIANTS.map((v) => (
        <Link
          key={v.slug}
          to="/cargox/$slug"
          params={{ slug: v.slug }}
          className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
            v.slug === currentSlug
              ? "bg-[#ffda00] text-black"
              : "text-white/70 hover:text-white"
          }`}
        >
          {v.kicker}
        </Link>
      ))}
    </div>
  );
}