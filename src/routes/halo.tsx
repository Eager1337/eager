import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck, Zap, Globe2 } from "lucide-react";

export const Route = createFileRoute("/halo")({
  head: () => ({
    meta: [
      { title: "USD Halo, Premium Stablecoin Banking" },
      { name: "description", content: "USD Halo: a premium fintech rail for instant, compliant, global USD payments." },
      { property: "og:title", content: "USD Halo, Premium Stablecoin Banking" },
      { property: "og:description", content: "Instant, compliant, global USD payments." },
    ],
  }),
  component: HaloPage,
});

const VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4";

function LogoIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="6" fill="currentColor" />
    </svg>
  );
}

function HaloPage() {
  return (
    <div className="min-h-[100dvh] bg-[#06060A] text-white font-[Manrope,Geist,Inter,sans-serif] antialiased">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/5">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <LogoIcon />
            <span className="font-semibold tracking-tight">USD Halo</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/70">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#trust" className="hover:text-white">Trust</a>
            <Link to="/portfolio" className="rounded-full border border-white/15 px-3 py-1.5 hover:border-white hover:bg-white hover:text-black transition">
              Back to portfolio
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative h-[100dvh] w-full overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          src={VIDEO}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,180,255,0.15),transparent_60%)]" />

        <div className="relative z-10 h-full flex flex-col justify-center px-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80"
          >
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live on 14 networks
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-5 text-5xl sm:text-7xl md:text-8xl font-semibold tracking-[-0.04em] leading-[0.95]"
          >
            Dollars,<br />
            <span className="bg-gradient-to-r from-white via-sky-200 to-indigo-300 bg-clip-text text-transparent">
              at the speed of light.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 max-w-xl text-base sm:text-lg text-white/70 leading-relaxed"
          >
            USD Halo is a premium stablecoin rail for treasuries, fintechs and creators.
            Instant settlement, programmable yield, and compliance built in.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a href="#features" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 transition">
              Get early access <ArrowUpRight className="w-4 h-4" />
            </a>
            <a href="#trust" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold hover:bg-white/10 transition">
              View whitepaper
            </a>
          </motion.div>
        </div>
      </section>

      <section id="features" className="px-6 py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">Built for serious money.</h2>
        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          {[
            { Icon: Zap, t: "Instant settlement", b: "Atomic clearing across 14 chains. No T+2." },
            { Icon: ShieldCheck, t: "Bank-grade compliance", b: "Travel rule, KYC and on-chain attestation." },
            { Icon: Globe2, t: "Global reach", b: "180+ countries, 40+ off-ramps." },
          ].map(({ Icon, t, b }) => (
            <div key={t} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition">
              <Icon className="w-6 h-6 text-sky-300" />
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-white/60">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="trust" className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-transparent p-8 sm:p-12">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Trust</p>
          <h3 className="mt-2 text-2xl sm:text-4xl font-semibold tracking-tight">
            1:1 reserves. Audited monthly. Fully attested on-chain.
          </h3>
          <Link to="/portfolio" className="mt-6 inline-flex items-center gap-2 text-sm text-sky-300 hover:text-white">
            ← Back to portfolio
          </Link>
        </div>
      </section>
    </div>
  );
}
