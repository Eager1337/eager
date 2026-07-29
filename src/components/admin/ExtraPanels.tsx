import { useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Palette,
  LayoutTemplate,
  FolderOpen,
  Settings2,
  Inbox,
  Loader2,
  Check,
  Download,
  RefreshCw,
} from "lucide-react";
import { listLeads } from "../../lib/leads.functions";
import { downloadCvPdf } from "../../lib/pdf-exports";

/* -------------------- shared dark UI -------------------- */

function Panel({
  title,
  subtitle,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  icon: typeof Palette;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-white/50">{subtitle}</p>
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function DarkCard({
  title,
  meta,
  children,
  className = "",
}: {
  title?: string;
  meta?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg shadow-black/30 transition-colors hover:border-white/20 ${className}`}
    >
      {(title || meta) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {meta && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/45">
              {meta}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

/* -------------------- 1. Theme Studio -------------------- */

const THEMES = [
  { id: "midnight", name: "Midnight", swatch: ["#08090f", "#7c3aed", "#38bdf8"] },
  { id: "ember", name: "Ember", swatch: ["#0b0705", "#e63946", "#f59e0b"] },
  { id: "forest", name: "Forest", swatch: ["#06110c", "#1C2E1E", "#4ade80"] },
  { id: "paper", name: "Warm Paper", swatch: ["#f6f3ec", "#1c1c1c", "#c2410c"] },
  { id: "mono", name: "Mono", swatch: ["#0a0a0a", "#ffffff", "#a3a3a3"] },
  { id: "ocean", name: "Ocean", swatch: ["#040d17", "#0ea5e9", "#22d3ee"] },
];

export function ThemeStudioPanel() {
  const [active, setActive] = useLocalState("eb:admin:theme", "midnight");
  const [radius, setRadius] = useLocalState("eb:admin:radius", 16);
  const [density, setDensity] = useLocalState("eb:admin:density", "comfortable");

  return (
    <Panel
      icon={Palette}
      title="Theme Studio"
      subtitle="Colour direction, corner radius and layout density for the public site."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`rounded-2xl border p-5 text-left transition-all ${
              active === t.id
                ? "border-fuchsia-400/60 bg-fuchsia-500/10"
                : "border-white/10 bg-white/[0.03] hover:border-white/25"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{t.name}</span>
              {active === t.id && <Check className="h-4 w-4 text-fuchsia-300" />}
            </div>
            <div className="mt-4 flex gap-2">
              {t.swatch.map((c) => (
                <span
                  key={c}
                  style={{ background: c }}
                  className="h-8 w-8 rounded-lg border border-white/15"
                />
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DarkCard title="Corner radius" meta={`${radius}px`}>
          <input
            type="range"
            min={0}
            max={32}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-fuchsia-400"
            aria-label="Corner radius"
          />
        </DarkCard>
        <DarkCard title="Layout density">
          <div className="flex gap-2">
            {["compact", "comfortable", "spacious"].map((d) => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                className={`min-h-[40px] flex-1 rounded-lg border px-3 text-xs capitalize ${
                  density === d
                    ? "border-white/40 bg-white/10"
                    : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/5"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </DarkCard>
      </div>
    </Panel>
  );
}

/* -------------------- 2. Content Sections -------------------- */

const SECTIONS = [
  { id: "hero", name: "ToonHub hero carousel", page: "Home" },
  { id: "about", name: "About me", page: "Portfolio" },
  { id: "services", name: "Services", page: "Portfolio" },
  { id: "process", name: "Process", page: "Portfolio" },
  { id: "work", name: "Featured work", page: "Portfolio" },
  { id: "pricing", name: "Pricing tiers", page: "Portfolio" },
  { id: "investor", name: "Investor practices", page: "Investor" },
  { id: "explore", name: "Explore gallery", page: "Explore" },
  { id: "contact", name: "Contact and lead form", page: "Contact" },
];

export function ContentSectionsPanel() {
  const [hidden, setHidden] = useLocalState<string[]>("eb:admin:hidden-sections", []);
  const toggle = (id: string) =>
    setHidden((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  return (
    <Panel
      icon={LayoutTemplate}
      title="Content Sections"
      subtitle="Turn individual page sections on or off without touching code."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map((s) => {
          const off = hidden.includes(s.id);
          return (
            <DarkCard key={s.id} title={s.name} meta={s.page}>
              <button
                onClick={() => toggle(s.id)}
                className={`min-h-[40px] w-full rounded-lg border px-3 text-xs font-medium ${
                  off
                    ? "border-white/10 bg-white/[0.02] text-white/50"
                    : "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                }`}
              >
                {off ? "Hidden" : "Visible"}
              </button>
            </DarkCard>
          );
        })}
      </div>
    </Panel>
  );
}

/* -------------------- 3. Media Library -------------------- */

export function MediaLibraryPanel() {
  const [files, setFiles] = useState<{ name: string; size: number; url: string; type: string }[]>([]);

  const add = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [
      ...Array.from(list).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        url: URL.createObjectURL(f),
      })),
      ...prev,
    ]);
  };

  return (
    <Panel
      icon={FolderOpen}
      title="Media Library"
      subtitle="Stage images and video, preview them, then push them into image slots."
      action={
        <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 text-xs hover:bg-white/10">
          Add media
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => add(e.target.files)}
          />
        </label>
      }
    >
      {files.length === 0 ? (
        <DarkCard>
          <p className="py-8 text-center text-sm text-white/45">
            No staged media yet. Add images or video to preview them here.
          </p>
        </DarkCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {files.map((f) => (
            <DarkCard key={f.url} title={f.name} meta={`${Math.round(f.size / 1024)} kb`}>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                {f.type.startsWith("video") ? (
                  <video src={f.url} controls className="h-40 w-full object-cover" />
                ) : (
                  <img src={f.url} alt={f.name} className="h-40 w-full object-cover" />
                )}
              </div>
            </DarkCard>
          ))}
        </div>
      )}
    </Panel>
  );
}

