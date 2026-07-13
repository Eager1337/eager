import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/work/deck")({
  head: () => ({
    meta: [
      { title: "Slide deck, Mux HLS · Eager Beaver" },
      { name: "description", content: "Always-mounted slide deck with HLS background videos, keyboard navigation and dot pagination." },
    ],
  }),
  component: DeckPage,
});

const HLS_SRC = "https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8";

const SLIDES = [
  { title: "Build with conviction", body: "Five slides. One narrative. Always pre-loaded." },
  { title: "Always mounted", body: "Slides never unmount, HLS videos preload across the deck." },
  { title: "Fade through black", body: "Transitions cross #000, no white flashes between cuts." },
  { title: "Keyboard first", body: "→ ↓ Space advance · ← ↑ go back. Dots are clickable." },
  { title: "Ship it", body: "Deck is ready. Wire your own content and press present." },
];

function useHls(videoRef: React.RefObject<HTMLVideoElement | null>, src: string) {
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.canPlayType("application/vnd.apple.mpegurl")) {
      v.src = src;
      return;
    }
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(v);
      return () => hls.destroy();
    }
  }, [videoRef, src]);
}

function Slide({ idx, active, title, body }: { idx: number; active: boolean; title: string; body: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  useHls(ref, HLS_SRC);

  return (
    <motion.section
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: reduce ? 0 : 0.35, ease: "easeInOut" }}
      style={{ zIndex: active ? 10 : 0, pointerEvents: active ? "auto" : "none" }}
      className="absolute inset-0"
      aria-hidden={!active}
    >
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60 mb-6">Slide {idx + 1} / {SLIDES.length}</p>
        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight max-w-3xl">{title}</h2>
        <p className="mt-6 max-w-xl text-white/70">{body}</p>
      </div>
    </motion.section>
  );
}

function DeckPage() {
  const [i, setI] = useState(0);
  const go = useCallback((n: number) => setI((p) => Math.max(0, Math.min(SLIDES.length - 1, p + n))), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", " "].includes(e.key)) { e.preventDefault(); go(1); }
      else if (["ArrowLeft", "ArrowUp"].includes(e.key)) { e.preventDefault(); go(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-white font-[Aeonik,sans-serif]">
      <Link
        to="/portfolio"
        className="absolute top-4 left-4 z-30 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition rounded-full bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur"
      >
        <ArrowLeft className="w-4 h-4" /> Portfolio
      </Link>

      {SLIDES.map((s, idx) => (
        <Slide key={idx} idx={idx} active={idx === i} title={s.title} body={s.body} />
      ))}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${idx === i ? "bg-white w-6 h-2" : "bg-white/40 w-2 h-2"}`}
          />
        ))}
      </div>
    </div>
  );
}
