import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

export const Route = createFileRoute("/work/aurai")({
  head: () => ({
    meta: [
      { title: "Aurai, Hero Showcase" },
      { name: "description", content: "Aurai: ambient AI companion hero showcase." },
    ],
  }),
  component: AuraiPage,
});

function AuraiPage() {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#0A0A12] text-white font-[Inter,sans-serif]">
      {/* Animated aurora background */}
      <motion.div
        aria-hidden
        className="absolute -inset-32 opacity-60 blur-3xl"
        animate={{
          background: [
            "radial-gradient(40% 60% at 20% 30%, #7c3aed 0%, transparent 60%), radial-gradient(50% 50% at 80% 70%, #06b6d4 0%, transparent 60%)",
            "radial-gradient(50% 60% at 70% 20%, #ec4899 0%, transparent 60%), radial-gradient(40% 50% at 20% 80%, #6366f1 0%, transparent 60%)",
            "radial-gradient(40% 60% at 20% 30%, #7c3aed 0%, transparent 60%), radial-gradient(50% 50% at 80% 70%, #06b6d4 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Portfolio
        </Link>
        <span className="text-xs uppercase tracking-[0.3em] text-white/60">Work · Aurai</span>
      </header>

      <section className="relative z-10 px-6 pt-16 pb-24 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs"
        >
          <Sparkles className="w-3 h-3 text-fuchsia-300" /> Ambient AI · concept
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 text-6xl sm:text-8xl font-semibold tracking-[-0.04em] leading-[0.95] bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent"
        >
          Aurai
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 max-w-xl mx-auto text-lg text-white/70"
        >
          A calm, ambient AI companion that lives at the edge of your screen, listening, summarising,
          and quietly disappearing when you don't need it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative w-72 h-72 rounded-full bg-gradient-conic from-fuchsia-500 via-cyan-400 to-fuchsia-500 blur-2xl opacity-50"
          />
          <div className="absolute mt-2 w-56 h-56 rounded-full border border-white/20 backdrop-blur-2xl bg-white/5" />
        </motion.div>
      </section>
    </div>
  );
}