/* -------------------- 4. Site Settings -------------------- */

export function SiteSettingsPanel() {
  const [settings, setSettings] = useLocalState("eb:admin:site-settings", {
    siteName: "Eager Beaver",
    tagline: "Full-stack developer, systems builder, video editor",
    email: "ebeaver091@gmail.com",
    phone: "+232 33 695 803",
    welcomeEmail: true,
    attachCv: true,
    investorMode: false,
    maintenance: false,
  });

  const set = <K extends keyof typeof settings>(k: K, v: (typeof settings)[K]) =>
    setSettings({ ...settings, [k]: v });

  const toggles: { key: keyof typeof settings; label: string; help: string }[] = [
    { key: "welcomeEmail", label: "Visitor welcome email", help: "Send the CV email to new visitors." },
    { key: "attachCv", label: "Include CV download link", help: "Adds the one-click CV link to every email." },
    { key: "investorMode", label: "Investor mode default", help: "Open the site in pitch-focused messaging." },
    { key: "maintenance", label: "Maintenance banner", help: "Show a notice at the top of the site." },
  ];

  return (
    <Panel icon={Settings2} title="Site Settings" subtitle="Identity, contact details and global switches.">
      <div className="grid gap-4 lg:grid-cols-2">
        <DarkCard title="Identity">
          <div className="space-y-3">
            {(["siteName", "tagline", "email", "phone"] as const).map((k) => (
              <label key={k} className="block">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-white/40">
                  {k}
                </span>
                <input
                  value={String(settings[k])}
                  onChange={(e) => set(k, e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-white/35"
                />
              </label>
            ))}
          </div>
        </DarkCard>

        <DarkCard title="Switches">
          <div className="space-y-3">
            {toggles.map((t) => (
              <button
                key={String(t.key)}
                onClick={() => set(t.key, !settings[t.key] as never)}
                className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/30 p-3 text-left hover:border-white/25"
              >
                <span>
                  <span className="block text-sm">{t.label}</span>
                  <span className="block text-xs text-white/45">{t.help}</span>
                </span>
                <span
                  className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${
                    settings[t.key] ? "bg-emerald-500/80" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                      settings[t.key] ? "translate-x-5" : ""
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>
        </DarkCard>
      </div>
    </Panel>
  );
}

/* -------------------- 5. Leads inbox -------------------- */

type Lead = {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  budget: string | null;
  services: string[];
  message: string | null;
  source: string;
  welcome_email_status: string;
  created_at: string;
};

export function LeadsPanel() {
  const fetchLeads = useServerFn(listLeads);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLeads();
      if (!res.ok) throw new Error(res.error ?? "Could not load leads");
      setLeads(res.leads as Lead[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Panel
      icon={Inbox}
      title="Leads Inbox"
      subtitle="Every contact submission and visitor welcome sign-up."
      action={
        <div className="flex gap-2">
          <button
            onClick={() => void downloadCvPdf()}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 text-xs hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5" /> CV
          </button>
          <button
            onClick={() => void load()}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 text-xs hover:bg-white/10"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      }
    >
      {loading ? (
        <DarkCard>
          <div className="flex items-center gap-2 py-8 text-sm text-white/50">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading leads...
          </div>
        </DarkCard>
      ) : error ? (
        <DarkCard>
          <p className="py-6 text-sm text-red-300">{error}</p>
        </DarkCard>
      ) : leads.length === 0 ? (
        <DarkCard>
          <p className="py-8 text-center text-sm text-white/45">No leads captured yet.</p>
        </DarkCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {leads.map((l) => (
            <DarkCard key={l.id} title={l.name || l.email} meta={l.source}>
              <div className="space-y-1 text-sm text-white/70">
                <p>{l.email}</p>
                {l.company && <p className="text-white/50">{l.company}</p>}
                {l.budget && <p className="text-white/50">Budget: {l.budget}</p>}
                {l.services?.length > 0 && (
                  <p className="text-white/50">Services: {l.services.join(", ")}</p>
                )}
                {l.message && <p className="mt-2 text-white/60">{l.message}</p>}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-white/40">
                <span>{new Date(l.created_at).toLocaleString()}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5">
                  welcome: {l.welcome_email_status}
                </span>
              </div>
            </DarkCard>
          ))}
        </div>
      )}
    </Panel>
  );
}