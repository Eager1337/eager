import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Award, Code2, Crown, GitFork, Github, Sparkles, Star, X } from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import charBlack from "../assets/char-black.png";
import charWhite from "../assets/char-white.png";
import toonRedFull from "../assets/toon-red-full.png.asset.json";
import toonPink from "../assets/toon-pink.png.asset.json";
import onePieceCast from "../assets/one-piece-cast.png.asset.json";
import saitama from "../assets/saitama.png.asset.json";
import { useContent } from "../lib/content-store";
import { buildPublicDemo } from "../lib/site-builder.functions";

export const Route = createFileRoute("/")({
  component: HomePage,
});

/* ------------------- TOONHUB HERO ------------------- */

const BASE_IMAGES = [
  {
    src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png",
    bg: "#F4845F",
    label: "Toon 01",
  },
  {
    src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png",
    bg: "#6BBF7A",
    label: "Toon 02",
  },
  {
    src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png",
    bg: "#E882B4",
    label: "Toon 03",
  },
  {
    src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png",
    bg: "#6EB5FF",
    label: "Toon 04",
  },
  { src: charBlack, bg: "#1A1A1A", label: "Ink Black" },
  { src: charWhite, bg: "#D9D9D9", label: "Cast White" },
  { src: toonRedFull.url, bg: "#B21F1F", label: "Red Signature" },
  { src: toonPink.url, bg: "#F0A6B8", label: "Pink Studio" },
  { src: onePieceCast.url, bg: "#0A1A2E", label: "One Piece Crew" },
  { src: saitama.url, bg: "#050505", label: "One Punch" },
];

