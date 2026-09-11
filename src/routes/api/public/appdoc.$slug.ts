import { createFileRoute } from "@tanstack/react-router";

import { getPublishedBuild } from "@/lib/site-builder.functions";

/** Raw document for an installable app, loaded inside the app shell. */
export const Route = createFileRoute("/api/public/appdoc/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slug = String((params as { slug?: string }).slug ?? "").slice(0, 80);
        const { build } = await getPublishedBuild({ data: { slug, kind: "app" } });
        if (!build?.html) return new Response("Not found", { status: 404 });
        return new Response(build.html, {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=60",
          },
        });
      },
    },
  },
});
