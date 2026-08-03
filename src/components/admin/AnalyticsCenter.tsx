import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Download,
  Globe2,
  Loader2,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { analyticsSnapshot, liveVisitorCount } from "../../lib/analytics.functions";

type Visit = {
  id: string;
  session_id: string;
  path: string;
  referrer: string;
  device: string;
  browser: string;
  os: string;
  language: string;
  timezone: string;
  screen: string;
  is_returning: boolean;
  country: string;
  region: string;
  city: string;
  created_at: string;
};
type Order = {
  id: string;
  product_name: string;
  product_type: string;
  amount: number;
  status: string;
  customer_email: string;
  created_at: string;
};
type Dl = { id: string; product_name: string; product_type: string; created_at: string };
type Booking = { id: string; name: string; session_type: string; status: string; value: number; created_at: string };
type Snapshot = {
  visits: Visit[];
  orders: Order[];
  downloads: Dl[];
  bookings: Booking[];
  clients: { id: string; name: string; status: string; created_at: string }[];
  expenses: { id: string; label: string; category: string; amount: number; spent_on: string }[];
  leads: { id: string; email: string; source: string; created_at: string }[];
  liveVisitors: number;
  generatedAt: string;
};

const RANGES = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "12m", label: "12 months", days: 365 },
  { key: "all", label: "All time", days: 3650 },
] as const;

const GRAINS = ["daily", "weekly", "monthly", "yearly"] as const;
type Grain = (typeof GRAINS)[number];

const COLORS = ["#e879f9", "#38bdf8", "#4ade80", "#fbbf24", "#f87171", "#a78bfa", "#22d3ee"];

/** Rough centroids so the world map can place bubbles from country codes only. */
const COUNTRY_POINTS: Record<string, { x: number; y: number; name: string }> = {
  US: { x: 20, y: 40, name: "United States" },
  CA: { x: 21, y: 28, name: "Canada" },
  BR: { x: 32, y: 68, name: "Brazil" },
  MX: { x: 17, y: 49, name: "Mexico" },
  GB: { x: 47, y: 30, name: "United Kingdom" },
  IE: { x: 45, y: 30, name: "Ireland" },
  FR: { x: 48, y: 34, name: "France" },
  DE: { x: 51, y: 31, name: "Germany" },
  ES: { x: 46, y: 38, name: "Spain" },
  IT: { x: 51, y: 37, name: "Italy" },
  NL: { x: 49, y: 30, name: "Netherlands" },
  SE: { x: 53, y: 24, name: "Sweden" },
  PL: { x: 54, y: 30, name: "Poland" },
  UA: { x: 57, y: 32, name: "Ukraine" },
  TR: { x: 58, y: 39, name: "Turkiye" },
  RU: { x: 68, y: 25, name: "Russia" },
  NG: { x: 49, y: 57, name: "Nigeria" },
  GH: { x: 47, y: 57, name: "Ghana" },
  SL: { x: 44, y: 56, name: "Sierra Leone" },
  LR: { x: 45, y: 58, name: "Liberia" },
  SN: { x: 43, y: 53, name: "Senegal" },
  MA: { x: 46, y: 44, name: "Morocco" },
  EG: { x: 57, y: 45, name: "Egypt" },
  ZA: { x: 55, y: 76, name: "South Africa" },
  KE: { x: 59, y: 60, name: "Kenya" },
  AE: { x: 63, y: 47, name: "United Arab Emirates" },
  SA: { x: 61, y: 47, name: "Saudi Arabia" },
  IN: { x: 69, y: 47, name: "India" },
  PK: { x: 66, y: 43, name: "Pakistan" },
  BD: { x: 72, y: 47, name: "Bangladesh" },
  CN: { x: 77, y: 38, name: "China" },
  JP: { x: 86, y: 38, name: "Japan" },
  KR: { x: 83, y: 38, name: "South Korea" },
  SG: { x: 77, y: 59, name: "Singapore" },
  ID: { x: 79, y: 62, name: "Indonesia" },
  PH: { x: 82, y: 55, name: "Philippines" },
  AU: { x: 84, y: 74, name: "Australia" },
  NZ: { x: 92, y: 80, name: "New Zealand" },
};

