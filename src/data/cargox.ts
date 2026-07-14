export type CargoxVariant = {
  slug: string;
  video: string;
  isHls?: boolean;
  kicker: string;
  headline: [string, string, string]; // [white, yellow, white]
  tagline: string;
  taglineSub: [string, string];
  stats: { value: string; label: [string, string, string] }[];
  ctaLabel: string;
};

const cf = (id: string) =>
  `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/${id}`;

export const CARGOX_VARIANTS: CargoxVariant[] = [
  {
    slug: "beyond-borders",
    video: cf("hf_20260620_185230_f7f71ef4-6655-469f-b9c6-efbdc1f7684a.mp4"),
    kicker: "Global freight",
    headline: ["BEYOND", "BORDERS", "AND LIMITS"],
    tagline: "LOGISTICS",
    taglineSub: ["shaped by scale,", "powered by precision."],
    stats: [
      { value: "3M+", label: ["tons of cargo", "delivered", "without delays"] },
      { value: "13+", label: ["years of trusted", "and reliable", "operations"] },
    ],
    ctaLabel: "Get in touch",
  },
  {
    slug: "ocean-freight",
    video: cf("hf_20260520_111942_8fc50f9e-4dfd-45c1-81bb-d93342a23d87.mp4"),
    kicker: "Ocean freight",
    headline: ["ACROSS", "OCEANS", "ON SCHEDULE"],
    tagline: "SHIPPING",
    taglineSub: ["engineered for scale,", "delivered on time."],
    stats: [
      { value: "48", label: ["ports served", "on six", "continents"] },
      { value: "99.2%", label: ["on-time", "container", "delivery rate"] },
    ],
    ctaLabel: "Request a quote",
  },
  {
    slug: "air-cargo",
    video: cf("hf_20260506_031045_0e1165dd-ab48-46e3-ad3d-5fe77f217647.mp4"),
    kicker: "Air cargo",
    headline: ["FLY", "FASTER", "THAN THE CLOCK"],
    tagline: "AIRFREIGHT",
    taglineSub: ["priority allocation,", "guaranteed uplift."],
    stats: [
      { value: "72h", label: ["door-to-door", "on express", "routes"] },
      { value: "220+", label: ["airline", "partners", "worldwide"] },
    ],
    ctaLabel: "Book a flight slot",
  },
  {
    slug: "road-network",
    video: cf("hf_20260505_110052_2e127257-5236-40b1-ba48-4690260f1185.mp4"),
    kicker: "Road transport",
    headline: ["EVERY", "MILE", "COUNTS"],
    tagline: "TRUCKING",
    taglineSub: ["cross-continent haulage,", "backed by real-time GPS."],
    stats: [
      { value: "2.5K", label: ["fleet units", "on the road", "every day"] },
      { value: "34", label: ["countries in", "our regular", "haul network"] },
    ],
    ctaLabel: "Plan a route",
  },
  {
    slug: "rail-freight",
    video: cf("hf_20260429_115139_0fc6bd3d-3631-4d26-ab9b-28293887dcc9.mp4"),
    kicker: "Rail freight",
    headline: ["STEEL", "RAILS", "MOVE THE WORLD"],
    tagline: "RAIL",
    taglineSub: ["heavy volume,", "lower emissions."],
    stats: [
      { value: "18K", label: ["container", "moves per", "week"] },
      { value: "-62%", label: ["CO2 vs road", "on comparable", "long hauls"] },
    ],
    ctaLabel: "Book rail capacity",
  },
  {
    slug: "warehousing",
    video: cf("hf_20260525_052706_d2e390fd-1846-4fe7-a4d8-8d2f1c875358.mp4"),
    kicker: "Warehousing",
    headline: ["STOCK", "READY", "TO MOVE"],
    tagline: "STORAGE",
    taglineSub: ["bonded facilities,", "live inventory sync."],
    stats: [
      { value: "1.4M", label: ["square meters", "of managed", "warehouse space"] },
      { value: "24/7", label: ["climate", "controlled", "operations"] },
    ],
    ctaLabel: "Reserve space",
  },
  {
    slug: "customs",
    video: cf("hf_20260511_214311_24de0b75-7eaa-4f42-86d8-8c2014ca2851.mp4"),
    kicker: "Customs & compliance",
    headline: ["CLEAR", "BORDERS", "IN HOURS"],
    tagline: "CUSTOMS",
    taglineSub: ["licensed brokers,", "digital clearance."],
    stats: [
      { value: "4h", label: ["average", "clearance", "time"] },
      { value: "100%", label: ["documented", "audit", "trail"] },
    ],
    ctaLabel: "Start clearance",
  },
  {
    slug: "cold-chain",
    video: cf("hf_20260525_070034_60e5670b-6bb0-402b-a6c1-c9a8c05ae3a4.mp4"),
    kicker: "Cold chain",
    headline: ["PERISHABLES", "STAY", "PERFECT"],
    tagline: "REEFER",
    taglineSub: ["monitored to the degree,", "logged to the second."],
    stats: [
      { value: "-25 to 25", label: ["degrees Celsius", "controlled", "range"] },
      { value: "99.99%", label: ["temperature", "compliance", "record"] },
    ],
    ctaLabel: "Ship perishables",
  },
  {
    slug: "project-cargo",
    video: cf("hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4"),
    kicker: "Project cargo",
    headline: ["HEAVY", "LIFTS", "MADE SIMPLE"],
    tagline: "PROJECTS",
    taglineSub: ["out-of-gauge experts,", "turnkey execution."],
    stats: [
      { value: "480t", label: ["heaviest", "single piece", "delivered"] },
      { value: "60+", label: ["energy and", "industrial", "projects"] },
    ],
    ctaLabel: "Scope your project",
  },
  {
    slug: "e-commerce",
    video: cf("hf_20260629_021419_291eb2af-5ed4-45a0-a1d6-3ef58f4bca0b.mp4"),
    kicker: "E-commerce fulfillment",
    headline: ["FROM", "CART", "TO DOORSTEP"],
    tagline: "FULFILLMENT",
    taglineSub: ["pick, pack, ship,", "same day possible."],
    stats: [
      { value: "12M", label: ["parcels shipped", "in the last", "year"] },
      { value: "97%", label: ["next-day", "delivery in", "key markets"] },
    ],
    ctaLabel: "Integrate your store",
  },
  {
    slug: "dangerous-goods",
    video: cf("hf_20260324_024928_1efd0b0d-6c02-45a8-8847-1030900c4f63.mp4"),
    kicker: "Dangerous goods",
    headline: ["HAZMAT", "HANDLED", "SAFELY"],
    tagline: "DG CARGO",
    taglineSub: ["IATA and IMDG certified,", "audited every quarter."],
    stats: [
      { value: "9", label: ["hazard classes", "we are", "certified for"] },
      { value: "0", label: ["reportable", "incidents in", "5 years"] },
    ],
    ctaLabel: "Ship hazmat",
  },
  {
    slug: "energy",
    video: cf("hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4"),
    kicker: "Energy logistics",
    headline: ["POWER", "THE", "GRID"],
    tagline: "ENERGY",
    taglineSub: ["wind, solar, oil and gas,", "moved with precision."],
    stats: [
      { value: "1.2GW", label: ["renewable", "capacity", "shipped"] },
      { value: "40", label: ["energy majors", "as long-term", "partners"] },
    ],
    ctaLabel: "Talk to energy team",
  },
  {
    slug: "control-tower",
    video: "https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8",
    isHls: true,
    kicker: "Control tower",
    headline: ["ONE", "VIEW", "EVERY SHIPMENT"],
    tagline: "VISIBILITY",
    taglineSub: ["real-time telemetry,", "predictive ETAs."],
    stats: [
      { value: "24/7", label: ["global", "operations", "center"] },
      { value: "-38%", label: ["exceptions", "resolved", "faster"] },
    ],
    ctaLabel: "See the platform",
  },
  {
    slug: "last-mile",
    video: cf("hf_20260302_085844_21a8f4b3-dea5-4ede-be16-d53f6973bb14.mp4"),
    kicker: "Last mile",
    headline: ["CLOSER", "TO", "YOUR CUSTOMER"],
    tagline: "LAST MILE",
    taglineSub: ["urban fleets,", "smart routing."],
    stats: [
      { value: "18min", label: ["median urban", "delivery", "window"] },
      { value: "94%", label: ["first-attempt", "delivery", "success"] },
    ],
    ctaLabel: "Launch last mile",
  },
  {
    slug: "sustainability",
    video: cf("hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4"),
    kicker: "Sustainability",
    headline: ["FREIGHT", "WITH", "A CONSCIENCE"],
    tagline: "GREEN",
    taglineSub: ["measured emissions,", "verified offsets."],
    stats: [
      { value: "-45%", label: ["scope 1 and 2", "emissions since", "2019"] },
      { value: "ISO", label: ["14001", "certified", "operations"] },
    ],
    ctaLabel: "See our roadmap",
  },
  {
    slug: "partners",
    video: "https://stream.mux.com/jPyJ2YM6Nlly7U6EyfxM01tz4D4uPE3gyJ4PYuvY62Wg.m3u8",
    isHls: true,
    kicker: "Partner network",
    headline: ["TRUSTED", "BY", "GLOBAL BRANDS"],
    tagline: "PARTNERS",
    taglineSub: ["long term relationships,", "measurable results."],
    stats: [
      { value: "500+", label: ["enterprise", "shippers", "onboarded"] },
      { value: "NPS 74", label: ["customer", "satisfaction", "score"] },
    ],
    ctaLabel: "Become a partner",
  },
];

export const cargoxBySlug = (slug: string) =>
  CARGOX_VARIANTS.find((v) => v.slug === slug);