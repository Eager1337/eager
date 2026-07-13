import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Rocket } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/work/aeon")({
  head: () => ({
    meta: [
      { title: "Aeon, Cinematic Hero Showcase" },
      { name: "description", content: "Aeon: a cinematic space-travel hero showcase." },
    ],
  }),
  component: AeonPage,
});

function AeonPage() {
  const reduce = useReducedMotion();
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 4,
      })),
    [],
  );

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-black text-white font-[Inter,sans-serif]">
      {/* Stars */}
      <div className="absolute inset-0">
        {stars.map((s, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
            }}
            animate={reduce ? undefined : { opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: s.delay }}
          />
        ))}
      </div>

      {/* Nebula */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 60%, rgba(99,102,241,0.4), transparent 70%), radial-gradient(40% 30% at 20% 30%, rgba(236,72,153,0.25), transparent 70%)",
        }}
      />

      {/* Earth-like planet */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 -bottom-48 -translate-x-1/2 w-[140vw] h-[140vw] max-w-[1400px] max-h-[1400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #6ea8ff 0%, #1e3a8a 40%, #0b1437 70%, #02030a 100%)",
          boxShadow: "0 -40px 120px rgba(99,102,241,0.5)",
        }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Portfolio
        </Link>
        <span className="text-xs uppercase tracking-[0.3em] text-white/60">Work · Aeon</span>
      </header>

      <section className="relative z-10 px-6 pt-24 pb-32 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs"
        >
          <Rocket className="w-3 h-3" /> Cinematic concept
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "-0.04em" }}
          transition={{ duration: 1.2 }}
          className="mt-6 text-6xl sm:text-9xl font-semibold leading-[0.9] bg-gradient-to-b from-white via-white/80 to-white/30 bg-clip-text text-transparent"
        >
          AEON
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 max-w-xl mx-auto text-lg text-white/70"
        >
          A cinematic launch experience, built to feel like the moment before liftoff.
          Pure atmosphere, zero noise.
        </motion.p>
      </section>
    </div>
  );
}
