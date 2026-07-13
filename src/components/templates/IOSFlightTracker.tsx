import { motion, useReducedMotion } from "framer-motion";
import { Plane } from "lucide-react";

export function IOSFlightTracker({
  origin = "JFK",
  destination = "LHR",
  flight = "BA178",
  progress = 0.62,
}: {
  origin?: string;
  destination?: string;
  flight?: string;
  progress?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="mx-auto max-w-sm rounded-[2.5rem] bg-[#0B1220] p-5 ring-1 ring-white/10 shadow-2xl">
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>{flight}</span>
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300">On time</span>
      </div>

      <div className="mt-4 flex items-end justify-between text-white">
        <div>
          <p className="text-3xl font-semibold tracking-tight">{origin}</p>
          <p className="text-xs text-white/50">New York</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold tracking-tight">{destination}</p>
          <p className="text-xs text-white/50">London</p>
        </div>
      </div>

      <div className="relative mt-6 h-12">
        <svg viewBox="0 0 300 40" className="absolute inset-0 w-full h-full">
          <path d="M10 30 Q 150 -10 290 30" stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" fill="none" />
          <path d="M10 30 Q 150 -10 290 30" stroke="white" strokeWidth="2" fill="none"
            strokeDasharray="400"
            strokeDashoffset={400 - 400 * progress}
          />
          <circle cx="10" cy="30" r="3" fill="white" />
          <circle cx="290" cy="30" r="3" fill="white" />
        </svg>
        <motion.div
          className="absolute"
          style={{ top: 0 }}
          initial={{ left: `${progress * 100}%` }}
          animate={reduce ? undefined : { left: [`${progress * 100}%`, `${(progress + 0.02) * 100}%`, `${progress * 100}%`] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Plane className="w-5 h-5 -translate-x-1/2 text-sky-300" />
        </motion.div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center text-white">
        <Stat label="Altitude" value="38,000 ft" />
        <Stat label="Speed" value="540 mph" />
        <Stat label="ETA" value="3h 12m" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
