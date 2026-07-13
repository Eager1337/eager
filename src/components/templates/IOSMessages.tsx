import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Msg = { from: "me" | "them"; text: string };

const DEFAULT: Msg[] = [
  { from: "them", text: "Hey, you up?" },
  { from: "me", text: "Yeah, what's wrong?" },
  { from: "them", text: "Just got the offer 🎉" },
  { from: "me", text: "no way!!! congrats 🥹" },
  { from: "them", text: "Drinks tmrw?" },
  { from: "me", text: "I'm there. 7pm." },
];

export function IOSMessages({ messages = DEFAULT, contact = "Sam", stepMs = 900 }: { messages?: Msg[]; contact?: string; stepMs?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = setInterval(() => setN((v) => (v >= messages.length ? v : v + 1)), stepMs);
    return () => clearInterval(id);
  }, [messages, stepMs]);

  return (
    <div className="mx-auto flex h-[560px] max-w-sm flex-col rounded-[2.5rem] bg-[#0B0B10] ring-1 ring-white/10 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-center border-b border-white/10 px-4 py-3 text-white">
        <div className="text-center">
          <div className="mx-auto mb-1 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm font-semibold">
            {contact[0]}
          </div>
          <p className="text-xs">{contact}</p>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {messages.slice(0, n).map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                m.from === "me"
                  ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-br-sm"
                  : "bg-white/10 text-white rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-white/10 px-3 py-2">
        <div className="rounded-full bg-white/5 px-4 py-2 text-xs text-white/40">iMessage</div>
      </div>
    </div>
  );
}
