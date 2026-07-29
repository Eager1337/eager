import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Download, ArrowLeft, Mail } from "lucide-react";
import { downloadCvPdf } from "../lib/pdf-exports";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Message received, Eager Beaver" },
      {
        name: "description",
        content:
          "Your message reached Alusine G. Dumbuya (Eager Beaver). Download the CV and client ratings while you wait for a reply.",
      },
      { property: "og:title", content: "Message received, Eager Beaver" },
      { property: "og:description", content: "Thanks for reaching out. Reply lands within 24 hours." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white grid place-items-center px-5 py-20">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight">Message received</h1>
        <p className="mt-3 text-white/60 leading-relaxed">
          Thanks for reaching out. Your brief is saved and I reply to every serious enquiry within 24
          hours. A welcome email with my CV and client ratings is on its way to your inbox.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => void downloadCvPdf()}
            className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
          >
            <Download className="h-4 w-4" /> Download my CV
          </button>
          <a
            href="mailto:ebeaver091@gmail.com"
            className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm hover:bg-white/10"
          >
            <Mail className="h-4 w-4" /> Email me directly
          </a>
        </div>

        <Link
          to="/portfolio"
          className="mt-8 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the portfolio
        </Link>
      </div>
    </main>
  );
}