import { useEffect, useState } from "react";

/**
 * Two little characters, a beaver 🦫 and an ant 🐜, that wander around
 * the viewport. Fixed-position, pointer-events: none, so they never block UI.
 */
export function RoamingCritters() {
  const [w, setW] = useState(1200);
  const [h, setH] = useState(800);

  useEffect(() => {
    const on = () => {
      setW(window.innerWidth);
      setH(window.innerHeight);
    };
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden>
      <Wanderer emoji="🦫" size={40} speed={22} width={w} height={h} startX={0.05} startY={0.85} />
      <Wanderer emoji="🐜" size={22} speed={9} width={w} height={h} startX={0.9} startY={0.15} />
      <Wanderer emoji="🐜" size={18} speed={7} width={w} height={h} startX={0.4} startY={0.5} />
    </div>
  );
}

function Wanderer({
  emoji, size, speed, width, height, startX, startY,
}: { emoji: string; size: number; speed: number; width: number; height: number; startX: number; startY: number }) {
  const [pos, setPos] = useState({ x: startX * width, y: startY * height });
  const [target, setTarget] = useState({ x: Math.random() * width, y: Math.random() * height });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setPos((p) => {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 6) {
          setTarget({ x: Math.random() * width, y: Math.random() * height });
          return p;
        }
        const step = speed * dt * 6;
        return { x: p.x + (dx / dist) * step, y: p.y + (dy / dist) * step };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, speed, width, height]);

  const angle = Math.atan2(target.y - pos.y, target.x - pos.x);
  const flip = Math.cos(angle) < 0 ? -1 : 1;

  return (
    <span
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        fontSize: size,
        transform: `translate(-50%,-50%) scaleX(${flip})`,
        transition: "left 60ms linear, top 60ms linear",
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
      }}
    >
      {emoji}
    </span>
  );
}