import { motion } from "framer-motion";
import { ReactNode } from "react";

export function OrbitingCards({
  center,
  items,
  radius = 160,
  duration = 24,
}: {
  center: ReactNode;
  items: ReactNode[];
  radius?: number;
  duration?: number;
}) {
  return (
    <div className="relative mx-auto" style={{ width: radius * 2 + 120, height: radius * 2 + 120 }}>
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {items.map((node, i) => {
          const angle = (i / items.length) * 2 * Math.PI;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ x, y }}
              animate={{ rotate: -360 }}
              transition={{ duration, repeat: Infinity, ease: "linear" }}
            >
              {node}
            </motion.div>
          );
        })}
      </motion.div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">{center}</div>
    </div>
  );
}
