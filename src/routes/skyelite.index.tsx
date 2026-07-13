import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Plane, Compass } from "lucide-react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4";
const POSTER_URL =
  "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1920&q=70";

export const Route = createFileRoute("/skyelite/")({
  component: SkyEliteHero,
});

function SkyEliteHero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative h-[100dvh] w-full overflow-hidden">
      {reduce ? (
        <img
          src={POSTER_URL}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={VIDEO_URL}
          poster={POSTER_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/80" />

      <div className="relative z-10 h-full flex flex-col justify-end px-6 sm:px-10 pb-16 sm:pb-24 max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs sm:text-sm uppercase tracking-[0.4em] text-white/70"
        >
          Private aviation · est. 2026
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-4 font-[Playfair_Display,serif] italic text-5xl sm:text-7xl md:text-8xl leading-[0.95] max-w-4xl"
        >
          Fly on your own<br />terms.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 max-w-xl text-base sm:text-lg text-white/80 leading-relaxed"
        >
          On-demand private jet charter with worldwide reach, hand-picked crews,
          and a concierge that never sleeps.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Link
            to="/skyelite/book"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 transition"
          >
            <Plane className="w-4 h-4" /> Book Now <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            to="/skyelite/story"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition"
          >
            <Compass className="w-4 h-4" /> Discover
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