const GRAIN_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/></svg>`;
const EASE = "cubic-bezier(0.4,0,0.2,1)";
const ITEM_TRANSITION = `transform 650ms ${EASE}, filter 650ms ${EASE}, opacity 650ms ${EASE}, left 650ms ${EASE}, bottom 650ms ${EASE}, height 650ms ${EASE}`;

function ToonhubHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const { toonSlides } = useContent();
  // Merge admin-added slides after the built-in ones (admin can also override the first 4 via defaults)
  const IMAGES = [
    ...BASE_IMAGES,
    ...toonSlides
      .filter((s) => !BASE_IMAGES.some((b) => b.src === s.src))
      .map((s) => ({ src: s.src, bg: s.bg, label: s.label })),
  ];
  const N = IMAGES.length;
  const safeIndex = Math.min(activeIndex, N - 1);
  const current = IMAGES[safeIndex];

  const navigate = useCallback(
    (dir: "next" | "prev") => {
      setActiveIndex((prev) => (dir === "next" ? (prev + 1) % N : (prev + N - 1) % N));
    },
    [N],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") navigate("next");
      else if (e.key === "ArrowLeft") navigate("prev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) navigate(dx < 0 ? "next" : "prev");
    touchStartX.current = null;
  };

  return (
    <div
      role="region"
      aria-label="Toonhub figurines carousel"
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: current.bg,
        transition: `background-color 650ms ${EASE}`,
        fontFamily: "Inter, sans-serif",
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative w-full" style={{ height: "100vh", overflow: "hidden" }}>
        <div
          className="grain-overlay absolute inset-0 pointer-events-none"
          style={{
            zIndex: 50,
            backgroundImage: `url("${GRAIN_SVG}")`,
            backgroundSize: "200px 200px",
            backgroundRepeat: "repeat",
            opacity: 0.4,
          }}
        />

        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
          style={{ zIndex: 2, top: "18%" }}
        >
          <span
            style={{
              fontFamily: "Anton, sans-serif",
              fontSize: "clamp(48px, 17.6vw, 240px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            EAGER BEAVERS
          </span>
        </div>

        <div
          className="absolute top-6 left-4 sm:left-8 text-xs font-semibold uppercase"
          style={{ zIndex: 60, color: "#fff", opacity: 0.9, letterSpacing: "0.18em" }}
        >
          TOONHUB
        </div>

        {/* Fixed stage, object-contain guarantees no cropping at any breakpoint */}
        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{ zIndex: 3, paddingBottom: "6%" }}
        >
          <div className="relative h-[78%] w-full max-w-[640px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.img
                key={current.src}
                src={current.src}
                alt={current.label}
                draggable={false}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 h-full w-full"
                style={{ objectFit: "contain", objectPosition: "bottom center" }}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Slide indicator */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5"
          style={{ zIndex: 60 }}
        >
          {IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>

        <div
          className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24"
          style={{ zIndex: 60, maxWidth: 320 }}
        >
          <h2
            className="mb-2 sm:mb-3 text-base sm:text-[22px] font-bold uppercase tracking-widest"
            style={{ color: "#fff" }}
          >
            {current.label}
          </h2>
          <p
            className="hidden sm:block text-xs sm:text-sm mb-4 sm:mb-5"
            style={{ color: "#fff", opacity: 0.85, lineHeight: 1.6 }}
          >
            The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is
            flawless. Many thanks! Wishing you the win. Order now.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("prev")}
              aria-label="Previous figurine"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 border-white text-white hover:bg-white/15 hover:scale-110 transition-all duration-150"
            >
              <ArrowLeft size={26} strokeWidth={2.25} />
            </button>
            <button
              onClick={() => navigate("next")}
              aria-label="Next figurine"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 border-white text-white hover:bg-white/15 hover:scale-110 transition-all duration-150"
            >
              <ArrowRight size={26} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <a
          href="#about"
          className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10 flex items-center gap-2 no-underline text-white hover:opacity-100 opacity-95 transition-opacity duration-200"
          style={{
            zIndex: 60,
            fontFamily: "Anton, sans-serif",
            fontSize: "clamp(20px, 4vw, 56px)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          DISCOVER IT
          <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8" strokeWidth={2.25} />
        </a>
      </div>
    </div>
  );
}

/* ------------------- JACK 3D CREATOR ------------------- */

const FadeIn = ({
  children,
  delay = 0,
  y = 30,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "50px" }}
    transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const ContactButton = () => (
  <button
    className="rounded-full text-white font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base"
    style={{
      background: "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
      boxShadow: "0 4px 4px rgba(181,1,167,0.25), 4px 4px 12px #7721B1 inset",
      outline: "2px solid #fff",
      outlineOffset: "-3px",
    }}
  >
    Contact Me
  </button>
);

function useTypewriter(words: string[], speed = 72, pause = 1100) {
  const [wordIndex, setWordIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    const doneTyping = !deleting && count === current.length;
    const doneDeleting = deleting && count === 0;
    const timeout = window.setTimeout(() => {
      if (doneTyping) setDeleting(true);
      else if (doneDeleting) {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      } else setCount((n) => n + (deleting ? -1 : 1));
    }, doneTyping ? pause : deleting ? speed / 2 : speed);
    return () => window.clearTimeout(timeout);
  }, [count, deleting, pause, speed, wordIndex, words]);

  return words[wordIndex % words.length].slice(0, count);
}

function DeveloperCharacter() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[50%] z-10 hidden w-[min(34vw,430px)] -translate-x-1/2 -translate-y-1/2 sm:block" style={{ perspective: 900 }}>
      <motion.div
        className="relative aspect-[4/5]"
        animate={{ rotateY: [-8, 8, -8], y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute left-1/2 top-[12%] h-[23%] w-[31%] -translate-x-1/2 rounded-[45%] border border-white/20 bg-gradient-to-b from-[#ffd8b5] to-[#b8764a] shadow-2xl" />
        <div className="absolute left-[32%] top-[33%] h-[34%] w-[36%] rounded-[28px] border border-sky-300/30 bg-gradient-to-br from-sky-500 via-fuchsia-500 to-neutral-950 shadow-[0_30px_80px_rgba(56,189,248,0.22)]" />
        <div className="absolute left-[17%] top-[39%] h-[8%] w-[24%] -rotate-12 rounded-full bg-[#ffd8b5]" />
        <div className="absolute right-[17%] top-[39%] h-[8%] w-[24%] rotate-12 rounded-full bg-[#ffd8b5]" />
        <div className="absolute bottom-[20%] left-[26%] h-[20%] w-[13%] rounded-full bg-neutral-800" />
        <div className="absolute bottom-[20%] right-[26%] h-[20%] w-[13%] rounded-full bg-neutral-800" />
        <motion.div
          className="absolute bottom-[16%] left-1/2 grid w-[76%] -translate-x-1/2 place-items-center rounded-2xl border border-white/15 bg-black/80 p-4 shadow-2xl backdrop-blur"
          animate={{ rotateX: [8, -2, 8] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="h-2 w-12 rounded-full bg-sky-300" />
          <pre className="mt-4 w-full overflow-hidden text-left text-[10px] leading-relaxed text-emerald-300">{`const builder = "Eager Beaver"\nship(site).with(metrics)`}</pre>
        </motion.div>
        <motion.div className="absolute right-8 top-6 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur" animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>
          <Code2 className="h-6 w-6 text-sky-200" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function JackHero() {
  const { bio } = useContent();
  const title = useTypewriter([bio.headline, "Full-Stack Developer", "Video Editor", "Systems Builder"]);
  return (
    <section
      id="about"
      className="relative h-screen flex flex-col bg-[#0C0C0C] font-kanit"
      style={{ overflowX: "clip" }}
    >
      <FadeIn delay={0} y={-20}>
        <nav className="flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8 text-[#D7E2EA] font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem]">
          <a href="#about" className="hover:opacity-70 transition-opacity duration-200">About</a>
          <a href="#" className="hover:opacity-70 transition-opacity duration-200">Price</a>
          <a href="#" className="hover:opacity-70 transition-opacity duration-200">Projects</a>
          <Link
            to="/portfolio-os"
            className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/60 bg-gradient-to-r from-fuchsia-500/20 to-sky-500/20 px-4 py-1.5 text-xs sm:text-sm hover:from-fuchsia-500/40 hover:to-sky-500/40 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" /> Portfolio OS
          </Link>
          <a href="#" className="hover:opacity-70 transition-opacity duration-200">Contact</a>
        </nav>
      </FadeIn>

      <div className="flex-1 flex flex-col justify-between relative">
        <FadeIn delay={0.15} y={40}>
          <div className="overflow-hidden mt-6 sm:mt-4 md:-mt-5 px-4">
            <h1
              className="hero-heading font-black uppercase tracking-tight leading-none whitespace-nowrap w-full text-center"
              style={{ fontSize: "clamp(2.4rem,12vw,14vw)" }}
            >
              Hi, i&apos;m eager beaver
            </h1>
          </div>
        </FadeIn>

        <DeveloperCharacter />
        <img
          src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png"
          alt="Jack portrait"
          className="absolute left-1/2 -translate-x-1/2 z-10 w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px] top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:bottom-0"
        />

        <div className="flex justify-between items-end px-6 md:px-10 pb-7 sm:pb-8 md:pb-10 relative z-20">
          <FadeIn delay={0.35} y={20}>
            <p
              className="text-[#D7E2EA] font-light uppercase tracking-wide leading-snug max-w-[160px] sm:max-w-[220px] md:max-w-[260px]"
              style={{ fontSize: "clamp(0.75rem,1.4vw,1.5rem)" }}
            >
              <span className="block min-h-[3.5em]">{title}<span className="animate-blink">|</span></span>
            </p>
          </FadeIn>
          <FadeIn delay={0.5} y={20}>
            <ContactButton />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function GitHubStatsSection() {
  const [stats, setStats] = useState({ repos: "50+", stars: "-", forks: "-", followers: "-" });

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const userRes = await fetch("https://api.github.com/users/Eager1337");
        const reposRes = await fetch("https://api.github.com/users/Eager1337/repos?per_page=100&sort=updated");
        if (!userRes.ok || !reposRes.ok) return;
        const user = await userRes.json();
        const repos = await reposRes.json();
        if (!alive || !Array.isArray(repos)) return;
        const stars = repos.reduce((sum, repo) => sum + (Number(repo.stargazers_count) || 0), 0);
        const forks = repos.reduce((sum, repo) => sum + (Number(repo.forks_count) || 0), 0);
        setStats({
          repos: `${user.public_repos ?? repos.length}`,
          stars: `${stars}`,
          forks: `${forks}`,
          followers: `${user.followers ?? 0}`,
        });
      } catch {
        // Keep polished fallback values offline or rate-limited.
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const cells = [
    [stats.repos, "Public repos", Github],
    [stats.stars, "Stars earned", Star],
    [stats.forks, "Forks tracked", GitFork],
    [stats.followers, "Followers", Sparkles],
  ] as const;

  return (
    <section className="bg-[#0C0C0C] px-5 py-16 font-kanit text-[#D7E2EA] sm:px-8 md:px-10">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">GitHub pulse</div>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none sm:text-6xl">Code that ships.</h2>
            <p className="mt-4 text-sm leading-relaxed text-[#D7E2EA]/65">Live public GitHub signals are loaded on the homepage, with private repository visibility ready once secure GitHub access is connected.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cells.map(([value, label, Icon]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <Icon className="h-4 w-4 text-sky-300" />
                <div className="mt-4 text-3xl font-black">{value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-white/45">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { quote: "Turned a scattered idea into an investor-ready product story with metrics, polish, and a launch path.", name: "Mariama K.", role: "Founder · EduOps", stat: "+41% onboarding clarity" },
    { quote: "The prototype felt like a real startup dashboard on day one, responsive, persuasive, and easy to demo.", name: "David C.", role: "Product Lead · HealthStack", stat: "3-week MVP sprint" },
    { quote: "Every section explained business value, not just visuals. Clients understood the offer instantly.", name: "Ibrahim S.", role: "Agency Partner", stat: "2.8× inquiry lift" },
  ];
  return (
    <section className="bg-white px-5 py-20 font-kanit text-[#0C0C0C] sm:px-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#B600A8]">Case-study highlights</div>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none sm:text-6xl">Proof people can feel.</h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-black/60">Realistic client-style highlights that show how each build is judged: speed, clarity, conversion, and investor confidence.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.article key={t.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-[28px] border border-black/10 bg-[#F7F7F4] p-6 shadow-sm">
              <div className="text-3xl font-black text-[#B600A8]">“</div>
              <p className="mt-2 text-sm leading-relaxed text-black/75">{t.quote}</p>
              <div className="mt-6 rounded-2xl bg-white p-4">
                <div className="text-sm font-bold">{t.name}</div>
                <div className="text-xs text-black/45">{t.role}</div>
                <div className="mt-3 text-lg font-black text-[#0C0C0C]">{t.stat}</div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

const MARQUEE_IMGS = [
  "hero-space-voyage-preview-eECLH3Yc",
  "hero-codenest-preview-Cgppc2qV",
  "hero-vex-ventures-preview-BczMFIiw",
  "hero-stellar-ai-v2-preview-DjvxjG3C",
  "hero-asme-preview-B_nGDnTP",
  "hero-transform-data-preview-Cx5OU29N",
  "hero-vitara-preview-Cjz2QYyU",
  "hero-terra-preview-BFjrCr7T",
  "hero-skyelite-preview-DHaZIgUv",
  "hero-aethera-preview-DknSlcTa",
  "hero-designpro-preview-D8c5_een",
  "hero-stellar-ai-preview-D3HL6bw1",
  "hero-xportfolio-preview-D4A8maiC",
  "hero-orbit-web3-preview-BXt4OttD",
  "hero-nexora-preview-cx5HmUgo",
  "hero-evr-ventures-preview-DZxeVFEX",
  "hero-planet-orbit-preview-DWAP8Z1P",
  "hero-new-era-preview-CocuDUm9",
  "hero-wealth-preview-B70idl_u",
  "hero-luminex-preview-CxOP7ce6",
  "hero-celestia-preview-0yO3jXO8",
].map((s) => `https://motionsites.ai/assets/${s}.gif`);

