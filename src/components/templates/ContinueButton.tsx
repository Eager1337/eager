import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function ContinueButton({ label = "Continue", onClick }: { label?: string; onClick?: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="group relative inline-flex items-center gap-3 rounded-full bg-black px-6 py-3.5 text-white font-medium shadow-lg overflow-hidden"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/30 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="relative">{label}</span>
      <motion.span
        className="relative"
        initial={{ x: 0 }}
        whileHover={{ x: 4 }}
      >
        <ArrowRight className="w-4 h-4" />
      </motion.span>
    </motion.button>
  );
}
