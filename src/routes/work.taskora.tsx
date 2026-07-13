import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, TrendingUp, Users, DollarSign, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/work/taskora")({
  head: () => ({
    meta: [
      { title: "Taskora, Simplify your workflow · Eager Beaver" },
      { name: "description", content: "Dark hero with a light-mode dashboard preview for Taskora." },
      { property: "og:title", content: "Taskora, Simplify your workflow" },
      { property: "og:description", content: "Trusted by 30,000+ clients. Stay focused." },
    ],
  }),
  component: TaskoraPage,
});

const VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4";

function TaskoraPage() {
  const reduce = useReducedMotion();
  const fade = reduce
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white antialiased font-[Inter,sans-serif]">
      {!reduce && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          src={VIDEO}
        />
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/70 to-[#050505]" />

      <header className="relative z-20 mx-auto max-w-6xl mt-6 px-4">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-2.5">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Portfolio
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/70 font-[Manrope,sans-serif]">
            <a className="hover:text-white transition">Features</a>
            <a className="hover:text-white transition">Customers</a>
            <a className="hover:text-white transition">Pricing</a>
          </nav>
          <a className="rounded-full bg-white text-black text-sm font-semibold px-4 py-1.5 hover:bg-white/90 transition font-[Cabin,sans-serif]">Sign up</a>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
        <motion.span {...fade} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75 font-[Manrope,sans-serif]">
          ⭐ Trusted by +30,000 clients
        </motion.span>

        <motion.h1
          {...fade}
          transition={reduce ? undefined : { duration: 0.9, delay: 0.1 }}
          className="mt-6 text-5xl sm:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight font-light"
        >
          Simplify Your <span className="italic font-[Instrument_Serif,serif] font-normal">Workflow.</span><br />
          Stay Focused.
        </motion.h1>

        <motion.p
          {...fade}
          transition={reduce ? undefined : { duration: 0.8, delay: 0.25 }}
          className="mt-5 max-w-xl mx-auto text-white/60"
        >
          One workspace for every task, deal and document. Built for the teams that ship.
        </motion.p>

        <motion.div
          {...fade}
          transition={reduce ? undefined : { duration: 0.8, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <a className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-white/90 transition font-[Cabin,sans-serif]">
            Start free <ArrowUpRight className="w-4 h-4" />
          </a>
          <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold hover:bg-white/10 transition font-[Cabin,sans-serif]">
            Book a demo
          </a>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          {...fade}
          transition={reduce ? undefined : { duration: 1, delay: 0.6 }}
          className="mt-16 mx-auto max-w-5xl rounded-2xl overflow-hidden border border-white/10 bg-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)] text-left text-gray-800"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-gray-400">taskora.app/dashboard</span>
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>

          <div className="grid grid-cols-3 gap-4 p-5">
            {[
              { icon: DollarSign, k: "Revenue", v: "$248,920", d: "+12.4%" },
              { icon: Users, k: "Active users", v: "8,142", d: "+3.1%" },
              { icon: TrendingUp, k: "Conversion", v: "4.8%", d: "+0.6%" },
            ].map(({ icon: I, k, v, d }) => (
              <div key={k} className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{k}</span>
                  <I className="w-4 h-4 text-gray-400" />
                </div>
                <p className="mt-2 text-xl font-semibold text-gray-900">{v}</p>
                <p className="text-xs text-emerald-600 mt-1">{d}</p>
              </div>
            ))}
          </div>

          <div className="px-5 pb-5">
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-3">Revenue · last 30 days</p>
              <svg viewBox="0 0 400 100" className="w-full h-24">
                <defs>
                  <linearGradient id="ta" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7b39fc" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#7b39fc" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,80 C40,60 70,72 110,50 C150,28 180,40 220,30 C260,20 300,55 340,38 C370,25 390,30 400,28 L400,100 L0,100 Z" fill="url(#ta)" />
                <path d="M0,80 C40,60 70,72 110,50 C150,28 180,40 220,30 C260,20 300,55 340,38 C370,25 390,30 400,28" fill="none" stroke="#7b39fc" strokeWidth="2" />
              </svg>
            </div>

            <div className="mt-4 rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Deal</th>
                    <th className="text-left px-4 py-2 font-medium">Owner</th>
                    <th className="text-right px-4 py-2 font-medium">Value</th>
                    <th className="text-right px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Aurai onboarding", "Eager", "$24,000", "Open"],
                    ["USD Halo integration", "Eager", "$58,200", "Won"],
                    ["SkyElite Q3", "Eager", "$12,400", "Open"],
                  ].map(([a, b, c, s]) => (
                    <tr key={a} className="border-t border-gray-100">
                      <td className="px-4 py-2.5 text-gray-900">{a}</td>
                      <td className="px-4 py-2.5 text-gray-600">{b}</td>
                      <td className="px-4 py-2.5 text-gray-900 text-right">{c}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${s === "Won" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{s}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
