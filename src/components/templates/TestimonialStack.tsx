import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export type Testimonial = { quote: string; name: string; role?: string };

export function TestimonialStack({ items, interval = 4500 }: { items: Testimonial[]; interval?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % items.length), interval);
    return () => clearInterval(id);
  }, [items.length, interval]);

  return (
    <div className="relative h-56 w-full max-w-md">
      <AnimatePresence>
        {items.map((t, idx) => {
          const offset = (idx - i + items.length) % items.length;
          if (offset > 2) return null;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{
                opacity: 1 - offset * 0.25,
                y: offset * 12,
                scale: 1 - offset * 0.04,
                zIndex: items.length - offset,
              }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className="absolute inset-0 rounded-2xl border border-black/10 bg-white p-6 shadow-xl"
            >
              <p className="text-base text-neutral-800 leading-relaxed">"{t.quote}"</p>
              <p className="mt-4 text-sm font-semibold text-neutral-900">{t.name}</p>
              {t.role && <p className="text-xs text-neutral-500">{t.role}</p>}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
