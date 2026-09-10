import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, ArrowLeft, Star, FileText } from "lucide-react";
import { downloadCvPdf, downloadRateCardPdf } from "../lib/pdf-exports";
import { getCvProfile } from "../lib/cv.functions";

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
  const loadCv = useServerFn(getCvProfile);
  const { data, isPending } = useQuery({ queryKey: ["cv-profile"], queryFn: () => loadCv({}) });

  const uploaded = data?.cv?.file_url ?? "";
  const uploadedName = data?.cv?.file_name || "cv";
  const ratings = (data?.cv?.ratings ?? []).length ? data!.cv.ratings : RATINGS;

  /** Prefer the file uploaded in the dashboard, otherwise the generated PDF. */
  const startDownload = () => {
    if (uploaded) {
      const a = document.createElement("a");
      a.href = uploaded;
      a.download = uploadedName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    void downloadCvPdf();
  };

  useEffect(() => {
    if (isPending) return;
    const t = setTimeout(() => {
      setStarted(true);
      startDownload();
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, uploaded]);


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
              onClick={startDownload}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
            >
              <Download className="h-4 w-4" /> {uploaded ? "Download my CV" : "Download CV (PDF)"}
            </button>
            <button
              onClick={() => void downloadRateCardPdf()}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm hover:bg-white/10"
            >
              <Download className="h-4 w-4" /> Download rate card
            </button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {ratings.map((r) => (
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