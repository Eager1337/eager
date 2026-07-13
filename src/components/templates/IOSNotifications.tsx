import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type Notif = { id: number; app: string; title: string; body: string; time: string };

const DEFAULT: Notif[] = [
  { id: 1, app: "Messages", title: "Sam", body: "On my way 🚗", time: "now" },
  { id: 2, app: "Calendar", title: "Standup", body: "In 10 minutes · Zoom", time: "1m" },
  { id: 3, app: "Mail", title: "Stripe", body: "Payment of $4,200 received.", time: "2m" },
  { id: 4, app: "Slack", title: "#design", body: "Liv shared a Figma file", time: "5m" },
];

export function IOSNotifications({ items = DEFAULT, interval = 1200 }: { items?: Notif[]; interval?: number }) {
  const [shown, setShown] = useState<Notif[]>([]);

  useEffect(() => {
    setShown([]);
    let i = 0;
    const id = setInterval(() => {
      if (i >= items.length) return clearInterval(id);
      setShown((s) => [items[i], ...s]);
      i++;
    }, interval);
    return () => clearInterval(id);
  }, [items, interval]);

  return (
    <div className="mx-auto max-w-sm space-y-2 p-4">
      <AnimatePresence initial={false}>
        {shown.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-3 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 grid place-items-center text-xs font-bold text-white">
                {n.app[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs uppercase tracking-wider text-white/50">{n.app}</p>
                  <span className="text-[10px] text-white/40">{n.time}</span>
                </div>
                <p className="text-sm font-semibold text-white truncate">{n.title}</p>
                <p className="text-xs text-white/70 truncate">{n.body}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
