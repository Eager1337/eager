import { createFileRoute, Link } from "@tanstack/react-router";
import { CARGOX_VARIANTS } from "@/data/cargox";

export const Route = createFileRoute("/cargox/")({
  head: () => ({
    meta: [
      { title: "CARGOX GROUP · Landing pages" },
      { name: "description", content: "Mobile iPhone-style landing pages for CARGOX GROUP." },
    ],
  }),
  component: CargoxIndex,
});

function CargoxIndex() {
  return (
    <div className="min-h-screen bg-[#0a1f2b] text-white px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-xs uppercase tracking-[0.35em] text-[#ffda00]">CARGOX GROUP</div>
        <h1
          className="mt-3 uppercase font-black"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(48px, 10vw, 88px)", lineHeight: 0.9 }}
        >
          {CARGOX_VARIANTS.length} landing pages,
          <br />
          <span style={{ color: "#ffda00" }}>one per hero video.</span>
        </h1>
        <p className="mt-6 max-w-xl text-white/70">
          Each page is an iPhone 15 Pro mockup with its own looping hero video, headline, and stat block.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {CARGOX_VARIANTS.map((v) => (
            <Link
              key={v.slug}
              to="/cargox/$slug"
              params={{ slug: v.slug }}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 hover:border-[#ffda00] hover:bg-white/[0.08] transition"
            >
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/50">{v.kicker}</div>
                <div
                  className="mt-1 uppercase"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22 }}
                >
                  {v.headline.join(" ")}
                </div>
              </div>
              <span className="text-[#ffda00] group-hover:translate-x-1 transition">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}