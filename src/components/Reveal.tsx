import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "fade" | "scale";

const offsets: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 32 },
  down: { y: -32 },
  left: { x: 32 },
  right: { x: -32 },
  fade: {},
  scale: { scale: 0.94 },
};

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  className,
  once = true,
  amount = 0.25,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}) {
  const prefersReduced = useReducedMotion();
  const off = offsets[direction];
  const variants: Variants = {
    hidden: prefersReduced
      ? { opacity: 0 }
      : { opacity: 0, x: off.x ?? 0, y: off.y ?? 0, scale: off.scale ?? 1 },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
    },
  };
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount, margin: "0px 0px -10% 0px" }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

export function RevealStagger({
  children,
  className,
  stagger = 0.08,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.2 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  direction = "up",
  className,
}: {
  children: ReactNode;
  direction?: Direction;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const off = offsets[direction];
  return (
    <motion.div
      className={className}
      variants={{
        hidden: prefersReduced
          ? { opacity: 0 }
          : { opacity: 0, x: off.x ?? 0, y: off.y ?? 0, scale: off.scale ?? 1 },
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}