import { createFileRoute, notFound } from "@tanstack/react-router";

import { getPublishedBuild } from "../lib/site-builder.functions";

/** Short public address for any published build, for example /s/hammakay. */
export const Route = createFileRoute("/s/$slug")({
  loader: async ({ params }) => {
    const { build } = await getPublishedBuild({ data: { slug: params.slug, kind: "any" } });
    if (!build) throw notFound();
    return { build };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.build?.name ?? "Published site";
    return {
      meta: [
        { title: `${name}` },
        {
          name: "description",
          content: loaderData?.build?.summary || `${name}, published from the Eager Beaver studio.`,
        },
        { property: "og:title", content: name },
        { property: "og:description", content: loaderData?.build?.summary || `${name}, published live.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ShortLinkSite,
});

function ShortLinkSite() {
  const { build } = Route.useLoaderData();
  return (
    <iframe
      title={build.name}
      srcDoc={build.html ?? ""}
      className="h-screen w-screen border-0"
      sandbox="allow-scripts allow-popups allow-forms"
    />
  );
}
