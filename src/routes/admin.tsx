import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Eager Beaver Admin Dashboard" },
      {
        name: "description",
        content:
          "Sign-in gated admin dashboard to manage Eager Beaver portfolio, builders, projects and services.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#050510] text-white">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white/60">
        Opening admin...
      </div>
    </div>
  ),
});
