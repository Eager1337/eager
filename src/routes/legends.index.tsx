import { SmartImage } from "../lib/assets";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useContent } from "../lib/content-store";

export const Route = createFileRoute("/legends/")({
  head: () => ({
    meta: [
      { title: "Legends, Ten looping premium landing pages" },
      {
        name: "description",
        content:
          "Ten cinematic looping landing pages, Deadpool × Wolverine, Superman, One Punch Man, Spider-Verse, NBA 2K25, Hoop Dreams, Wooden Love, Audi Nuvolari, One Piece, Luffy.",
      },
      { property: "og:title", content: "Legends, Cinematic looping landing pages" },
      {
        property: "og:description",
        content: "Ten premium landing pages, each with a bespoke loop.",
      },
    ],
  }),
  component: LegendsIndex,
});

function LegendsIndex() {
  const { legends: LEGENDS } = useContent();
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div className="mt-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
            /legends
          </div>
          <h1
            className="mt-2 text-4xl font-black tracking-tight sm:text-6xl"
            style={{ fontFamily: "'Kanit', sans-serif" }}
          >
            Ten looping
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
              landing pages.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Each one is a premium hero with its own infinite animation and a written story that maps
            to how I work.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LEGENDS.map((l) => (
            <Link
              key={l.slug}
              to="/legends/$slug"
              params={{ slug: l.slug }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/40 transition-colors"
              style={{ background: l.bg }}
            >
              <div className="aspect-[16/10] relative overflow-hidden">
                <img
                  src={l.image}
                  alt={l.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>
              <div className="p-5">
                <div className="text-[10px] uppercase tracking-widest" style={{ color: l.accent }}>
                  {l.kicker}
                </div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <h2
                    className="text-xl font-black tracking-tight"
                    style={{ fontFamily: "'Kanit', sans-serif" }}
                  >
                    {l.title}
                  </h2>
                  <ArrowUpRight className="h-4 w-4 text-white/60 group-hover:text-white" />
                </div>
                <p className="mt-1 text-sm text-white/70">{l.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
