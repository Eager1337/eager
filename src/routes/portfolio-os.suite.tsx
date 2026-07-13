import { createFileRoute } from "@tanstack/react-router";
import { InvestorSuite } from "../components/portfolio-os/InvestorSuite";

export const Route = createFileRoute("/portfolio-os/suite")({
  head: () => ({
    meta: [
      { title: "Investor Suite, AI, Analytics, A11y & Estimator" },
      { name: "description", content: "AI assistant, investor analytics dashboard, accessibility + language settings, and a live quote estimator that generates a downloadable proposal." },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.12),transparent_50%)]" />
      <div className="relative z-10">
        <InvestorSuite />
      </div>
    </div>
  ),
});