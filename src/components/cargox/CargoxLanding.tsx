import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X, Ship, Plane, Truck } from "lucide-react";
import Hls from "hls.js";
import type { CargoxVariant } from "@/data/cargox";

function useVideoSource(ref: React.RefObject<HTMLVideoElement | null>, src: string, isHls?: boolean) {
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (isHls) {
      if (v.canPlayType("application/vnd.apple.mpegurl")) {
        v.src = src;
        return;
      }
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(v);
        return () => hls.destroy();
      }
    } else {
      v.src = src;
    }
  }, [ref, src, isHls]);
}

const EXPO = [0.16, 1, 0.3, 1] as const;

export function CargoxLanding({ variant }: { variant: CargoxVariant }) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  useVideoSource(videoRef, variant.video, variant.isHls);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const slideX = (from: number, delay: number) => ({
    initial: { x: reduce ? 0 : from, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: reduce ? 0 : 0.85, ease: EXPO, delay: reduce ? 0 : delay },
  });

  return (
    <div className="min-h-screen w-full bg-[#111] flex items-center justify-center py-10 px-4">
      {/* iPhone 15 Pro mockup */}
      <div
        className="relative overflow-hidden"
        style={{
          width: "min(393px, 92vw)",
          aspectRatio: "393 / 852",
          background: "#1a1a1a",
          borderRadius: 54,
          border: "8px solid #2a2a2a",
          boxShadow: "inset 0 0 0 1px #3a3a3a, 0 30px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Dynamic island */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: 12, width: 126, height: 36, background: "#000", borderRadius: 20, zIndex: 200 }}
        />
        {/* Home indicator */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: 8, width: 134, height: 5, background: "rgba(255,255,255,0.3)", borderRadius: 3, zIndex: 200 }}
        />

        {/* Scrollable content */}
        <div
          className="absolute inset-0 overflow-y-auto text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ fontFamily: "Helvetica, Arial, sans-serif", containerType: "size" } as React.CSSProperties}
        >
          {/* SECTION 1: Hero */}
          <section className="relative w-full" style={{ height: "100cqb" }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onCanPlay={() => setReady(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />

            {/* Navbar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-14 z-20">
              <motion.div
                initial={{ x: reduce ? 0 : -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: EXPO }}
                className="font-black uppercase leading-none"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(22px, 6vw, 32px)" }}
              >
                <span className="text-white">CARGOX</span>{" "}
                <span style={{ color: "#ffda00" }}>GROUP</span>
              </motion.div>
              <motion.button
                aria-label="Menu"
                onClick={() => setMenuOpen((s) => !s)}
                initial={{ x: reduce ? 0 : 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: EXPO }}
                className="text-white"
              >
                {menuOpen ? <X size={28} /> : <Menu size={28} />}
              </motion.button>
            </div>

            {/* Menu overlay */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: EXPO }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-8 text-white text-2xl"
                  style={{ background: "#6682c2", zIndex: 99 }}
                >
                  {["Services", "Industries", "Company"].map((item, i) => (
                    <motion.a
                      key={item}
                      href="#"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: EXPO }}
                    >
                      {item}
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hero content */}
            <AnimatePresence>
              {ready && (
                <motion.div
                  key="hero"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-6"
                >
                  <div
                    className="uppercase font-black"
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800,
                      fontSize: "clamp(48px, 14vw, 72px)",
                      lineHeight: 0.82,
                    }}
                  >
                    <motion.div {...slideX(-400, 0)} className="text-white">
                      {variant.headline[0]}
                    </motion.div>
                    <motion.div {...slideX(400, 0.13)} className="text-right" style={{ color: "#ffda00" }}>
                      {variant.headline[1]}
                    </motion.div>
                    <motion.div {...slideX(-400, 0.26)} className="text-white">
                      {variant.headline[2]}
                    </motion.div>
                  </div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6, ease: EXPO }}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="group mt-6 inline-flex items-center gap-3 rounded-full pl-5 pr-1 py-1"
                    style={{ background: "#ffda00", color: "#002a35" }}
                  >
                    <span style={{ fontSize: 20 }}>{variant.ctaLabel}</span>
                    <span
                      className="inline-flex items-center justify-center rounded-full"
                      style={{ width: 44, height: 44, background: "#ffda00", border: "1px solid #002a35" }}
                    >
                      <motion.svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        initial={{ rotate: -135 }}
                        whileHover={{ rotate: -90 }}
                        transition={{ duration: 0.25 }}
                      >
                        <path d="M5 12h14M13 5l7 7-7 7" stroke="#002a35" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    </span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* SECTION 2: Info + map */}
          <section
            className="relative w-full"
            style={{
              background: "linear-gradient(180deg, #C8C7B3 0%, #F0B172 50%, #EA7C58 100%)",
              padding: "clamp(60px, 12vh, 120px) 20px",
            }}
          >
            <motion.div
              initial={{ x: -80, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, ease: EXPO }}
            >
              <div
                className="uppercase text-white"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(44px, 13vw, 64px)",
                  lineHeight: 0.95,
                }}
              >
                {variant.tagline}
              </div>
              <div style={{ color: "#1a1a1a", fontSize: "clamp(18px, 5vw, 26px)", marginTop: 8, lineHeight: 1.2 }}>
                {variant.taglineSub[0]}
                <br />
                {variant.taglineSub[1]}
              </div>
            </motion.div>

            {/* Map */}
            <div className="relative my-10" style={{ aspectRatio: "435 / 340", marginInline: -20 }}>
              <img
                src="https://polo-pecan-73837341.figma.site/_assets/v11/b6d561167283e799453232309bd13dd78b2d1afa.png"
                alt=""
                className="absolute inset-0 h-full w-full object-contain"
              />
              <svg
                viewBox="0 0 299.037 142.509"
                className="absolute"
                style={{ left: "10%", top: "18%", width: "80%" }}
              >
                {[
                  "M128.161 74.6764C79.9989 130.001 71.9994 46.0005 20.9815 111.737",
                  "M216.999 9.99985C260.499 12.4998 222.499 71.9998 291.999 58.9998",
                  "M130.102 70.9998C144.499 -32.0002 183.852 70.2739 219.999 3.99985",
                  "M14.4999 16.9998C111 20.9998 -53.0003 73.4998 21.4999 107",
                ].map((d, i) => (
                  <motion.path
                    key={i}
                    d={d}
                    stroke="#FFDA00"
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, delay: 0.1 + i * 0.15, ease: "easeOut" }}
                  />
                ))}
                {[
                  [9.519, 15.519],
                  [289.519, 59.518],
                  [220.519, 9.519],
                  [125.518, 78.519],
                  [19.519, 104.519],
                ].map(([cx, cy], i) => (
                  <motion.g
                    key={i}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: EXPO }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  >
                    <circle cx={cx} cy={cy} r={9.519} fill="#FFDA00" />
                    <circle cx={cx} cy={cy} r={3.389} fill="#002A35" />
                  </motion.g>
                ))}
              </svg>

              {/* Floating icons */}
              {[
                { Icon: Ship, style: { left: "26%", top: "28.9%" } },
                { Icon: Truck, style: { left: "70.8%", top: "15.6%", transform: "rotate(9.73deg)" } },
                { Icon: Plane, style: { left: "55.2%", top: "52.1%", transform: "rotate(180deg) scaleY(-1)" } },
              ].map(({ Icon, style }, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white flex items-center justify-center shadow-lg"
                  style={{ width: "16%", aspectRatio: "1", ...style }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.15, duration: 0.5, ease: EXPO }}
                >
                  <motion.div
                    animate={reduce ? {} : { y: [0, -6, 0] }}
                    transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Icon size={22} color="#002a35" />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="space-y-8">
              {variant.stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ x: i % 2 === 0 ? -80 : 80, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, ease: EXPO }}
                  style={{ marginLeft: i === 1 ? "clamp(40px, 12vw, 90px)" : 0 }}
                >
                  <div
                    className="text-white"
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800,
                      fontSize: "clamp(50px, 14vw, 72px)",
                      lineHeight: 0.9,
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ color: "#1a1a1a", fontSize: "clamp(14px, 3.8vw, 18px)", lineHeight: 1.3, marginTop: 6 }}>
                    {s.label[0]}
                    <br />
                    {s.label[1]}
                    <br />
                    {s.label[2]}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* SECTION 3: Contact */}
          <section
            style={{
              background: "#0a1f2b",
              padding: "clamp(48px, 10vh, 96px) 20px clamp(56px, 8vh, 96px)",
            }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EXPO }}
            >
              <h2
                className="uppercase"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(44px, 13vw, 64px)",
                  lineHeight: 0.95,
                }}
              >
                <span className="text-white">CONTACT </span>
                <span style={{ color: "#ffda00" }}>US</span>
              </h2>
              <p style={{ color: "#b0b8bc", fontSize: "clamp(14px, 3.8vw, 18px)", marginTop: 8 }}>
                Complete the form and our team will contact you soon.
              </p>
            </motion.div>

            <form
              className="mt-8 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              {["Name", "Email", "Message"].map((label, i) => (
                <motion.div
                  key={label}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: EXPO }}
                >
                  {label === "Message" ? (
                    <textarea
                      placeholder={label}
                      rows={3}
                      className="w-full bg-transparent border-b border-white/30 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffda00]"
                    />
                  ) : (
                    <input
                      type={label === "Email" ? "email" : "text"}
                      placeholder={label}
                      className="w-full bg-transparent border-b border-white/30 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#ffda00]"
                    />
                  )}
                </motion.div>
              ))}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold"
                style={{ background: "#ffda00", color: "#002a35" }}
              >
                Send message
              </motion.button>
            </form>

            <div className="mt-10 text-xs text-white/40 uppercase tracking-widest">
              CARGOX GROUP · {variant.kicker}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}