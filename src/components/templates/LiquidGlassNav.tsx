import { ReactNode } from "react";

export function LiquidGlassNav({ items, cta }: { items: { label: string; href?: string }[]; cta?: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href ?? "#"}
          className="px-4 py-1.5 rounded-full text-sm text-white/85 hover:text-white hover:bg-white/15 transition-colors"
        >
          {it.label}
        </a>
      ))}
      {cta && <div className="ml-1">{cta}</div>}
    </div>
  );
}
