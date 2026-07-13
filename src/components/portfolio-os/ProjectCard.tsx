import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "../../data/projects";

export function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <motion.button
      onClick={onOpen}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] text-left backdrop-blur transition-colors hover:border-white/25"
    >
      <div
        className="relative h-44 w-full overflow-hidden"
        style={{ background: project.preview }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur">
          {project.category}
        </div>
        <div className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-black opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </div>
        <div className="absolute bottom-3 left-4 text-[9px] font-mono uppercase tracking-widest text-white/80">
          /explore/{project.slug}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-bold leading-tight text-white">{project.title}</h3>
        <p className="text-sm text-white/60 line-clamp-2">{project.tagline}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {project.stack.slice(0, 3).map((s) => (
            <span key={s} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/70">
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}