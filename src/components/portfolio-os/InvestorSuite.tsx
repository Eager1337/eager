import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bot, BarChart3, Settings2, Calculator, Download, Send, RefreshCw, Trash2, FileSpreadsheet, FileText } from "lucide-react";
import { PROJECTS } from "../../data/projects";
import { FEATURES } from "../../data/features";
import { PAGES } from "../../data/pages";
import { readAnalytics, resetAnalytics, useOsSettings, type Analytics } from "../../lib/portfolio-os-settings";
import { downloadAnalyticsCsv, downloadAnalyticsPdf, downloadQuotePdf } from "../../lib/pdf-exports";

type Tab = "assistant" | "analytics" | "settings" | "estimator";

export function InvestorSuite() {
  const [tab, setTab] = useState<Tab>("assistant");
  const { t } = useOsSettings();
  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "assistant", label: t("assistant"), icon: Bot },
    { id: "analytics", label: t("analytics"), icon: BarChart3 },
    { id: "settings", label: t("settings"), icon: Settings2 },
    { id: "estimator", label: t("estimator"), icon: Calculator },
  ];
  return (
    <div className="mx-auto max-w-6xl px-6 py-14 text-white">
      <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">/portfolio-os/suite</div>
      <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl" style={{ fontFamily: "'Kanit', sans-serif" }}>
        Investor Suite
      </h1>
      <p className="mt-3 max-w-2xl text-white/70">
        Everything an investor needs to evaluate the work, chat, analytics, accessibility, and a live proposal estimator.
      </p>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {tabs.map((tt) => {
          const Icon = tt.icon;
          const active = tab === tt.id;
          return (
            <button
              key={tt.id}
              onClick={() => setTab(tt.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${active ? "bg-white text-black" : "border border-white/15 text-white/70 hover:text-white"}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tt.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {tab === "assistant" && <AssistantPanel />}
        {tab === "analytics" && <AnalyticsPanel />}
        {tab === "settings" && <SettingsPanel />}
        {tab === "estimator" && <EstimatorPanel />}
      </div>
    </div>
  );
}

/* ---------- ASSISTANT ---------- */
interface Msg { role: "user" | "assistant"; text: string; refs?: { label: string; to: string }[] }

function AssistantPanel() {
  const { t } = useOsSettings();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hi, I'm the Portfolio OS assistant. Ask me about projects, features, or which pages best fit your investor thesis. Try: 'best AI projects', 'show medical work', or 'what proves traction?'" },
  ]);
  const [input, setInput] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => { boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  function answer(q: string): Msg {
    const s = q.toLowerCase();
    // Category match
    const catHit = ["AI", "Medical", "Education", "Government", "Sierra Leone", "Business", "Creator", "Startup", "Advanced", "Experimental"]
      .find((c) => s.includes(c.toLowerCase()));
    if (catHit) {
      const picks = PROJECTS.filter((p) => p.category === catHit).slice(0, 4);
      return {
        role: "assistant",
        text: `Top ${catHit} projects to review (${picks.length} of ${PROJECTS.filter((p) => p.category === catHit).length}):`,
        refs: picks.map((p) => ({ label: p.title, to: `/explore/${p.slug}` })),
      };
    }
    if (/traction|metric|kpi|growth|revenue|users?/.test(s)) {
      const strong = [...PROJECTS].sort((a, b) => b.metrics.length - a.metrics.length).slice(0, 4);
      return { role: "assistant", text: "Projects with the clearest traction metrics:", refs: strong.map((p) => ({ label: `${p.title}, ${p.metrics[0]?.value ?? "-"} ${p.metrics[0]?.label ?? ""}`, to: `/explore/${p.slug}` })) };
    }
    if (/feature|capability|what can/.test(s)) {
      const live = FEATURES.filter((f) => f.status === "live").slice(0, 5);
      return { role: "assistant", text: "Live investor-grade features worth demoing:", refs: live.map((f) => ({ label: f.name, to: "/portfolio-os" })) };
    }
    if (/page|section|nav/.test(s)) {
      const picks = PAGES.slice(0, 5);
      return { role: "assistant", text: "Key pages in the OS:", refs: picks.map((p) => ({ label: `${p.group} · ${p.title}`, to: `/portfolio-os/${p.slug}` })) };
    }
    if (/best|recommend|start|where.*begin/.test(s)) {
      const picks = PROJECTS.slice(0, 4);
      return { role: "assistant", text: "Best starting tour for an investor:", refs: [
        { label: "1. Home hero", to: "/" },
        { label: "2. Explore all case studies", to: "/explore" },
        ...picks.slice(0, 2).map((p) => ({ label: `Deep dive · ${p.title}`, to: `/explore/${p.slug}` })),
        { label: "Portfolio OS index", to: "/portfolio-os" },
      ]};
    }
    // Fallback: fuzzy search titles + taglines
    const hits = PROJECTS.filter((p) => (p.title + " " + p.tagline + " " + p.stack.join(" ")).toLowerCase().includes(s)).slice(0, 4);
    if (hits.length) return { role: "assistant", text: `${hits.length} matches:`, refs: hits.map((p) => ({ label: p.title, to: `/explore/${p.slug}` })) };
    return { role: "assistant", text: "I couldn't find that exactly. Try a category (AI, Medical, Education, Government), or ask for 'traction', 'features', or 'best pages'." };
  }

  function send() {
    const q = input.trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setTimeout(() => setMessages((m) => [...m, answer(q)]), 250);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      <div ref={boxRef} className="max-h-[420px] min-h-[280px] space-y-3 overflow-y-auto p-5">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <div className={`inline-block max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "bg-white text-black" : "bg-white/10 text-white"}`}>
              {m.text}
            </div>
            {m.refs && (
              <div className="mt-2 flex flex-wrap gap-2">
                {m.refs.map((r, j) => (
                  <Link key={j} to={r.to} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs hover:bg-white hover:text-black">
                    {r.label} →
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-white/10 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("ask")}
          className="flex-1 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
        />
        <button className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/90">
          <Send className="h-3.5 w-3.5" /> Send
        </button>
      </form>
    </div>
  );
}

/* ---------- ANALYTICS ---------- */
function AnalyticsPanel() {
  const [a, setA] = useState<Analytics>(() => readAnalytics());
  useEffect(() => {
    const on = () => setA(readAnalytics());
    window.addEventListener("portfolio-os:analytics", on);
    return () => window.removeEventListener("portfolio-os:analytics", on);
  }, []);

  const topProjects = Object.entries(a.projectViews).sort((x, y) => y[1] - x[1]).slice(0, 8);
  const totalViews = Object.values(a.projectViews).reduce((n, v) => n + v, 0);
  const totalFeatureClicks = Object.values(a.featureClicks).reduce((n, v) => n + v, 0);
  const maxView = Math.max(1, ...Object.values(a.projectViews));
  const [compareA, setCompareA] = useState(topProjects[0]?.[0] ?? PROJECTS[0].slug);
  const [compareB, setCompareB] = useState(topProjects[1]?.[0] ?? PROJECTS[1].slug);
  const projA = PROJECTS.find((p) => p.slug === compareA);
  const projB = PROJECTS.find((p) => p.slug === compareB);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Sessions" value={a.sessions} />
        <Kpi label="Project views" value={totalViews} />
        <Kpi label="Feature clicks" value={totalFeatureClicks} />
        <Kpi label="Since" value={a.firstSeen ? new Date(a.firstSeen).toLocaleDateString() : "-"} isText />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/70">Most-viewed case studies</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => downloadAnalyticsCsv(a, [compareA, compareB])} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/80 hover:bg-white hover:text-black">
              <FileSpreadsheet className="h-3 w-3" /> Export CSV
            </button>
            <button onClick={() => { void downloadAnalyticsPdf(a, [compareA, compareB]); }} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/80 hover:bg-white hover:text-black">
              <FileText className="h-3 w-3" /> Investor Analytics Pack (PDF)
            </button>
            <button onClick={() => { resetAnalytics(); setA(readAnalytics()); }} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/70 hover:text-white">
              <Trash2 className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>
        {topProjects.length === 0 ? (
          <p className="text-sm text-white/50">No data yet, open projects from <Link to="/explore" className="underline">Explore</Link> to populate.</p>
        ) : (
          <div className="space-y-2">
            {topProjects.map(([slug, n]) => {
              const p = PROJECTS.find((x) => x.slug === slug);
              return (
                <div key={slug} className="flex items-center gap-3">
                  <div className="w-40 truncate text-xs">{p?.title ?? slug}</div>
                  <div className="h-2 flex-1 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-400" style={{ width: `${(n / maxView) * 100}%` }} />
                  </div>
                  <div className="w-10 text-right text-xs tabular-nums">{n}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">Compare case studies</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {[[compareA, setCompareA, projA], [compareB, setCompareB, projB]].map(([slug, set, proj], i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-black/30 p-4">
              <select
                value={slug as string}
                onChange={(e) => (set as (v: string) => void)(e.target.value)}
                className="mb-3 w-full rounded-md border border-white/15 bg-black/50 px-2 py-1 text-sm"
              >
                {PROJECTS.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
              </select>
              {proj ? (
                <>
                  <div className="mb-2 text-xs uppercase tracking-widest text-white/50">{(proj as typeof PROJECTS[number]).category}</div>
                  <div className="text-sm text-white/80">{(proj as typeof PROJECTS[number]).tagline}</div>
                  <ul className="mt-3 space-y-1 text-xs text-white/70">
                    {(proj as typeof PROJECTS[number]).metrics.slice(0, 4).map((m, j) => (
                      <li key={j} className="flex justify-between"><span>{m.label}</span><span className="font-semibold text-white">{m.value}</span></li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, isText }: { label: string; value: number | string; isText?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-[10px] uppercase tracking-widest text-white/50">{label}</div>
      <div className={`mt-1 ${isText ? "text-sm" : "text-2xl"} font-bold tabular-nums`}>{value}</div>
    </div>
  );
}

/* ---------- SETTINGS ---------- */
function SettingsPanel() {
  const { settings, setSettings } = useOsSettings();
  const Toggle = ({ k, label, hint }: { k: keyof typeof settings; label: string; hint: string }) => (
    <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <input
        type="checkbox"
        checked={settings[k] as boolean}
        onChange={(e) => setSettings({ [k]: e.target.checked } as Partial<typeof settings>)}
        className="mt-1"
      />
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-white/60">{hint}</div>
      </div>
    </label>
  );
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">Language</h3>
        <div className="flex gap-2">
          {(["en", "es", "fr"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setSettings({ lang: l })}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${settings.lang === l ? "bg-white text-black" : "border border-white/15 text-white/70 hover:text-white"}`}
            >
              {l === "en" ? "English" : l === "es" ? "Español" : "Français"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/70">Accessibility</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle k="highContrast" label="High contrast" hint="Boost contrast ratios across the OS." />
          <Toggle k="largeText" label="Large text" hint="Increase body font size by 15%." />
          <Toggle k="reduceMotion" label="Reduce motion" hint="Disable non-essential animations." />
          <Toggle k="dyslexic" label="Dyslexia-friendly font" hint="Switch body copy to a rounded, high-legibility face." />
        </div>
      </div>
      <p className="text-xs text-white/50">Settings persist in this browser via localStorage and apply across Explore and Portfolio OS.</p>
    </div>
  );
}

/* ---------- ESTIMATOR ---------- */
interface EstState {
  pages: number;
  complexity: "starter" | "pro" | "enterprise";
  auth: boolean;
  cms: boolean;
  ai: boolean;
  payments: boolean;
  i18n: boolean;
  analytics: boolean;
  timelineTier: "standard" | "fast" | "rush";
  contact: string;
}

function EstimatorPanel() {
  const { t } = useOsSettings();
  const [s, setS] = useState<EstState>({
    pages: 6,
    complexity: "pro",
    auth: true,
    cms: false,
    ai: false,
    payments: false,
    i18n: false,
    analytics: true,
    timelineTier: "standard",
    contact: "",
  });

  const calc = useMemo(() => {
    const base = { starter: 900, pro: 1800, enterprise: 3500 }[s.complexity];
    const perPage = { starter: 120, pro: 220, enterprise: 380 }[s.complexity];
    const addons =
      (s.auth ? 450 : 0) +
      (s.cms ? 750 : 0) +
      (s.ai ? 1200 : 0) +
      (s.payments ? 900 : 0) +
      (s.i18n ? 350 : 0) +
      (s.analytics ? 250 : 0);
    const subtotal = base + perPage * s.pages + addons;
    const weeksBase = Math.max(2, Math.ceil(s.pages / 3));
    const addWeeks = (s.auth ? 1 : 0) + (s.cms ? 1 : 0) + (s.ai ? 2 : 0) + (s.payments ? 1 : 0);
    const weeks = weeksBase + addWeeks;
    const timelineMul = s.timelineTier === "fast" ? 1.25 : s.timelineTier === "rush" ? 1.6 : 1;
    const finalWeeks = s.timelineTier === "fast" ? Math.max(2, Math.ceil(weeks * 0.7)) : s.timelineTier === "rush" ? Math.max(1, Math.ceil(weeks * 0.5)) : weeks;
    const total = Math.round(subtotal * timelineMul);
    return { subtotal, addons, total, weeks: finalWeeks };
  }, [s]);

  function download() {
    const scopeLines = [
      `${s.pages} pages`,
      `${s.complexity[0].toUpperCase()}${s.complexity.slice(1)} complexity`,
      s.auth && "Authentication & user accounts",
      s.cms && "Headless CMS",
      s.ai && "AI features (chat / recommendations)",
      s.payments && "Payments",
      s.i18n && "Multi-language",
      s.analytics && "Analytics dashboard",
    ].filter(Boolean).join("\n- ");

    const md = `# Proposal, Eager Beaver

**Prepared for:** ${s.contact || "Client"}
**Date:** ${new Date().toLocaleDateString()}

## ${t("scope")}
- ${scopeLines}

## ${t("timeline")}
${calc.weeks} weeks (${s.timelineTier})

## Investment
Subtotal: $${calc.subtotal.toLocaleString()}
Timeline adjustment: ${s.timelineTier === "standard" ? "None" : s.timelineTier === "fast" ? "+25%" : "+60%"}
**Total: $${calc.total.toLocaleString()}**

## Deliverables
- Production build shipped on Lovable Cloud
- Full source access
- 30-day post-launch support

## Next steps
Reply to confirm and I'll send a signable SOW within 24 hours.
`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proposal-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    const addons = [
      s.auth && "Authentication & user accounts",
      s.cms && "Headless CMS",
      s.ai && "AI features (chat / recommendations)",
      s.payments && "Payments",
      s.i18n && "Multi-language",
      s.analytics && "Analytics dashboard",
    ].filter(Boolean) as string[];
    downloadQuotePdf({
      client: s.contact,
      pages: s.pages,
      complexity: s.complexity,
      timelineTier: s.timelineTier,
      weeks: calc.weeks,
      addons,
      subtotal: calc.subtotal,
      addonsTotal: calc.addons,
      total: calc.total,
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div>
          <label className="text-xs uppercase tracking-widest text-white/60">Pages: <span className="text-white">{s.pages}</span></label>
          <input type="range" min={1} max={40} value={s.pages} onChange={(e) => setS({ ...s, pages: Number(e.target.value) })} className="mt-2 w-full" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-white/60">Complexity</label>
          <div className="mt-2 flex gap-2">
            {(["starter", "pro", "enterprise"] as const).map((c) => (
              <button key={c} onClick={() => setS({ ...s, complexity: c })}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase transition-colors ${s.complexity === c ? "bg-white text-black" : "border border-white/15 text-white/70 hover:text-white"}`}>{c}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-white/60">Timeline</label>
          <div className="mt-2 flex gap-2">
            {(["standard", "fast", "rush"] as const).map((c) => (
              <button key={c} onClick={() => setS({ ...s, timelineTier: c })}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase transition-colors ${s.timelineTier === c ? "bg-white text-black" : "border border-white/15 text-white/70 hover:text-white"}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {([
            ["auth", "Auth"], ["cms", "CMS"], ["ai", "AI features"], ["payments", "Payments"], ["i18n", "Multi-language"], ["analytics", "Analytics"],
          ] as [keyof EstState, string][]).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 p-2 text-sm">
              <input type="checkbox" checked={s[k] as boolean} onChange={(e) => setS({ ...s, [k]: e.target.checked } as EstState)} />
              {label}
            </label>
          ))}
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-white/60">Client / company name</label>
          <input value={s.contact} onChange={(e) => setS({ ...s, contact: e.target.value })} placeholder="Acme Inc." className="mt-2 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm placeholder:text-white/40" />
        </div>
      </div>

      <div className="flex flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-sky-500/10 p-5">
        <div className="text-xs uppercase tracking-widest text-white/60">Live estimate</div>
        <div className="mt-2 text-5xl font-black tabular-nums">${calc.total.toLocaleString()}</div>
        <div className="mt-1 text-sm text-white/70">{calc.weeks} weeks · {s.pages} pages · {s.complexity}</div>
        <div className="mt-6 space-y-1 text-sm text-white/80">
          <div className="flex justify-between"><span>Base</span><span className="tabular-nums">${calc.subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Add-ons</span><span className="tabular-nums">${calc.addons.toLocaleString()}</span></div>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <button onClick={downloadPdf} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90">
            <FileText className="h-4 w-4" /> Download PDF proposal
          </button>
          <button onClick={download} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-2 text-xs font-semibold text-white/80 hover:bg-white/10">
            <Download className="h-3.5 w-3.5" /> Markdown version
          </button>
        </div>
        <button onClick={() => setS({ pages: 6, complexity: "pro", auth: true, cms: false, ai: false, payments: false, i18n: false, analytics: true, timelineTier: "standard", contact: "" })} className="mt-2 inline-flex items-center justify-center gap-1 text-xs text-white/60 hover:text-white">
          <RefreshCw className="h-3 w-3" /> Reset
        </button>
      </div>
    </div>
  );
}