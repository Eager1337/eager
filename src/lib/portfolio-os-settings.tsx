import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "es" | "fr";
export interface OsSettings {
  lang: Lang;
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  dyslexic: boolean;
}

const DEFAULTS: OsSettings = {
  lang: "en",
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  dyslexic: false,
};

const KEY = "portfolio-os:settings";

interface Ctx {
  settings: OsSettings;
  setSettings: (s: Partial<OsSettings>) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<Ctx | null>(null);

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    assistant: "AI Assistant",
    analytics: "Investor Analytics",
    settings: "Accessibility & Language",
    estimator: "Quote Estimator",
    ask: "Ask about my work…",
    scope: "Scope",
    timeline: "Timeline",
    cost: "Cost",
    download: "Download proposal",
  },
  es: {
    assistant: "Asistente IA",
    analytics: "Analítica para Inversores",
    settings: "Accesibilidad e Idioma",
    estimator: "Estimador de Cotización",
    ask: "Pregunta sobre mi trabajo…",
    scope: "Alcance",
    timeline: "Plazo",
    cost: "Costo",
    download: "Descargar propuesta",
  },
  fr: {
    assistant: "Assistant IA",
    analytics: "Analytique Investisseur",
    settings: "Accessibilité et Langue",
    estimator: "Estimateur de Devis",
    ask: "Posez une question sur mon travail…",
    scope: "Portée",
    timeline: "Délai",
    cost: "Coût",
    download: "Télécharger la proposition",
  },
};

export function PortfolioOsSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<OsSettings>(DEFAULTS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSettingsState({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.dataset.osContrast = settings.highContrast ? "high" : "normal";
    root.dataset.osText = settings.largeText ? "large" : "normal";
    root.dataset.osMotion = settings.reduceMotion ? "reduced" : "normal";
    root.dataset.osFont = settings.dyslexic ? "dyslexic" : "system";
    root.lang = settings.lang;
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* ignore */ }
  }, [settings]);

  const value = useMemo<Ctx>(() => ({
    settings,
    setSettings: (s) => setSettingsState((prev) => ({ ...prev, ...s })),
    t: (key: string) => DICT[settings.lang]?.[key] ?? DICT.en[key] ?? key,
  }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useOsSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    // Fallback so components mounted outside the provider still work.
    return {
      settings: DEFAULTS,
      setSettings: () => undefined,
      t: (k) => DICT.en[k] ?? k,
    };
  }
  return ctx;
}

// --- lightweight analytics (client-only) ---
const AKEY = "portfolio-os:analytics";
export interface Analytics {
  projectViews: Record<string, number>;
  featureClicks: Record<string, number>;
  pageViews: Record<string, number>;
  sessions: number;
  firstSeen: number;
  lastSeen: number;
}
const EMPTY: Analytics = { projectViews: {}, featureClicks: {}, pageViews: {}, sessions: 0, firstSeen: 0, lastSeen: 0 };

export function readAnalytics(): Analytics {
  if (typeof window === "undefined") return EMPTY;
  try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(AKEY) || "{}") }; } catch { return EMPTY; }
}
function writeAnalytics(a: Analytics) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(AKEY, JSON.stringify(a)); } catch { /* ignore */ }
}
export function trackEvent(kind: "project" | "feature" | "page", id: string) {
  const a = readAnalytics();
  const now = Date.now();
  if (!a.firstSeen) a.firstSeen = now;
  a.lastSeen = now;
  const bucket = kind === "project" ? a.projectViews : kind === "feature" ? a.featureClicks : a.pageViews;
  bucket[id] = (bucket[id] || 0) + 1;
  writeAnalytics(a);
  window.dispatchEvent(new CustomEvent("portfolio-os:analytics"));
}
export function bumpSession() {
  const a = readAnalytics();
  a.sessions = (a.sessions || 0) + 1;
  const now = Date.now();
  if (!a.firstSeen) a.firstSeen = now;
  a.lastSeen = now;
  writeAnalytics(a);
}
export function resetAnalytics() {
  writeAnalytics(EMPTY);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("portfolio-os:analytics"));
}