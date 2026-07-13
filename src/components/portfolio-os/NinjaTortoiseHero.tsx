import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Command as CommandIcon, Sparkles } from "lucide-react";
import videoAsset from "../../assets/ninja-tortoise.mp4.asset.json";
import { Link } from "@tanstack/react-router";
import { MagneticButton } from "./MagneticButton";

export function NinjaTortoiseHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [available] = useState<"online" | "limited">("limited");

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.play().catch(() => undefined);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-black text-white min-h-[100dvh] pb-40 sm:pb-24">
      <video
        ref={videoRef}
        src={videoAsset.url}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.18),transparent_60%)]" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.3em]">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">EB</span>
          Portfolio OS
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur">
          <span className={`h-2 w-2 rounded-full ${available === "online" ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
          <span className="text-xs">{available === "online" ? "Available for new projects" : "Limited availability · Q3"}</span>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
          className="hidden md:flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs backdrop-blur hover:bg-white/10"
        >
          <CommandIcon className="h-3.5 w-3.5" />
          K · Jump anywhere
        </button>
      </div>

      {/* Center */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-5 sm:px-6 pt-8 sm:pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] backdrop-blur"
        >
          <Sparkles className="h-3 w-3" /> The Portfolio Operating System · v1.0
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="mt-6 max-w-5xl font-black uppercase leading-[0.95] tracking-tight"
          style={{ fontSize: "clamp(2rem, 8vw, 6.5rem)", fontFamily: "'Kanit', sans-serif" }}
        >
          I don't ship sites.<br />
          <span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
            I ship operating systems.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="mt-6 max-w-2xl text-base text-white/70 sm:text-lg"
        >
          50 production case studies. 50 investor-grade features. 50 pages. One ninja tortoise that doesn't sleep until the deal closes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-8 sm:mt-10 flex w-full flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3"
        >
          <Link to="/explore" className="w-full sm:w-auto">
            <MagneticButton className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black shadow-2xl hover:shadow-white/20">
              Explore 50 sites <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </Link>
          <Link to="/portfolio-os" className="w-full sm:w-auto">
            <MagneticButton className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/10">
              Inspect the OS
            </MagneticButton>
          </Link>
        </motion.div>

        {/* Stat strip, inline on mobile so it can't overlap the CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="relative mx-auto mt-10 grid w-full max-w-5xl grid-cols-2 gap-2.5 sm:gap-3 px-0 sm:px-6 sm:grid-cols-4"
        >
          {[
            ["50", "Case studies"],
            ["50", "Features"],
            ["50", "Pages"],
            ["$680M+", "Capital tracked"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 sm:px-4 sm:py-3 text-left backdrop-blur">
              <div className="text-lg sm:text-2xl font-black tracking-tight">{v}</div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-white/60">{l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}