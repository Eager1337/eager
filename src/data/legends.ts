import audi from "../assets/audi-nuvolari.jpg.asset.json";
import basketball from "../assets/basketball-ring.png.asset.json";
import superman from "../assets/superman.jpg.asset.json";
import deadpool from "../assets/deadpool-wolverine.jpg.asset.json";
import saitama from "../assets/saitama.png.asset.json";
import onePiece from "../assets/one-piece-cast.png.asset.json";
import love from "../assets/love-train.png.asset.json";
import spider from "../assets/spider-verse.png.asset.json";
import luffy from "../assets/luffy-fire.png.asset.json";
import nba from "../assets/nba-2k25.png.asset.json";

export type LegendAnim =
  | "clash"
  | "smile"
  | "walk"
  | "mirror"
  | "ember"
  | "swing"
  | "eyeGlow"
  | "hoop"
  | "train"
  | "orbit";

export interface Legend {
  slug: string;
  title: string;
  kicker: string;
  tagline: string;
  story: string;
  stack: string[];
  image: string;
  accent: string;
  bg: string;
  animation: LegendAnim;
  facts: { label: string; value: string }[];
}

export const LEGENDS: Legend[] = [
  {
    slug: "deadpool-vs-wolverine",
    title: "Deadpool × Wolverine",
    kicker: "Chaos as a design system",
    tagline: "Two forces of nature colliding in perfect asymmetry.",
    story:
      "The best product decisions look like Wolverine, quiet, sharp, decided. The best marketing looks like Deadpool, loud, self-aware, impossible to ignore. Building at world-class means being both. This is the tension I balance on every project: precision meets personality, discipline meets showmanship.",
    stack: ["Motion", "React", "Framer Motion", "GSAP", "SVG"],
    image: deadpool.url,
    accent: "#E63946",
    bg: "#0A0A0A",
    animation: "clash",
    facts: [
      { label: "Kinetic frames", value: "60fps" },
      { label: "Style vs. system", value: "Both" },
      { label: "Loops", value: "Infinite" },
    ],
  },
  {
    slug: "superman",
    title: "Superman",
    kicker: "Quiet confidence, always on",
    tagline: "The strongest work speaks softly, and never blinks.",
    story:
      "Superman isn't loud. He shows up, does the impossible, and leaves you wondering how. That's how I ship: no drama, no missed windows, no excuses. Just the promised thing, delivered on time, on brand, on budget, every single time.",
    stack: ["TypeScript", "TanStack Start", "Postgres", "Cloudflare Workers"],
    image: superman.url,
    accent: "#3A7BD5",
    bg: "#04080F",
    animation: "smile",
    facts: [
      { label: "Uptime SLA", value: "99.99%" },
      { label: "Time to launch", value: "≤ 4 wks" },
      { label: "Post-launch", value: "30 days free" },
    ],
  },
  {
    slug: "one-punch-man",
    title: "One Punch Man",
    kicker: "Ship once. Ship right.",
    tagline: "Every project deserves one clean, decisive punch.",
    story:
      "Saitama trains for years so the fight lasts one second. I spec, architect, and prototype for weeks so the launch lasts one day, and works forever. Overkill preparation is what makes the delivery look effortless.",
    stack: ["Vertical slices", "CI/CD", "E2E tests", "Observability"],
    image: saitama.url,
    accent: "#FFD100",
    bg: "#050505",
    animation: "walk",
    facts: [
      { label: "Prep : ship", value: "10 : 1" },
      { label: "Rework rate", value: "< 3%" },
      { label: "Confidence", value: "Total" },
    ],
  },
  {
    slug: "one-piece",
    title: "One Piece",
    kicker: "A crew, not a solo act",
    tagline: "Every great launch is a synchronized crew move.",
    story:
      "One Piece isn't Luffy alone, it's Zoro's blades, Nami's charts, Sanji's kitchen, Usopp's inventions, all pulling at the right beat. When I take on a project I bring designers, editors, motion artists and QA that already know each other's rhythm. You hire one person and get a full crew.",
    stack: ["Design ops", "Editorial", "Motion", "QA", "Delivery"],
    image: onePiece.url,
    accent: "#2E90FA",
    bg: "#000000",
    animation: "mirror",
    facts: [
      { label: "Roles covered", value: "9" },
      { label: "In-house tools", value: "12" },
      { label: "Time zones", value: "3" },
    ],
  },
  {
    slug: "luffy-fire",
    title: "Luffy · Fire Fist",
    kicker: "Momentum is the strategy",
    tagline: "Small teams, big fire, no ceremony.",
    story:
      "Fire Fist looks impossible until you see the training. Small studios beat agencies because they move, no committees, no six-week decks, no gatekeeping. I keep loops tight so momentum compounds and quality doesn't die in a review meeting.",
    stack: ["Kanban", "Weekly demos", "Preview URLs", "Async video"],
    image: luffy.url,
    accent: "#FF6A00",
    bg: "#08040A",
    animation: "ember",
    facts: [
      { label: "Standups", value: "0" },
      { label: "Preview builds", value: "Per commit" },
      { label: "Demo cadence", value: "Weekly" },
    ],
  },
  {
    slug: "spider-verse",
    title: "Spider-Verse",
    kicker: "Multiverse of interfaces",
    tagline: "One person. Many versions. All shipped.",
    story:
      "The Spider-Verse thesis: there isn't one right answer, there are many right answers running in parallel. I ship variants, run A/B splits, and let real behavior pick the winner, instead of arguing about it in a design review.",
    stack: ["A/B testing", "Feature flags", "Analytics", "Rapid iteration"],
    image: spider.url,
    accent: "#F02233",
    bg: "#050005",
    animation: "swing",
    facts: [
      { label: "Variants shipped", value: "100+" },
      { label: "Winner uplift", value: "Avg 34%" },
      { label: "Kill rate", value: "60%" },
    ],
  },
  {
    slug: "nba-2k25",
    title: "NBA 2K25",
    kicker: "Product as scoreboard",
    tagline: "Metrics on. Nothing to hide.",
    story:
      "Every project I ship comes with a live scoreboard, the investor analytics dashboard on this site is real. Conversion, retention, time-to-first-value, session depth. If we can't measure it, we don't ship it.",
    stack: ["Product analytics", "Dashboards", "Weekly investor reports"],
    image: nba.url,
    accent: "#B3B3B3",
    bg: "#020202",
    animation: "eyeGlow",
    facts: [
      { label: "KPI cadence", value: "Weekly" },
      { label: "Dashboards", value: "Real-time" },
      { label: "Transparency", value: "100%" },
    ],
  },
  {
    slug: "hoop-dreams",
    title: "Hoop Dreams",
    kicker: "Take the shot",
    tagline: "Every launch is a buzzer beater, I make them count.",
    story:
      "The scariest part of any project is the moment of release. I've made a career of taking those shots, and hitting them. Sierra Leone to the world, no safety net, no rich family, no big agency behind me. Just the shot, the arc, and the net.",
    stack: ["Launch checklists", "Rollback plans", "SEO"],
    image: basketball.url,
    accent: "#E63946",
    bg: "#000000",
    animation: "hoop",
    facts: [
      { label: "Shots taken", value: "50+" },
      { label: "FG %", value: "Live above" },
      { label: "Nerves", value: "Managed" },
    ],
  },
  {
    slug: "wooden-love",
    title: "Wooden Love",
    kicker: "Craft has to be felt",
    tagline: "Handmade code for people who care.",
    story:
      "I build like a woodworker, grain-first, joinery visible, finish smooth to the touch. Every button, every transition, every 404 gets the same care. You don't just get a website; you get an object someone loved into being.",
    stack: ["Hand-tuned typography", "Design tokens", "A11y first"],
    image: love.url,
    accent: "#E1B87A",
    bg: "#030303",
    animation: "train",
    facts: [
      { label: "A11y score", value: "100" },
      { label: "Lighthouse", value: "95+" },
      { label: "Details", value: "Uncounted" },
    ],
  },
  {
    slug: "audi-nuvolari",
    title: "Audi Nuvolari",
    kicker: "Engineered to be quiet",
    tagline: "Power that doesn't need to shout.",
    story:
      "The Nuvolari is Audi's meditation on restraint. My code follows the same rule, the flashiest UI covers the least sophisticated system. Real engineering is the plane you never noticed you were on until you landed early.",
    stack: ["Server functions", "Edge caching", "PostgREST", "Type safety"],
    image: audi.url,
    accent: "#C0C6CB",
    bg: "#0A0A0C",
    animation: "orbit",
    facts: [
      { label: "Time to interactive", value: "< 1.2s" },
      { label: "Global edge", value: "Cloudflare" },
      { label: "Type errors", value: "0" },
    ],
  },
];

export function getLegend(slug: string) {
  return LEGENDS.find((l) => l.slug === slug);
}