function LazyGif({ src }: { src: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [load, setLoad] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <img
      ref={ref}
      src={load ? src : undefined}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      width={420}
      height={270}
      alt=""
      className="rounded-2xl object-cover flex-shrink-0 bg-neutral-900"
      style={{ width: 420, height: 270 }}
    />
  );
}

function MarqueeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      setOffset((window.scrollY - top + window.innerHeight) * 0.3);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const row1 = [
    ...MARQUEE_IMGS.slice(0, 11),
    ...MARQUEE_IMGS.slice(0, 11),
    ...MARQUEE_IMGS.slice(0, 11),
  ];
  const row2 = [...MARQUEE_IMGS.slice(11), ...MARQUEE_IMGS.slice(11), ...MARQUEE_IMGS.slice(11)];
  const Row = ({ imgs, dir }: { imgs: string[]; dir: 1 | -1 }) => (
    <div
      className="flex gap-3"
      style={{ transform: `translateX(${dir * (offset - 200)}px)`, willChange: "transform" }}
    >
      {imgs.map((src, i) => (
        <LazyGif key={i} src={src} />
      ))}
    </div>
  );
  return (
    <section ref={ref} className="bg-[#0C0C0C] pt-24 sm:pt-32 md:pt-40 pb-10 overflow-hidden">
      <div className="flex flex-col gap-3">
        <Row imgs={row1} dir={1} />
        <Row imgs={row2} dir={-1} />
      </div>
    </section>
  );
}

