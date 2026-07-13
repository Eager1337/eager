import { createFileRoute } from "@tanstack/react-router";

/**
 * Public media streaming route.
 *
 * The portfolio-media bucket is private (workspace policy blocks public
 * buckets), so we stream image bytes through this public endpoint using the
 * service role. Only files that an admin explicitly uploaded live in the
 * bucket, and this route is read-only.
 */
export const Route = createFileRoute("/api/public/media/$key")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = decodeURIComponent(params.key);
        if (!/^[a-zA-Z0-9._-]+$/.test(key)) {
          return new Response("Not found", { status: 404 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage
          .from("portfolio-media")
          .download(key);
        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }
        const buf = await data.arrayBuffer();
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "public, max-age=300, s-maxage=3600",
          },
        });
      },
    },
  },
});