function startOf(d: Date, grain: Grain) {
  const x = new Date(d);
  if (grain === "yearly") return `${x.getUTCFullYear()}`;
  if (grain === "monthly") return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, "0")}`;
  if (grain === "weekly") {
    const day = x.getUTCDay() || 7;
    x.setUTCDate(x.getUTCDate() - day + 1);
  }
  return x.toISOString().slice(0, 10);
}

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}

function download(name: string, content: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function Card({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="truncate text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</div>
      <div className={`mt-2 truncate text-xl font-semibold sm:text-2xl ${accent ?? ""}`}>{value}</div>
      {sub ? <div className="mt-1 truncate text-[11px] text-white/40">{sub}</div> : null}
    </div>
  );
}

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}

function countBy<T>(rows: T[], pick: (r: T) => string) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = pick(r) || "Unknown";
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function AnalyticsCenter() {
  const load = useServerFn(analyticsSnapshot);
  const pollLive = useServerFn(liveVisitorCount);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rangeKey, setRangeKey] = useState<(typeof RANGES)[number]["key"]>("30d");
  const [grain, setGrain] = useState<Grain>("daily");
  const [query, setQuery] = useState("");
  const [live, setLive] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const days = RANGES.find((r) => r.key === rangeKey)?.days ?? 30;
      const res = (await load({
        data: { from: new Date(Date.now() - days * 864e5).toISOString(), to: "" },
      })) as Snapshot;
      setSnap(res);
      setLive(res.liveVisitors);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load analytics.");
    } finally {
      setLoading(false);
    }
  }, [load, rangeKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const t = setInterval(() => {
      void pollLive({})
        .then((r) => setLive((r as { count: number }).count))
        .catch(() => undefined);
    }, 20000);
    return () => clearInterval(t);
  }, [pollLive]);

  const m = useMemo(() => {
    const visits = snap?.visits ?? [];
    const orders = (snap?.orders ?? []).filter((o) => o.status !== "refunded");
    const downloads = snap?.downloads ?? [];
    const bookings = snap?.bookings ?? [];
    const expenses = snap?.expenses ?? [];

    const sessions = new Map<string, Visit[]>();
    for (const v of visits) {
      const arr = sessions.get(v.session_id) ?? [];
      arr.push(v);
      sessions.set(v.session_id, arr);
    }
    let durationTotal = 0;
    let bounces = 0;
    for (const arr of sessions.values()) {
      const times = arr.map((a) => new Date(a.created_at).getTime()).sort((a, b) => a - b);
      if (arr.length < 2) bounces += 1;
      durationTotal += (times[times.length - 1] ?? 0) - (times[0] ?? 0);
    }
    const sessionCount = sessions.size || 1;
    const revenue = orders.reduce((s, o) => s + Number(o.amount || 0), 0);
    const spend = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

    const series = new Map<string, { key: string; visitors: number; revenue: number; downloads: number; bookings: number }>();
    const bump = (key: string, field: "visitors" | "revenue" | "downloads" | "bookings", n: number) => {
      const row = series.get(key) ?? { key, visitors: 0, revenue: 0, downloads: 0, bookings: 0 };
      row[field] += n;
      series.set(key, row);
    };
    for (const v of visits) bump(startOf(new Date(v.created_at), grain), "visitors", 1);
    for (const o of orders) bump(startOf(new Date(o.created_at), grain), "revenue", Number(o.amount || 0));
    for (const d of downloads) bump(startOf(new Date(d.created_at), grain), "downloads", 1);
    for (const b of bookings) bump(startOf(new Date(b.created_at), grain), "bookings", 1);

    const trend = [...series.values()].sort((a, b) => a.key.localeCompare(b.key));

    const projectViews = countBy(
      visits.filter((v) => /^\/(projects|work|explore|portfolio-os|cargox|legends)/.test(v.path)),
      (v) => v.path,
    );

    return {
      visits,
      orders,
      downloads,
      bookings,
      totalVisits: visits.length,
      unique: sessions.size,
      returning: new Set(visits.filter((v) => v.is_returning).map((v) => v.session_id)).size,
      revenue,
      spend,
      profit: revenue - spend,
      orderCount: orders.length,
      aov: orders.length ? revenue / orders.length : 0,
      downloadCount: downloads.length,
      bookingCount: bookings.length,
      bookingValue: bookings.reduce((s, b) => s + Number(b.value || 0), 0),
      clients: snap?.clients ?? [],
      leads: snap?.leads ?? [],
      conversion: sessions.size ? ((orders.length + bookings.length) / sessions.size) * 100 : 0,
      avgSession: durationTotal / sessionCount / 1000,
      bounce: (bounces / sessionCount) * 100,
      trend,
      pages: countBy(visits, (v) => v.path),
      projects: projectViews,
      products: countBy(downloads, (d) => d.product_name),
      sources: countBy(visits, (v) => {
        if (!v.referrer) return "Direct";
        try {
          return new URL(v.referrer).hostname.replace(/^www\./, "");
        } catch {
          return "Other";
        }
      }),
      devices: countBy(visits, (v) => v.device),
      browsers: countBy(visits, (v) => v.browser),
      systems: countBy(visits, (v) => v.os),
      screens: countBy(visits, (v) => v.screen),
      countries: countBy(visits, (v) => v.country),
      cities: countBy(visits, (v) => [v.city, v.region, v.country].filter(Boolean).join(", ")),
      languages: countBy(visits, (v) => v.language),
    };
  }, [snap, grain]);

  const filteredVisits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return m.visits.slice(0, 100);
    return m.visits
      .filter((v) =>
        `${v.path} ${v.country} ${v.city} ${v.region} ${v.device} ${v.browser} ${v.os} ${v.referrer} ${v.language}`
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 200);
  }, [m.visits, query]);

  const exportPdf = async () => {
    const { default: JsPDF } = await import("jspdf");
    const doc = new JsPDF({ unit: "pt", format: "a4" });
    const lines = [
      ["Total visits", String(m.totalVisits)],
      ["Unique visitors", String(m.unique)],
      ["Returning visitors", String(m.returning)],
      ["Live visitors (5 min)", String(live)],
      ["Revenue", money(m.revenue)],
      ["Expenses", money(m.spend)],
      ["Profit", money(m.profit)],
      ["Orders", String(m.orderCount)],
      ["Average order value", money(m.aov)],
      ["Downloads", String(m.downloadCount)],
      ["Bookings", `${m.bookingCount} (${money(m.bookingValue)})`],
      ["Clients", String(m.clients.length)],
      ["Leads", String(m.leads.length)],
      ["Conversion rate", `${m.conversion.toFixed(2)}%`],
      ["Avg session duration", `${Math.round(m.avgSession)}s`],
      ["Bounce rate", `${m.bounce.toFixed(1)}%`],
    ];
    doc.setFontSize(18);
    doc.text("EagerBeaver, business intelligence report", 48, 56);
    doc.setFontSize(10);
    doc.text(`Range: last ${RANGES.find((r) => r.key === rangeKey)?.label}`, 48, 76);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 48, 90);
    let y = 124;
    for (const [k, v] of lines) {
      doc.setFontSize(11);
      doc.text(k, 48, y);
      doc.text(v, 320, y);
      y += 20;
    }
    y += 12;
    doc.setFontSize(13);
    doc.text("Top pages", 48, y);
    y += 18;
    for (const p of m.pages.slice(0, 12)) {
      doc.setFontSize(10);
      doc.text(p.name.slice(0, 60), 48, y);
      doc.text(String(p.value), 460, y);
      y += 16;
    }
    doc.save(`eagerbeaver-analytics-${Date.now()}.pdf`);
  };

  const maxCountry = Math.max(1, ...m.countries.map((c) => c.value));

  return (
    <div className="min-w-0 space-y-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold sm:text-xl">Business intelligence</h2>
          <p className="mt-1 text-xs text-white/50">
            Visitors, revenue, products, bookings and geography in one place.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[11px] text-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {live} live
          </span>
          <button
            onClick={() => void refresh()}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs hover:bg-white/10"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRangeKey(r.key)}
              className={`min-h-[34px] rounded-lg px-3 text-xs ${rangeKey === r.key ? "bg-white/15 text-white" : "text-white/55 hover:text-white"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-1">
          {GRAINS.map((g) => (
            <button
              key={g}
              onClick={() => setGrain(g)}
              className={`min-h-[34px] rounded-lg px-3 text-xs capitalize ${grain === g ? "bg-white/15 text-white" : "text-white/55 hover:text-white"}`}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            onClick={() => download(`visits-${Date.now()}.csv`, toCsv(m.visits as unknown as Record<string, unknown>[]))}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button
            onClick={() => void exportPdf()}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5" /> PDF report
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs text-red-200">{error}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <Card label="Total visits" value={m.totalVisits.toLocaleString()} sub="page views in range" />
        <Card label="Unique visitors" value={m.unique.toLocaleString()} sub="distinct sessions" />
        <Card label="Returning" value={m.returning.toLocaleString()} sub="came back before" />
        <Card label="Revenue" value={money(m.revenue)} accent="text-emerald-300" sub={`${m.orderCount} orders`} />
        <Card label="Profit" value={money(m.profit)} accent={m.profit >= 0 ? "text-emerald-300" : "text-red-300"} sub={`spend ${money(m.spend)}`} />
        <Card label="Avg order" value={money(m.aov)} sub="per purchase" />
        <Card label="Downloads" value={m.downloadCount.toLocaleString()} sub="digital products" />
        <Card label="Bookings" value={m.bookingCount.toLocaleString()} sub={money(m.bookingValue)} />
        <Card label="Clients" value={String(m.clients.length)} sub="in CRM" />
        <Card label="Conversion" value={`${m.conversion.toFixed(2)}%`} sub="sessions to action" />
        <Card label="Avg session" value={`${Math.round(m.avgSession)}s`} sub="time on site" />
        <Card label="Bounce rate" value={`${m.bounce.toFixed(1)}%`} sub="single page sessions" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title={`Visitor trend (${grain})`}>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={m.trend}>
                <defs>
                  <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e879f9" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#e879f9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="key" stroke="rgba(255,255,255,0.35)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0b0b14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="visitors" stroke="#e879f9" fill="url(#vGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Revenue and sales trend">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={m.trend}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="key" stroke="rgba(255,255,255,0.35)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} />
                <Tooltip contentStyle={{ background: "#0b0b14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" stroke="#4ade80" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="downloads" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="bookings" stroke="#fbbf24" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel
        title="Geography"
        action={<span className="text-[11px] text-white/40">Approximate, from IP. No GPS collected.</span>}
      >
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#070711]">
            <svg viewBox="0 0 100 100" className="h-56 w-full sm:h-72" role="img" aria-label="World visitor map">
              <rect width="100" height="100" fill="#070711" />
              {Object.values(COUNTRY_POINTS).map((p) => (
                <circle key={p.name} cx={p.x} cy={p.y} r={0.5} fill="rgba(255,255,255,0.16)" />
              ))}
              {m.countries.map((c) => {
                const pt = COUNTRY_POINTS[c.name.toUpperCase()];
                if (!pt) return null;
                const r = 1.2 + (c.value / maxCountry) * 4.5;
                return (
                  <g key={c.name}>
                    <circle cx={pt.x} cy={pt.y} r={r} fill="#e879f9" opacity={0.35} />
                    <circle cx={pt.x} cy={pt.y} r={r / 2.4} fill="#e879f9" />
                    <title>{`${pt.name}: ${c.value} visits`}</title>
                  </g>
                );
              })}
            </svg>
            {!m.countries.some((c) => COUNTRY_POINTS[c.name.toUpperCase()]) ? (
              <p className="absolute inset-x-0 bottom-3 text-center text-[11px] text-white/40">
                Country data appears once visits are recorded on the published site.
              </p>
            ) : null}
          </div>
          <div className="min-w-0 space-y-3">
            <List title="Top countries" icon={<Globe2 className="h-3.5 w-3.5" />} rows={m.countries.slice(0, 8)} />
            <List title="Cities and regions" icon={<Users className="h-3.5 w-3.5" />} rows={m.cities.slice(0, 6)} />
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Panel title="Traffic sources">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={m.sources.slice(0, 6)} dataKey="value" nameKey="name" innerRadius="45%" outerRadius="75%">
                  {m.sources.slice(0, 6).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0b0b14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Devices, browsers and systems">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...m.devices.slice(0, 3), ...m.browsers.slice(0, 3), ...m.systems.slice(0, 3)]}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.35)" fontSize={9} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0b0b14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Screen resolutions">
          <List title="" rows={m.screens.slice(0, 8)} />
        </Panel>
        <Panel title="Most viewed pages">
          <List title="" rows={m.pages.slice(0, 10)} />
        </Panel>
        <Panel title="Most viewed projects">
          <List title="" rows={m.projects.slice(0, 10)} />
        </Panel>
        <Panel title="Most downloaded products">
          <List title="" rows={m.products.slice(0, 10)} />
        </Panel>
      </div>

      <Panel
        title="Search analytics"
        action={
          <div className="relative w-full max-w-xs sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter visits, country, page, device"
              className="min-h-[38px] w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-xs outline-none focus:border-fuchsia-400/60"
            />
          </div>
        }
      >
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="text-white/45">
              <tr>
                {["When", "Page", "Location", "Device", "Browser", "OS", "Source"].map((h) => (
                  <th key={h} className="whitespace-nowrap border-b border-white/10 pb-2 pr-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredVisits.map((v) => (
                <tr key={v.id} className="border-b border-white/5">
                  <td className="whitespace-nowrap py-2 pr-4 text-white/60">
                    {new Date(v.created_at).toLocaleString()}
                  </td>
                  <td className="max-w-[220px] truncate py-2 pr-4">{v.path}</td>
                  <td className="whitespace-nowrap py-2 pr-4 text-white/60">
                    {[v.city, v.region, v.country].filter(Boolean).join(", ") || "Unknown"}
                  </td>
                  <td className="py-2 pr-4">{v.device}</td>
                  <td className="py-2 pr-4">{v.browser}</td>
                  <td className="py-2 pr-4">{v.os}</td>
                  <td className="max-w-[180px] truncate py-2 pr-4 text-white/50">{v.referrer || "Direct"}</td>
                </tr>
              ))}
              {!filteredVisits.length ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-white/40">
                    No visits match this filter yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Custom reports"
        action={<TrendingUp className="h-4 w-4 text-white/40" />}
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Visitors export", rows: m.visits },
            { label: "Orders export", rows: m.orders },
            { label: "Downloads export", rows: m.downloads },
            { label: "Bookings export", rows: m.bookings },
          ].map((r) => (
            <button
              key={r.label}
              onClick={() => download(`${r.label.replace(/\s+/g, "-")}-${Date.now()}.csv`, toCsv(r.rows as unknown as Record<string, unknown>[]))}
              className="inline-flex min-h-[44px] items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-xs hover:border-fuchsia-400/40 hover:bg-white/[0.06]"
            >
              <span className="truncate">{r.label}</span>
              <span className="shrink-0 text-white/40">{(r.rows as unknown[]).length}</span>
            </button>
          ))}
        </div>
      </Panel>

      {loading && !snap ? (
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Activity className="h-4 w-4 animate-pulse" /> Loading analytics...
        </div>
      ) : null}
    </div>
  );
}

function List({
  title,
  rows,
  icon,
}: {
  title: string;
  rows: { name: string; value: number }[];
  icon?: React.ReactNode;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="min-w-0">
      {title ? (
        <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-white/45">
          {icon} {title}
        </div>
      ) : null}
      <div className="space-y-1.5">
        {rows.length ? (
          rows.map((r) => (
            <div key={r.name} className="min-w-0">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="min-w-0 truncate text-white/70">{r.name}</span>
                <span className="shrink-0 text-white/45">{r.value}</span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-400" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-white/40">No data yet.</p>
        )}
      </div>
    </div>
  );
}
