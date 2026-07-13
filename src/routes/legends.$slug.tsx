import { SmartImage } from "../lib/assets";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { LEGENDS, type Legend } from "../data/legends";
import { useContent } from "../lib/content-store";

export const Route = createFileRoute("/legends/$slug")({
  head: () => ({
    meta: [
      { title: "Legend, Eager Beaver" },
      { name: "description", content: "Cinematic looping legend landing page." },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Legend not found</h1>
        <Link to="/legends" className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm text-black">Back to Legends</Link>
      </div>
    </div>
  ),
  component: LegendPage,
});

function LegendPage() {
  const { slug } = Route.useParams();
  const { legends } = useContent();
  const legend = legends.find((l) => l.slug === slug) ?? LEGENDS.find((l) => l.slug === slug);
  if (!legend) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Legend not found</h1>
          <Link to="/legends" className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm text-black">Back to Legends</Link>
        </div>
      </div>
    );
  }
  const others = legends.filter((l) => l.slug !== legend.slug).slice(0, 4);
  return (
    <div className="min-h-screen text-white" style={{ background: legend.bg }}>
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <Link to="/legends" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> All legends
        </Link>
      </div>

      <section className="relative mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.35em]" style={{ color: legend.accent }}>{legend.kicker}</div>
          <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-7xl" style={{ fontFamily: "'Kanit', sans-serif" }}>{legend.title}</h1>
          <p className="mt-4 max-w-lg text-lg text-white/80">{legend.tagline}</p>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-white/70">{legend.story}</p>

          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {legend.facts.map((f) => (
              <div key={f.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xl font-black" style={{ color: legend.accent }}>{f.value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-white/60">{f.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {legend.stack.map((s) => (
              <span key={s} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs">{s}</span>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/portfolio" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90">
              Hire me <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/explore" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">
              See 50 case studies
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6">
          <LegendCanvas legend={legend} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">More legends</div>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {others.map((l) => (
            <Link key={l.slug} to="/legends/$slug" params={{ slug: l.slug }} className="group overflow-hidden rounded-2xl border border-white/10 hover:border-white/40">
              <div className="aspect-[16/10] relative overflow-hidden bg-black">
                <SmartImage src={l.image} alt={l.title} loading="lazy" className="h-full w-full object-cover object-center opacity-90 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold">{l.title}</div>
                <div className="text-[11px] text-white/60">{l.kicker}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function LegendCanvas({ legend }: { legend: Legend }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 bg-black">
      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at center, ${legend.accent}33, transparent 60%)` }}
      />
      {legend.animation === "clash" && <ClashLoop img={legend.image} accent={legend.accent} />}
      {legend.animation === "smile" && <SmileLoop img={legend.image} accent={legend.accent} />}
      {legend.animation === "walk" && <WalkLoop img={legend.image} accent={legend.accent} />}
      {legend.animation === "mirror" && <MirrorLoop img={legend.image} accent={legend.accent} />}
      {legend.animation === "ember" && <EmberLoop img={legend.image} accent={legend.accent} />}
      {legend.animation === "swing" && <SwingLoop img={legend.image} accent={legend.accent} />}
      {legend.animation === "eyeGlow" && <EyeGlowLoop img={legend.image} accent={legend.accent} />}
      {legend.animation === "hoop" && <HoopLoop img={legend.image} accent={legend.accent} />}
      {legend.animation === "train" && <TrainLoop img={legend.image} accent={legend.accent} />}
      {legend.animation === "orbit" && <OrbitLoop img={legend.image} accent={legend.accent} />}
    </div>
  );
}

/* ---------------- loop primitives ---------------- */

const base = "absolute inset-0 h-full w-full object-contain object-center";

function ClashLoop({ img }: { img: string; accent: string }) {
  return (
    <>
      <motion.img src={img} alt="" className={base}
        animate={{ x: [-14, 14, -14], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div className="absolute inset-0 mix-blend-screen"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,80,80,0.45), transparent 55%)" }}
        animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.9, 1.05, 0.9] }}
        transition={{ duration: 1.1, repeat: Infinity }}
      />
    </>
  );
}

function SmileLoop({ img, accent }: { img: string; accent: string }) {
  return (
    <>
      <motion.img src={img} alt="" className={base}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div className="absolute inset-x-0 top-1/4 h-40"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}66, transparent)` }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3.5, ease: "linear", repeat: Infinity }}
      />
    </>
  );
}

function WalkLoop({ img, accent }: { img: string; accent: string }) {
  return (
    <>
      <motion.img src={img} alt="" className={base}
        animate={{ scale: [1, 1.06, 1], y: [0, -8, 0] }}
        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div className="absolute bottom-0 h-1/3 w-full"
        style={{ background: `linear-gradient(to top, ${accent}44, transparent)` }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </>
  );
}

function MirrorLoop({ img }: { img: string; accent: string }) {
  return (
    <>
      <SmartImage src={img} alt="" className={base} />
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.05), transparent 40%, transparent 60%, rgba(255,255,255,0.05))" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </>
  );
}

function EmberLoop({ img }: { img: string; accent: string }) {
  return (
    <>
      <motion.img src={img} alt="" className={base}
        animate={{ filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.span key={i}
          className="absolute h-1 w-1 rounded-full"
          style={{ background: "#FFA84D", left: `${10 + (i * 5) % 80}%`, bottom: 0 }}
          animate={{ y: [-10, -320], opacity: [1, 0], scale: [1, 0.4] }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.15, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

function SwingLoop({ img }: { img: string; accent: string }) {
  return (
    <motion.img src={img} alt="" className={base}
      animate={{ x: [-24, 24, -24], rotate: [-3, 3, -3] }}
      transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
    />
  );
}

function EyeGlowLoop({ img, accent }: { img: string; accent: string }) {
  return (
    <>
      <SmartImage src={img} alt="" className={base} />
      <motion.div className="absolute inset-0"
        style={{ background: `radial-gradient(circle at 42% 35%, ${accent}88, transparent 12%), radial-gradient(circle at 62% 35%, ${accent}88, transparent 12%)`, mixBlendMode: "screen" }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
    </>
  );
}

function HoopLoop({ img, accent }: { img: string; accent: string }) {
  return (
    <>
      <SmartImage src={img} alt="" className={base} />
      <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        <motion.circle
          r="14" fill={accent} stroke="#fff" strokeWidth="2"
          initial={{ cx: 30, cy: 420 }}
          animate={{
            cx: [30, 200, 330],
            cy: [420, 60, 280],
          }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", repeatDelay: 0.4 }}
        />
      </svg>
    </>
  );
}

function TrainLoop({ img }: { img: string; accent: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.img src={img} alt="" className={base}
        animate={{ x: ["6%", "-6%", "6%"] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
      />
    </div>
  );
}

function OrbitLoop({ img, accent }: { img: string; accent: string }) {
  return (
    <>
      <motion.img src={img} alt="" className={base}
        animate={{ rotate: [-2, 2, -2], scale: [1, 1.03, 1] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div className="absolute inset-8 rounded-full border border-white/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        style={{ borderTopColor: accent }}
      />
    </>
  );
}