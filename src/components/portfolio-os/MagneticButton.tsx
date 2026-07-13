import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion } from "framer-motion";

export function MagneticButton({
  children,
  className = "",
  onClick,
  strength = 18,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const onMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * strength;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * strength;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate3d(0,0,0)";
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={`transition-transform duration-300 ease-out ${className}`}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.button>
  );
}