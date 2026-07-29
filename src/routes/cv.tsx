import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, ArrowLeft, Star, FileText } from "lucide-react";
import { downloadCvPdf, downloadRateCardPdf } from "../lib/pdf-exports";

export const Route = createFileRoute("/cv")({
  head: () => ({
    meta: [
      { title: "CV & client ratings, Alusine G. Dumbuya" },
      {
        name: "description",
        content:
          "Download the CV and client ratings of Alusine G. Dumbuya (Eager Beaver), full-stack developer, systems builder and video editor.",
      },
      { property: "og:title", content: "CV & client ratings, Eager Beaver" },
      { property: "og:description", content: "One-click CV download plus verified client ratings." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CvPage,
});

const RATINGS = [
  { label: "Delivery on time", score: 4.9 },
  { label: "Code quality", score: 5.0 },
  { label: "Communication", score: 4.8 },
  { label: "Value for budget", score: 4.9 },
];

function CvPage() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setStarted(true);
      void downloadCvPdf();
    }, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white px-5 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight">
            CV & client ratings
          </h1>
          <p className="mt-3 text-white/60 leading-relaxed">
            {started
              ? "Your download has started. If nothing happened, use the button below."
              : "Preparing your download..."}
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => void downloadCvPdf()}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
            >
              <Download className="h-4 w-4" /> Download CV (PDF)
            </button>
            <button
              onClick={() => void downloadRateCardPdf()}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm hover:bg-white/10"
            >
              <Download className="h-4 w-4" /> Download rate card
            </button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {RATINGS.map((r) => (
              <div key={r.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">{r.label}</div>
                <div className="mt-2 flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-semibold">{r.score.toFixed(1)}</span>
                  <span className="text-white/40 text-sm">/ 5.0</span>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/portfolio"
            className="mt-10 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to the portfolio
          </Link>
        </div>
      </div>
    </main>
  );
}