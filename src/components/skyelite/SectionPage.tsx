import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function SectionPage({
  eyebrow,
  title,
  body,
  highlights,
}: {
  eyebrow: string;
  title: string;
  body: string;
  highlights?: { k: string; v: string }[];
}) {
  return (
    <section className="pt-32 pb-24 px-6 sm:px-10 max-w-5xl mx-auto">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs uppercase tracking-[0.4em] text-white/60"
      >
        {eyebrow}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7 }}
        className="mt-3 font-[Playfair_Display,serif] italic text-4xl sm:text-6xl md:text-7xl leading-[1.02]"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mt-6 text-lg text-white/75 max-w-2xl leading-relaxed"
      >
        {body}
      </motion.p>

      {highlights && (
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-xl">
          {highlights.map((h) => (
            <div key={h.v} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-[Playfair_Display,serif] italic text-3xl">{h.k}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-white/60">{h.v}</p>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/skyelite/book"
        className="mt-12 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 transition"
      >
        Book a flight <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  );
}
