import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/skyelite/faq")({
  head: () => ({ meta: [{ title: "FAQ, SkyElite" }] }),
  component: FAQ,
});

const QA = [
  { q: "How quickly can I book a flight?", a: "Most quotes are returned within 8 minutes. Aircraft can be wheels-up in as little as 4 hours." },
  { q: "Do you fly internationally?", a: "Yes, over 5,000 airports across 120+ countries." },
  { q: "What's included in the rate?", a: "Crew, fuel, landing fees, standard catering and Wi-Fi. Custom add-ons billed separately." },
  { q: "Can I bring pets?", a: "Absolutely. Pets fly in the cabin with you at no extra charge." },
  { q: "How do I become a member?", a: "Reach out through the Book Now page and our concierge will tailor a membership to your travel pattern." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="pt-32 pb-24 px-6 sm:px-10 max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-[0.4em] text-white/60">FAQ</p>
      <h1 className="mt-3 font-[Playfair_Display,serif] italic text-4xl sm:text-6xl">Good questions.</h1>
      <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
        {QA.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-lg font-medium">{item.q}</span>
                {isOpen ? <Minus className="w-5 h-5 shrink-0" /> : <Plus className="w-5 h-5 shrink-0" />}
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-white/70">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
