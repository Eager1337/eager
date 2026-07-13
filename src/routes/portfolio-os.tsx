import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/portfolio-os")({
  component: () => (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="border-b border-white/10 px-6 py-4">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </Link>
      </div>
      <Outlet />
    </div>
  ),
});