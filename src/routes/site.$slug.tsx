import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublishedSite } from "../lib/site-builder.functions";

export const Route = createFileRoute("/site/$slug")({
  loader: async ({ params }) => {
    const { site } = await getPublishedSite({ data: { slug: params.slug } });
    if (!site) throw notFound();
    return { site };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.site?.name ?? "Generated site";
    return {
      meta: [
        { title: `${name} | Built with Portfolio OS` },
        {
          name: "description",
          content: `${name}, a complete website generated and published from the Portfolio OS admin builder.`,
        },
        { property: "og:title", content: `${name} | Built with Portfolio OS` },
        { property: "og:description", content: `${name}, generated and published from Portfolio OS.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PublishedSite,
});

function PublishedSite() {
  const { site } = Route.useLoaderData();
  return (
    <iframe
      title={site.name}
      srcDoc={site.html}
      className="h-screen w-screen border-0"
      sandbox="allow-scripts allow-popups allow-forms"
    />
  );
}
