import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export const Route = createFileRoute("/skyelite/rates")({
  head: () => ({ meta: [{ title: "Rates, SkyElite" }] }),
  component: Rates,
});

const TIERS = [
  { name: "Light Jet", from: "$3,200/hr", seats: "4–6 seats", perks: ["Up to 1,800 nm", "Wi-Fi onboard", "Catering included"] },
  { name: "Midsize Jet", from: "$5,400/hr", seats: "7–9 seats", perks: ["Up to 3,000 nm", "Stand-up cabin", "Premium catering"], featured: true },
  { name: "Heavy Jet", from: "$8,900/hr", seats: "10–14 seats", perks: ["Transatlantic range", "Private bedroom", "Dedicated crew"] },
];

function Rates() {
  return (
    <section className="pt-32 pb-24 px-6 sm:px-10 max-w-6xl mx-auto">
      <p className="text-xs uppercase tracking-[0.4em] text-white/60">Rates</p>
      <h1 className="mt-3 font-[Playfair_Display,serif] italic text-4xl sm:text-6xl leading-tight">
        Transparent pricing.<br />Zero surprises.
      </h1>

      <div className="mt-12 grid md:grid-cols-3 gap-5">
        {TIERS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`rounded-3xl border p-6 ${t.featured ? "bg-white text-black border-white" : "bg-white/5 border-white/10"}`}
          >
            <p className={`text-xs uppercase tracking-widest ${t.featured ? "text-black/60" : "text-white/60"}`}>{t.seats}</p>
            <h3 className="mt-1 text-2xl font-semibold">{t.name}</h3>
            <p className="mt-4 text-3xl font-[Playfair_Display,serif] italic">{t.from}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {t.perks.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> {p}
                </li>
              ))}
            </ul>
            <Link
              to="/skyelite/book"
              className={`mt-6 inline-flex w-full justify-center rounded-full px-5 py-2.5 text-sm font-semibold ${t.featured ? "bg-black text-white" : "bg-white text-black"}`}
            >
              Get a quote
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
