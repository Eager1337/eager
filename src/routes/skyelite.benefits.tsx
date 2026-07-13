import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, Shield, Sparkles, Globe, Heart, Crown } from "lucide-react";

export const Route = createFileRoute("/skyelite/benefits")({
  head: () => ({ meta: [{ title: "Benefits, SkyElite" }] }),
  component: Benefits,
});

const ITEMS = [
  { icon: Clock, t: "Time, returned.", b: "Skip the lines. Arrive 15 minutes before wheels-up." },
  { icon: Globe, t: "Global reach.", b: "Access to over 5,000 airports worldwide." },
  { icon: Shield, t: "Safety first.", b: "ARGUS Platinum operators only." },
  { icon: Crown, t: "True privacy.", b: "Your aircraft, your crew, your guests." },
  { icon: Sparkles, t: "Bespoke service.", b: "Tailored catering, ground transfer, and stays." },
  { icon: Heart, t: "Loyalty rewarded.", b: "Members unlock priority and reduced rates." },
];

function Benefits() {
  return (
    <section className="pt-32 pb-24 px-6 sm:px-10 max-w-6xl mx-auto">
      <p className="text-xs uppercase tracking-[0.4em] text-white/60">Benefits</p>
      <h1 className="mt-3 font-[Playfair_Display,serif] italic text-4xl sm:text-6xl">Why members stay.</h1>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ITEMS.map((it, i) => (
          <motion.div
            key={it.t}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
          >
            <it.icon className="w-6 h-6 text-white/90" />
            <h3 className="mt-4 text-lg font-semibold">{it.t}</h3>
            <p className="mt-1 text-sm text-white/70">{it.b}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
