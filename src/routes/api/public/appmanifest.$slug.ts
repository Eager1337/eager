import { createFileRoute } from "@tanstack/react-router";

import { getPublishedBuild } from "@/lib/site-builder.functions";

/** Web app manifest so a published app can be installed on Android and desktop. */
export const Route = createFileRoute("/api/public/appmanifest/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slug = String((params as { slug?: string }).slug ?? "").slice(0, 80);
        const { build } = await getPublishedBuild({ data: { slug, kind: "app" } });
        if (!build) return new Response("Not found", { status: 404 });

        const icon = build.app_icon || build.logo_url || "/favicon.ico";
        const theme = build.theme_color || "#0A0A0A";
        const manifest = {
          name: build.name,
          short_name: build.short_name || build.name,
          description: build.summary || `${build.name}, an installable app.`,
          id: `/app/${slug}`,
          start_url: `/app/${slug}`,
          scope: `/app/${slug}`,
          display: "standalone",
          orientation: "portrait",
          background_color: theme,
          theme_color: theme,
          icons: [
            { src: icon, sizes: "192x192", type: "image/png", purpose: "any" },
            { src: icon, sizes: "512x512", type: "image/png", purpose: "any" },
            { src: icon, sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        };

        return new Response(JSON.stringify(manifest), {
          headers: {
            "content-type": "application/manifest+json; charset=utf-8",
            "cache-control": "public, max-age=60",
          },
        });
      },
    },
  },
});
