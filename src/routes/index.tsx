import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TOONHUB — 3D Shape Figurines" },
      { name: "description", content: "TOONHUB figurines: stunning 3D character art, flawlessly crafted and ready to ship." },
      { property: "og:title", content: "TOONHUB — 3D Shape Figurines" },
      { property: "og:description", content: "TOONHUB figurines: stunning 3D character art, flawlessly crafted and ready to ship." },
    ],
  }),
  component: Index,
});

const IMAGES = [
  { src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png", bg: "#F4845F", panel: "#F79B7F" },
  { src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png", bg: "#6BBF7A", panel: "#85CC92" },
  { src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png", bg: "#E882B4", panel: "#ED9DC4" },
  { src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png", bg: "#6EB5FF", panel: "#8DC4FF" },
];

const EASE = "cubic-bezier(0.4,0,0.2,1)";
const DURATION = 650;
const AUTOPLAY_MS = 4500;

const GRAIN_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.08'/></svg>`,
  );

function Index() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loaded, setLoaded] = useState<boolean[]>(() => IMAGES.map(() => false));
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    IMAGES.forEach((i, idx) => {
      const img = new Image();
      img.onload = () =>
        setLoaded((prev) => {
          if (prev[idx]) return prev;
          const next = [...prev];
          next[idx] = true;
          return next;
        });
      img.src = i.src;
      if (img.complete) {
        setLoaded((prev) => {
          if (prev[idx]) return prev;
          const next = [...prev];
          next[idx] = true;
          return next;
        });
      }
    });
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const navigate = useCallback(
    (dir: "next" | "prev") => {
      if (isAnimating) return;
      setIsAnimating(true);
      setActiveIndex((prev) => (dir === "next" ? (prev + 1) % 4 : (prev + 3) % 4));
      window.setTimeout(() => setIsAnimating(false), DURATION);
    },
    [isAnimating],
  );

  // Autoplay
  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = window.setInterval(() => navigate("next"), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, reducedMotion, navigate]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigate("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigate("next");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const onTouchStart = (e: React.TouchEvent) => {
    setPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      navigate(dx < 0 ? "next" : "prev");
    }
    window.setTimeout(() => setPaused(false), 1500);
  };

  const handleDiscover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("details");
    if (el) el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  const center = activeIndex;
  const left = (activeIndex + 3) % 4;
  const right = (activeIndex + 1) % 4;
  const back = (activeIndex + 2) % 4;

  const getRoleStyle = (i: number): React.CSSProperties => {
    const dur = reducedMotion ? 0 : DURATION;
    const base: React.CSSProperties = {
      position: "absolute",
      aspectRatio: "0.6 / 1",
      transition: `transform ${dur}ms ${EASE}, filter ${dur}ms ${EASE}, opacity ${dur}ms ${EASE}, left ${dur}ms ${EASE}, bottom ${dur}ms ${EASE}, height ${dur}ms ${EASE}`,
      willChange: "transform, filter, opacity",
    };
    if (i === center) {
      return {
        ...base,
        left: "50%",
        bottom: isMobile ? "22%" : 0,
        height: isMobile ? "60%" : "92%",
        transform: `translateX(-50%) scale(${isMobile ? 1.25 : 1.68})`,
        filter: "blur(0px)",
        opacity: 1,
        zIndex: 20,
      };
    }
    if (i === left) {
      return {
        ...base,
        left: isMobile ? "20%" : "30%",
        bottom: isMobile ? "32%" : "12%",
        height: isMobile ? "16%" : "28%",
        transform: "translateX(-50%) scale(1)",
        filter: "blur(2px)",
        opacity: 0.85,
        zIndex: 10,
      };
    }
    if (i === right) {
      return {
        ...base,
        left: isMobile ? "80%" : "70%",
        bottom: isMobile ? "32%" : "12%",
        height: isMobile ? "16%" : "28%",
        transform: "translateX(-50%) scale(1)",
        filter: "blur(2px)",
        opacity: 0.85,
        zIndex: 10,
      };
    }
    // back
    return {
      ...base,
      left: "50%",
      bottom: isMobile ? "32%" : "12%",
      height: isMobile ? "13%" : "22%",
      transform: "translateX(-50%) scale(1)",
      filter: "blur(4px)",
      opacity: 1,
      zIndex: 5,
    };
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: IMAGES[activeIndex].bg,
        transition: `background-color ${reducedMotion ? 0 : DURATION}ms ${EASE}`,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        className="relative w-full"
        style={{ height: "100vh", overflow: "hidden" }}
        role="region"
        aria-roledescription="carousel"
        aria-label="TOONHUB figurine carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 50,
            opacity: 0.4,
            backgroundImage: `url("${GRAIN_SVG}")`,
            backgroundSize: "200px 200px",
            backgroundRepeat: "repeat",
          }}
        />

        {/* Ghost text */}
        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
          style={{ zIndex: 2, top: "18%" }}
        >
          <h1
            style={{
              fontFamily: "Anton, sans-serif",
              fontSize: "clamp(90px, 28vw, 380px)",
              fontWeight: 900,
              color: "#ffffff",
              opacity: 1,
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              margin: 0,
            }}
          >
            3D SHAPE
          </h1>
        </div>

        {/* Brand */}
        <div
          className="absolute top-6 left-4 sm:left-8 text-xs font-semibold uppercase"
          style={{ zIndex: 60, color: "#fff", opacity: 0.9, letterSpacing: "0.18em" }}
        >
          TOONHUB
        </div>

        {/* Carousel */}
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {IMAGES.map((img, i) => (
            <div
              key={i}
              style={getRoleStyle(i)}
              aria-hidden={i !== activeIndex}
              role="group"
              aria-roledescription="slide"
              aria-label={`Figurine ${i + 1} of ${IMAGES.length}`}
            >
              {!loaded[i] && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(135deg, ${img.panel}, ${img.bg})`,
                    borderRadius: 24,
                    opacity: 0.6,
                    animation: "pulse 1.4s ease-in-out infinite",
                  }}
                />
              )}
              <img
                src={img.src}
                alt={`TOONHUB figurine ${i + 1}`}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "bottom center",
                  opacity: loaded[i] ? 1 : 0,
                  transition: "opacity 300ms ease",
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom-left */}
        <div
          className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24"
          style={{ zIndex: 60, maxWidth: 320 }}
        >
          <p
            className="mb-2 sm:mb-3 text-base sm:text-[22px] font-bold uppercase tracking-widest"
            style={{ color: "#fff", opacity: 0.95, letterSpacing: "0.02em" }}
          >
            TOONHUB FIGURINES
          </p>
          <p
            className="hidden sm:block text-xs sm:text-sm mb-4 sm:mb-5"
            style={{ color: "#fff", opacity: 0.85, lineHeight: 1.6 }}
          >
            The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now.
          </p>
          <div className="flex gap-3">
            <NavButton onClick={() => navigate("prev")} aria-label="Previous figurine" aria-controls="toonhub-carousel">
              <ArrowLeft size={26} strokeWidth={2.25} color="#fff" />
            </NavButton>
            <NavButton onClick={() => navigate("next")} aria-label="Next figurine" aria-controls="toonhub-carousel">
              <ArrowRight size={26} strokeWidth={2.25} color="#fff" />
            </NavButton>
          </div>
        </div>

        {/* Bottom-right discover */}
        <div className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10" style={{ zIndex: 60 }}>
          <a
            href="#details"
            onClick={handleDiscover}
            aria-label="Scroll to figurine details"
            className="flex items-center group"
            style={{
              fontFamily: "Anton, sans-serif",
              fontSize: "clamp(20px, 4vw, 56px)",
              fontWeight: 400,
              color: "#fff",
              opacity: 0.95,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "opacity 200ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.95")}
          >
            DISCOVER IT
            <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8 ml-2" strokeWidth={2.25} />
          </a>
        </div>
      </div>

      {/* Details section — DISCOVER IT target */}
      <section
        id="details"
        className="w-full bg-white text-neutral-900 px-6 py-20 sm:px-12 sm:py-28"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-4">
            About the collection
          </p>
          <h2
            style={{
              fontFamily: "Anton, sans-serif",
              fontSize: "clamp(40px, 8vw, 110px)",
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Figurines, crafted in 3D.
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold mb-2">Hand-tuned shapes</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Every figurine is sculpted, lit, and posed by hand before being rendered at studio quality.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Print-ready</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Models ship as watertight meshes optimized for resin and FDM printers up to 200mm.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Ships worldwide</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Each order is packed in custom foam and tracked door-to-door from our studio.
              </p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 0.45 } 50% { opacity: 0.75 } }
      `}</style>
    </div>
  );
}

function NavButton({
  children,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      {...rest}
      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
      style={{
        backgroundColor: "transparent",
        border: "2px solid #fff",
        transition: "transform 150ms ease, background-color 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.08)";
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {children}
    </button>
  );
}
