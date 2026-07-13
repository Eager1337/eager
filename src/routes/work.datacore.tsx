import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Sparkles, Zap, Shield } from "lucide-react";

export const Route = createFileRoute("/work/datacore")({
  head: () => ({
    meta: [
      { title: "Datacore, Networks unified · Eager Beaver" },
      { name: "description", content: "Dark Linear-style hero for Datacore, one rapid interface for every network." },
      { property: "og:title", content: "Datacore, Networks unified" },
      { property: "og:description", content: "Your networks. One rapid interface." },
    ],
  }),
  component: DatacorePage,
});

function DatacorePage() {
  const reduce = useReducedMotion();
  const fade = reduce
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070A] text-white antialiased font-[Inter,sans-serif]">
      {/* Ambient gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-[120px] opacity-40 bg-[radial-gradient(circle_at_center,#7b39fc_0%,transparent_60%)]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[120px] opacity-25 bg-[radial-gradient(circle_at_center,#f87b52_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,#07070A_85%)]" />
      </div>

      {/* Top bar */}
      <header className="relative z-20 mx-auto max-w-7xl flex items-center justify-between px-6 py-5">
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Portfolio
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm text-white/70 font-[Manrope,sans-serif]">
          <a className="hover:text-white transition">Product</a>
          <a className="hover:text-white transition">Customers</a>
          <a className="hover:text-white transition">Docs</a>
          <a className="hover:text-white transition">Pricing</a>
        </div>
        <a className="rounded-full bg-white text-[#07070A] px-4 py-2 text-sm font-semibold hover:bg-white/90 transition">Sign in</a>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pt-16 sm:pt-24 pb-24 text-center">
        <motion.div {...fade} className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md pl-1 pr-4 py-1 text-xs font-medium text-white/80">
          <span className="rounded-full bg-[#7b39fc] text-white px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">New</span>
          Say hello to Datacore v3.2
          <Sparkles className="w-3 h-3 text-[#f87b52]" />
        </motion.div>

        <motion.h1
          {...fade}
          transition={reduce ? undefined : { duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 font-[Instrument_Serif,serif] text-5xl sm:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight"
        >
          Your Networks.<br />
          <span className="italic text-white/90">One Rapid Interface.</span>
        </motion.h1>

        <motion.p
          {...fade}
          transition={reduce ? undefined : { duration: 0.8, delay: 0.25 }}
          className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-white/60 font-[Manrope,sans-serif] leading-relaxed"
        >
          Unify observability, deployments and incident response across every cluster, without context switching.
        </motion.p>

        <motion.div
          {...fade}
          transition={reduce ? undefined : { duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a className="inline-flex items-center gap-2 rounded-full bg-[#7b39fc] hover:bg-[#6a2eea] text-white px-6 py-3 text-sm font-semibold shadow-[0_10px_40px_-10px_#7b39fc] transition-colors font-[Cabin,sans-serif]">
            Book a Free Demo <ArrowUpRight className="w-4 h-4" />
          </a>
          <a className="inline-flex items-center gap-2 rounded-full bg-[#0f1117] hover:bg-[#171a23] border border-white/10 text-white px-6 py-3 text-sm font-semibold transition-colors font-[Cabin,sans-serif]">
            Get Started Now
          </a>
        </motion.div>

        <motion.div
          {...fade}
          transition={reduce ? undefined : { duration: 0.8, delay: 0.55 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: Zap, t: "Sub-second routing", d: "Edge-aware traffic across every region." },
            { icon: Shield, t: "Zero-trust by default", d: "mTLS, SSO and audit out of the box." },
            { icon: Sparkles, t: "AI co-pilot", d: "Plain-English queries on raw telemetry." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 text-left">
              <Icon className="w-5 h-5 text-[#f87b52] mb-3" />
              <p className="text-sm font-semibold">{t}</p>
              <p className="mt-1 text-xs text-white/55">{d}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
