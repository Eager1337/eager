import { motion } from "framer-motion";

export function InflatingText({ text, className = "" }: { text: string; className?: string }) {
  const letters = Array.from(text);
  return (
    <span className={`inline-block ${className}`}>
      {letters.map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block origin-bottom"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.18, 0.96, 1] }}
          transition={{
            duration: 2.4,
            delay: i * 0.08,
            repeat: Infinity,
            repeatDelay: 1.2,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </span>
  );
}