function JackAbout() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-20 bg-[#0C0C0C] font-kanit">
      <img
        src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png"
        alt=""
        className="absolute w-[120px] sm:w-[160px] md:w-[210px] top-[4%] left-[1%] sm:left-[2%] md:left-[4%]"
      />
      <img
        src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png"
        alt=""
        className="absolute w-[100px] sm:w-[140px] md:w-[180px] bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%]"
      />
      <img
        src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png"
        alt=""
        className="absolute w-[120px] sm:w-[160px] md:w-[210px] top-[4%] right-[1%] sm:right-[2%] md:right-[4%]"
      />
      <img
        src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png"
        alt=""
        className="absolute w-[130px] sm:w-[170px] md:w-[220px] bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%]"
      />

      <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16 relative z-10">
        <FadeIn y={40}>
          <h2
            className="hero-heading font-black uppercase leading-none tracking-tight text-center"
            style={{ fontSize: "clamp(3rem,12vw,160px)" }}
          >
            About me
          </h2>
        </FadeIn>
        <p
          className="text-[#D7E2EA] font-medium text-center leading-relaxed max-w-[560px]"
          style={{ fontSize: "clamp(1rem,2vw,1.35rem)" }}
        >
          With more than five years of experience in design, i focus on branding, web design, and
          user experience, i truly enjoy working with businesses that aim to stand out and present
          their best image. Let&apos;s build something incredible together!
        </p>
        <div className="mt-6 sm:mt-10">
          <ContactButton />
        </div>
      </div>
    </section>
  );
}

const SERVICES = [
  [
    "01",
    "3D Modeling",
    "Creation of detailed objects, characters, or environments tailored to specific client needs, ideal for games, products, and visualizations.",
  ],
  [
    "02",
    "Rendering",
    "High-quality, photorealistic renders that showcase designs with custom lighting, textures, and materials to bring concepts to life.",
  ],
  [
    "03",
    "Motion Design",
    "Dynamic animations and motion graphics that add energy and storytelling to brands, products, and digital experiences.",
  ],
  [
    "04",
    "Branding",
    "Crafting cohesive visual identities, from logos to full brand systems, that communicate a clear and memorable presence.",
  ],
  [
    "05",
    "Web Design",
    "Designing clean, modern, and conversion-focused websites with attention to layout, typography, and user experience.",
  ],
];

