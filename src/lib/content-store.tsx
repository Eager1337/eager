import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LEGENDS as DEFAULT_LEGENDS, type Legend } from "../data/legends";
import { PROJECTS as DEFAULT_PROJECTS, type Project } from "../data/projects";

/* ---------- Types ---------- */

export interface ToonSlide {
  id: string;
  src: string;
  bg: string;
  label: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  weeks: string;
  best: boolean;
  inc: string[];
}

export interface CustomLanding {
  slug: string;
  title: string;
  kicker: string;
  tagline: string;
  body: string;
  image: string;
  accent: string;
  bg: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface PortfolioBio {
  name: string;
  nickname: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

interface Store {
  toonSlides: ToonSlide[];
  legends: Legend[];
  pricing: PricingTier[];
  projects: Project[];
  landings: CustomLanding[];
  bio: PortfolioBio;
  version: number;
}

const DEFAULT_TOON: ToonSlide[] = [
  {
    id: "t1",
    src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png",
    bg: "#F4845F",
    label: "Toon 01",
  },
  {
    id: "t2",
    src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png",
    bg: "#6BBF7A",
    label: "Toon 02",
  },
  {
    id: "t3",
    src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png",
    bg: "#E882B4",
    label: "Toon 03",
  },
  {
    id: "t4",
    src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png",
    bg: "#6EB5FF",
    label: "Toon 04",
  },
];

const DEFAULT_PRICING: PricingTier[] = [
  {
    id: "starter",
    name: "Starter Site",
    price: "$1,200",
    weeks: "2 weeks",
    best: false,
    inc: ["Up to 5 pages", "Responsive design", "Contact form", "Basic SEO", "Deployed live"],
  },
  {
    id: "growth",
    name: "Growth Site",
    price: "$3,500",
    weeks: "4 weeks",
    best: true,
    inc: [
      "Up to 12 pages",
      "CMS / content model",
      "Auth + user accounts",
      "Analytics dashboard",
      "Custom animations",
    ],
  },
  {
    id: "signature",
    name: "Signature Build",
    price: "from $8,000",
    weeks: "6–10 weeks",
    best: false,
    inc: ["Unlimited pages", "AI features", "Payments", "Multi-language", "Investor dashboard"],
  },
];

const DEFAULT_BIO: PortfolioBio = {
  name: "Alusine G. Dumbuya",
  nickname: "Eager Beaver",
  headline: "Full-Stack Developer & Video Editor",
  email: "ebeaver091@gmail.com",
  phone: "+232 33 695 803",
  location: "Sierra Leone",
  bio: "Full-stack developer, systems builder and video editor studying at Limkokwing University, Sierra Leone.",
};

const KEY = "portfolio_content_store_v1";
const CHANNEL = "portfolio_content_store_channel_v1";

function emitStoreChanged(s: Store) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("portfolio-content-store-updated", { detail: s }));
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage({ type: "updated", store: s });
    channel.close();
  } catch {
    // BroadcastChannel is optional.
  }
}

function readStore(): Store {
  const empty: Store = {
    toonSlides: DEFAULT_TOON,
    legends: DEFAULT_LEGENDS,
    pricing: DEFAULT_PRICING,
    projects: DEFAULT_PROJECTS,
    landings: [],
    bio: DEFAULT_BIO,
    version: 0,
  };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      toonSlides: parsed.toonSlides?.length ? parsed.toonSlides : DEFAULT_TOON,
      legends: parsed.legends?.length ? parsed.legends : DEFAULT_LEGENDS,
      pricing: parsed.pricing?.length ? parsed.pricing : DEFAULT_PRICING,
      projects: parsed.projects?.length ? parsed.projects : DEFAULT_PROJECTS,
      landings: parsed.landings ?? [],
      bio: { ...DEFAULT_BIO, ...(parsed.bio ?? {}) },
      version: parsed.version ?? 0,
    };
  } catch {
    return empty;
  }
}

function writeStore(s: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
    emitStoreChanged(s);
  } catch {
    // ignore quota
  }
}

interface Ctx extends Store {
  update: (patch: Partial<Store>) => void;
  reset: () => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function ContentStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Store>(() => readStore());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setState(readStore());
    };
    const onLocalUpdate = () => setState(readStore());
    window.addEventListener("storage", onStorage);
    window.addEventListener("portfolio-content-store-updated", onLocalUpdate);
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = (event) => {
        if (event.data?.type === "updated") setState(readStore());
      };
    } catch {
      channel = null;
    }
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("portfolio-content-store-updated", onLocalUpdate);
      channel?.close();
    };
  }, []);

  const update = useCallback((patch: Partial<Store>) => {
    setState((prev) => {
      const next = { ...prev, ...patch, version: prev.version + 1 };
      writeStore(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
    const next = readStore();
    setState(next);
    emitStoreChanged(next);
  }, []);

  const value = useMemo<Ctx>(() => ({ ...state, update, reset }), [state, update, reset]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useContent(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    // Provider not mounted (SSR / isolated component), return defaults + no-ops
    const s = readStore();
    return { ...s, update: () => undefined, reset: () => undefined };
  }
  return ctx;
}

/* ---------- Auth (simple client-side gate) ---------- */

const AUTH_KEY = "portfolio_admin_auth_v1";
const ADMIN_USER = "Eagerbeaver1";
const ADMIN_PASS = "Eagerbeaver123";

export function checkCredentials(user: string, pass: string) {
  return user === ADMIN_USER && pass === ADMIN_PASS;
}

export function setAdminAuthed(v: boolean) {
  if (typeof window === "undefined") return;
  if (v) window.localStorage.setItem(AUTH_KEY, "1");
  else window.localStorage.removeItem(AUTH_KEY);
}

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_KEY) === "1";
}

export { DEFAULT_TOON, DEFAULT_PRICING, DEFAULT_BIO };