function ServicesSection() {
  return (
    <section className="bg-white rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 font-kanit">
      <h2
        className="text-[#0C0C0C] font-black uppercase text-center mb-16 sm:mb-20 md:mb-28"
        style={{ fontSize: "clamp(3rem,12vw,160px)" }}
      >
        Services
      </h2>
      <div className="max-w-5xl mx-auto">
        {SERVICES.map(([num, name, desc], i) => (
          <FadeIn key={num} delay={i * 0.1} y={20}>
            <div
              className="flex items-start gap-6 md:gap-10 py-8 sm:py-10 md:py-12 border-t"
              style={{ borderColor: "rgba(12,12,12,0.15)" }}
            >
              <span
                className="font-black text-[#0C0C0C] leading-none"
                style={{ fontSize: "clamp(3rem,10vw,140px)" }}
              >
                {num}
              </span>
              <div className="flex-1">
                <h3
                  className="text-[#0C0C0C] font-medium uppercase"
                  style={{ fontSize: "clamp(1rem,2.2vw,2.1rem)" }}
                >
                  {name}
                </h3>
                <p
                  className="text-[#0C0C0C] font-light leading-relaxed max-w-2xl mt-3"
                  style={{ fontSize: "clamp(0.85rem,1.6vw,1.25rem)", opacity: 0.6 }}
                >
                  {desc}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
        <div className="border-t" style={{ borderColor: "rgba(12,12,12,0.15)" }} />
      </div>
    </section>
  );
}

const PROJECTS = [
  {
    n: "01",
    cat: "Client",
    name: "Nextlevel Studio",
    a: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85",
    b: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85",
    c: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85",
  },
  {
    n: "02",
    cat: "Personal",
    name: "Aura Brand Identity",
    a: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85",
    b: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85",
    c: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85",
  },
  {
    n: "03",
    cat: "Client",
    name: "Solaris Digital",
    a: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85",
    b: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85",
    c: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85",
  },
];

function ProjectCard({
  p,
  i,
  total,
  scrollProgress,
}: {
  p: (typeof PROJECTS)[number];
  i: number;
  total: number;
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const targetScale = 1 - (total - 1 - i) * 0.03;
  const range = [i / total, 1];
  const scale = useTransform(scrollProgress, range, [1, targetScale]);
  return (
    <div className="sticky top-24 md:top-32 h-[85vh]" style={{ top: `${24 + i * 28}px` }}>
      <motion.div
        style={{ scale }}
        className="rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-6 md:p-8 h-full flex flex-col"
      >
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-baseline gap-4 sm:gap-6">
            <span
              className="text-[#D7E2EA] font-black leading-none"
              style={{ fontSize: "clamp(2rem,6vw,5rem)" }}
            >
              {p.n}
            </span>
            <div className="flex flex-col">
              <span className="text-[#D7E2EA]/60 uppercase text-xs sm:text-sm tracking-widest">
                {p.cat}
              </span>
              <span
                className="text-[#D7E2EA] uppercase font-medium"
                style={{ fontSize: "clamp(1rem,2vw,1.6rem)" }}
              >
                {p.name}
              </span>
            </div>
          </div>
          <button className="rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base hover:bg-[#D7E2EA]/10 transition-colors">
            Live Project
          </button>
        </div>
        <div className="flex-1 grid grid-cols-5 gap-3 sm:gap-4 min-h-0">
          <div className="col-span-2 flex flex-col gap-3 sm:gap-4">
            <img
              src={p.a}
              loading="lazy"
              alt=""
              className="w-full rounded-[30px] sm:rounded-[40px] md:rounded-[50px] object-cover"
              style={{ height: "clamp(130px,16vw,230px)" }}
            />
            <img
              src={p.b}
              loading="lazy"
              alt=""
              className="w-full rounded-[30px] sm:rounded-[40px] md:rounded-[50px] object-cover flex-1"
              style={{ minHeight: "clamp(160px,22vw,340px)" }}
            />
          </div>
          <img
            src={p.c}
            loading="lazy"
            alt=""
            className="col-span-3 w-full h-full rounded-[30px] sm:rounded-[40px] md:rounded-[50px] object-cover"
          />
        </div>
      </motion.div>
    </div>
  );
}

function ProjectsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section
      ref={ref}
      className="bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 relative z-10 font-kanit px-5 sm:px-8 md:px-10 pt-20 pb-32"
    >
      <h2
        className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-16"
        style={{ fontSize: "clamp(3rem,12vw,160px)" }}
      >
        Project
      </h2>
      <div>
        {PROJECTS.map((p, i) => (
          <ProjectCard
            key={p.n}
            p={p}
            i={i}
            total={PROJECTS.length}
            scrollProgress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------- VANGUARD HERO ------------------- */

function VanguardHero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = ["Projects", "Studio", "Offerings", "Inquire"];
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black font-inter">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260606_154941_df1a96e1-a06f-450c-bd02-d863414cc1a0.mp4"
      />
      <div className="absolute inset-0 bg-black/40" />

      <nav className="relative z-30 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-5 lg:py-7">
        <div className="font-podium font-bold uppercase text-white text-2xl sm:text-3xl tracking-wider">
          VANGUARD
        </div>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l}
              href="#"
              className="font-inter text-sm text-white/80 hover:text-white tracking-widest uppercase transition-colors"
            >
              {l}
            </a>
          ))}
        </div>
        <a
          href="#"
          className="hidden md:inline-flex items-center gap-2 border border-white/30 hover:border-white/60 hover:bg-white/10 px-6 py-3 text-xs tracking-widest uppercase text-white transition-colors"
        >
          Get in touch <ArrowUpRight className="w-4 h-4" />
        </a>
        <button
          aria-label="Open menu"
          className="md:hidden flex flex-col space-y-1.5"
          onClick={() => setMenuOpen(true)}
        >
          <span className="w-6 h-0.5 bg-white" />
          <span className="w-6 h-0.5 bg-white" />
          <span className="w-4 h-0.5 bg-white" />
        </button>
      </nav>

      <div
        className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-sm transition-all duration-500 md:hidden ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div className="font-podium font-bold uppercase text-white text-2xl tracking-wider">
            VANGUARD
          </div>
          <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center gap-6 mt-16">
          {links.map((l, i) => (
            <a
              key={l}
              href="#"
              onClick={() => setMenuOpen(false)}
              className="font-podium text-4xl sm:text-5xl text-white uppercase transition-all duration-500"
              style={{
                transitionDelay: `${i * 80 + 100}ms`,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(20px)",
              }}
            >
              {l}
            </a>
          ))}
          <a
            href="#"
            onClick={() => setMenuOpen(false)}
            className="mt-6 inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-xs tracking-widest uppercase text-white transition-all duration-500"
            style={{
              transitionDelay: `${4 * 80 + 100}ms`,
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? "translateY(0)" : "translateY(20px)",
            }}
          >
            Get in touch <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="relative z-20 h-[calc(100vh-120px)] flex flex-col justify-center px-6 sm:px-10 lg:px-16">
        <div className="animate-fade-up mb-6 lg:mb-8 flex items-center gap-3">
          <Crown className="w-4 h-4 text-white/70" />
          <span className="text-white/70 text-xs sm:text-sm font-inter tracking-[0.3em] uppercase">
            World-Class Digital Collective
          </span>
        </div>
        <h1
          className="animate-fade-up-delay-1 font-podium text-white uppercase leading-[0.92] tracking-tight"
          style={{ fontSize: "clamp(2.8rem,8vw,7rem)" }}
        >
          Design.
          <br />
          Disrupt.
          <br />
          Conquer.
        </h1>
        <p className="animate-fade-up-delay-2 text-white/70 text-sm sm:text-base font-inter leading-relaxed max-w-md mt-6 lg:mt-8">
          We build fierce brand identities
          <br />
          that don&apos;t just turn heads, <span className="font-bold text-white">they lead.</span>
        </p>
        <div className="animate-fade-up-delay-3 mt-8 lg:mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
          <button className="group inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white px-5 sm:px-7 py-3 sm:py-4 text-[11px] sm:text-xs tracking-widest uppercase transition-colors">
            See our work
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <div className="hidden sm:flex items-center gap-3">
            <Award className="w-8 h-8 text-white/50" />
            <div className="text-white/60 text-xs tracking-wider uppercase leading-tight">
              Top-Rated
              <br />
              Brand Studio
            </div>
          </div>
        </div>
        <div className="animate-fade-up-delay-4 mt-8 sm:mt-10 lg:mt-14 flex flex-wrap gap-6 sm:gap-12 lg:gap-16">
          {[
            ["250+", "Brands Transformed"],
            ["95%", "Client Retention"],
            ["10+", "Years in the Game"],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="font-inter text-white text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                {v}
              </div>
              <div className="text-white/50 text-[9px] sm:text-xs tracking-widest uppercase mt-1">
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------- PAGE ------------------- */


function PublicBuildStudio() {
  const build = useServerFn(buildPublicDemo);
  const [kind, setKind] = useState<"site" | "app">("site");
  const [prompt, setPrompt] = useState("");
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [used, setUsed] = useState(() => {
    try {
      return Number(window.localStorage.getItem("eager-demo-prompts") || "0");
    } catch {
      return 0;
    }
  });
  const [token] = useState(() => {
    try {
      const key = "eager-demo-token";
      const existing = window.localStorage.getItem(key);
      if (existing) return existing;
      const next = `demo-${crypto.randomUUID()}-${crypto.randomUUID()}`;
      window.localStorage.setItem(key, next);
      return next;
    } catch {
      return `demo-${Date.now()}-${Math.random()}`;
    }
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const remaining = Math.max(0, 2 - used);

  const generate = async () => {
    if (busy || !prompt.trim() || remaining <= 0) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await build({
        data: { kind, prompt: prompt.trim(), clientToken: token },
      });
      setPreview(result.html);
      setTitle(result.title);
      const next = used + 1;
      setUsed(next);
      try { window.localStorage.setItem("eager-demo-prompts", String(next)); } catch {}
      setPrompt("");
      setMessage("Preview generated. You still own the design brief and can contact Eager Beaver for production work.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The AI builder could not generate this preview.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="build-studio" className="relative overflow-hidden bg-[#07070B] px-5 py-20 text-white sm:px-8 lg:px-10">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_20%,rgba(168,85,247,.18),transparent_35%),radial-gradient(circle_at_85%_70%,rgba(14,165,233,.15),transparent_35%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[.32em] text-fuchsia-300/70">Eager Build Studio</div>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Turn an idea into a website or app.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              Visitors can test the same kind of AI workflow used inside Eager. Describe what you want, preview the result, then work with me to turn it into a production-ready product.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                ["AI Website Builder", "Generate a responsive website from a plain-language brief."],
                ["AI App Builder", "Generate an app-like experience designed for phone and desktop."],
                ["Portfolio & Showcase", "Publish projects, apps and case studies into a public portfolio."],
                ["Business Workspace", "Projects, clients, leads, analytics, content and deployment tools."],
                ["Academic AI", "Organize assignments, notebooks, slides and timetables into subjects."],
                ["Eager Connect", "Voice, video, screen sharing and collaboration features."],
              ].map(([name, description]) => (
                <div key={name} className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                  <div className="text-sm font-semibold">{name}</div>
                  <p className="mt-1.5 text-xs leading-5 text-white/45">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[.04] p-4 shadow-2xl backdrop-blur sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Try the AI builder</div>
                <div className="mt-1 text-xs text-white/40">{remaining} of 2 free prompts remaining</div>
              </div>
              <div className="flex rounded-xl border border-white/10 bg-black/30 p-1">
                <button onClick={() => setKind("site")} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${kind === "site" ? "bg-white text-black" : "text-white/55 hover:text-white"}`}>Website</button>
                <button onClick={() => setKind("app")} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${kind === "app" ? "bg-white text-black" : "text-white/55 hover:text-white"}`}>Application</button>
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              disabled={remaining === 0 || busy}
              placeholder={kind === "site" ? "Example: Build a premium website for a Freetown creative agency with services, portfolio, testimonials and contact form." : "Example: Build a mobile-first delivery app with home, orders, tracking, profile and a bottom navigation."}
              className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-fuchsia-400/60 disabled:opacity-50"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-white/35">Two free prompts. Production builds, extra edits and deployment are available through Eager Beaver.</span>
              <button
                onClick={() => void generate()}
                disabled={busy || !prompt.trim() || remaining === 0}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-sky-500 px-5 text-xs font-bold shadow-lg shadow-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Generating..." : remaining === 0 ? "Prompts used" : "Generate preview"}
              </button>
            </div>

            {message && (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-xs leading-5 text-white/60">{message}</div>
            )}

            {remaining === 0 && (
              <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-400/[.06] p-4">
                <div className="font-semibold text-amber-100">Want more than two prompts?</div>
                <p className="mt-1 text-xs leading-5 text-white/50">Contact me or subscribe for additional generations, custom edits, publishing and deployment. Payment can be arranged through the available local/mobile-money or card options.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link to="/contact" className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black">Contact Eager Beaver</Link>
                  <span className="rounded-lg border border-white/10 px-3 py-2 text-[10px] text-white/45">PayTuna · Orange Money · Afrimoney · Visa</span>
                </div>
              </div>
            )}

            {preview && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-black px-4 py-2.5 text-xs text-white">
                  <span className="truncate">{title || "AI Preview"}</span>
                  <span className="text-white/40">{kind === "site" ? "Website" : "Application"}</span>
                </div>
                <iframe
                  title="AI generated preview"
                  srcDoc={preview}
                  sandbox="allow-scripts allow-forms"
                  className="h-[520px] w-full bg-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function EagerLandingHero() {
  const features = [
    ["AI Website Builder", "Describe a site or upload a brief and turn it into a polished responsive experience."],
    ["Eager Connect", "Call people by Eager username, email or phone with voice, video, screen sharing and chat."],
    ["Academic AI", "Organize timetables, assignments, projects, notebooks and slides into one searchable library."],
    ["Business Workspace", "Manage clients, leads, products, content, analytics and operations from one command center."],
    ["Portfolio & Showcase", "Publish projects and app previews so visitors can explore what you build."],
    ["Built for Sierra Leone", "A local-first product direction designed for real businesses, students and creators."],
  ];

  return (
    <section className="relative overflow-hidden bg-[#050507] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(217,70,239,.22),transparent_34%),radial-gradient(circle_at_85%_25%,rgba(14,165,233,.18),transparent_32%),linear-gradient(180deg,#050507_0%,#090912_58%,#050507_100%)]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-6 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link to="/" className="text-sm font-black uppercase tracking-[.28em]">Eager Beaver</Link>
          <div className="hidden items-center gap-5 text-xs text-white/55 sm:flex">
            <Link to="/explore" className="hover:text-white">Explore</Link>
            <Link to="/portfolio-os" className="hover:text-white">Portfolio OS</Link>
            <Link to="/connect" className="hover:text-white">Connect</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
          <Link to="/connect" className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/15">Open Eager Connect</Link>
        </nav>

        <div className="grid min-h-[calc(100dvh-100px)] items-center gap-12 py-14 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.25em] text-fuchsia-200">
              Sierra Leone · AI · Digital Products
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[.92] tracking-[-.04em] sm:text-7xl lg:text-8xl">
              Your idea.
              <span className="block bg-gradient-to-r from-fuchsia-300 via-violet-300 to-sky-300 bg-clip-text text-transparent">Your product.</span>
              <span className="block">Built to ship.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
              Eager Beaver is a growing digital platform for websites, apps, AI tools, business operations, academic organization and real-time communication — built with a Sierra Leone-first vision.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/explore" className="rounded-2xl bg-white px-6 py-3.5 text-center text-sm font-bold text-black transition hover:scale-[1.02]">Explore the work</Link>
              <Link to="/connect" className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-center text-sm font-semibold backdrop-blur hover:bg-white/10">Call someone on Eager</Link>
            </div>
            <div className="mt-9 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["AI", "Build tools"],
                ["WEB", "Web apps"],
                ["CALL", "Voice + video"],
                ["SL", "Local-first"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                  <div className="text-lg font-black">{value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-widest text-white/40">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-10 rounded-full bg-fuchsia-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[.045] p-3 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[25px] border border-white/10 bg-[#0b0b12] p-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-[10px] text-white/35">eager.sl · live product preview</span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_.72fr]">
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/20 to-sky-500/10 p-5">
                    <div className="text-[10px] uppercase tracking-[.25em] text-white/40">Eager Connect</div>
                    <div className="mt-3 text-2xl font-black">People. Calls. Collaboration.</div>
                    <div className="mt-3 text-xs leading-5 text-white/50">Search by username, email or phone and start a secure voice or video call.</div>
                    <div className="mt-5 flex gap-2">
                      <div className="rounded-xl bg-white px-3 py-2 text-[10px] font-bold text-black">Video call</div>
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px]">Screen share</div>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {["Academic AI", "AI Builder", "Business OS"].map((label) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="h-8 w-8 rounded-xl bg-white/10" />
                        <div className="mt-3 text-xs font-semibold">{label}</div>
                        <div className="mt-1 h-1.5 w-2/3 rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {["Create", "Connect", "Grow"].map((x) => <div key={x} className="rounded-2xl border border-white/10 bg-white/[.025] py-4 text-center text-[10px] uppercase tracking-widest text-white/45">{x}</div>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-16">
          <div className="max-w-2xl">
            <div className="text-[10px] font-semibold uppercase tracking-[.3em] text-sky-300/70">What is inside Eager</div>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">One platform, many workflows.</h2>
            <p className="mt-4 text-sm leading-6 text-white/50">The landing page is now self-contained and does not depend on a remote image preview to render its first screen.</p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, description]) => (
              <article key={title} className="rounded-3xl border border-white/10 bg-white/[.035] p-5 transition hover:-translate-y-1 hover:bg-white/[.055]">
                <div className="mb-6 h-2 w-12 rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-400" />
                <h3 className="text-base font-bold">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-white/45">{description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-4 rounded-[32px] border border-white/10 bg-white/[.035] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="text-[10px] uppercase tracking-[.3em] text-white/35">Start here</div>
            <h2 className="mt-2 text-2xl font-black sm:text-4xl">See the app, call someone, or explore the work.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">Everything important has a direct entry point from the first screen instead of being hidden behind a long scroll.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Link to="/connect" className="rounded-xl bg-white px-5 py-3 text-center text-xs font-bold text-black">Eager Connect</Link>
            <Link to="/explore" className="rounded-xl border border-white/10 px-5 py-3 text-center text-xs font-semibold">Explore</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <main className="bg-[#050507]" style={{ overflowX: "clip" }}>
      <EagerLandingHero />
      <PortfolioOsBanner />
    </main>
  );
}

function PortfolioOsBanner() {
  return (
    <section className="relative mx-auto max-w-5xl px-5 py-16 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-600/20 via-black to-sky-600/20 p-8 text-center sm:p-12">
        <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/60">
          Explore everything
        </div>
        <h2
          className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl"
          style={{ fontFamily: "'Kanit', sans-serif" }}
        >
          Enter Portfolio OS
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
          50+ interactive features and 50+ pages, case studies, skill tree, live GitHub analytics,
          developer terminal, AI assistant, investor mode and more, organized like a real operating
          system.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/portfolio-os"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition-transform hover:scale-[1.03]"
          >
            <ArrowUpRight className="h-4 w-4" /> Open Portfolio OS
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            About Eager Beaver
          </Link>
        </div>
      </div>
    </section>
  );
}

