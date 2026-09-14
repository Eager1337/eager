import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FolderKanban,
  Globe2,
  Inbox,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { getMyAdminStatus } from "../lib/security.functions";
import { analyticsSnapshot } from "../lib/analytics.functions";

export const Route = createFileRoute("/admin-command-center")({
  head: () => ({
    meta: [
      { title: "EagerBeaver — Executive Command Center" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CommandCenterGate,
});

type Snapshot = {
  visits: Array<{ id: string; path: string; country: string; created_at: string }>;
  orders: Array<{ id: string; amount: number; status: string; product_name: string; created_at: string }>;
  bookings: Array<{ id: string; name: string; status: string; value: number; scheduled_for: string; created_at: string }>;
  clients: Array<{ id: string; name: string; status: string; created_at: string }>;
  expenses: Array<{ id: string; amount: number; category: string; spent_on: string }>;
  leads: Array<{ id: string; email: string; source: string; created_at: string }>;
  downloads: Array<{ id: string; product_name: string; created_at: string }>;
  liveVisitors: number;
  generatedAt: string;
};

function CommandCenterGate() {
  const getAdmin = useServerFn(getMyAdminStatus);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        setAllowed(false);
        return;
      }
      try {
        const result = await getAdmin();
        setAllowed(Boolean(result.isAdmin));
      } catch {
        setAllowed(false);
      }
    });
  }, [getAdmin]);

  if (allowed === null) {
    return <div className="grid min-h-screen place-items-center bg-[#050510] text-white/60">Loading command center…</div>;
  }
  if (!allowed) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#050510] px-6 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl">
          <ShieldCheck className="mx-auto h-10 w-10 text-fuchsia-300" />
          <h1 className="mt-4 text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-white/50">This command center is restricted to verified administrators.</p>
          <Link to="/admin" className="mt-6 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">Open admin sign-in</Link>
        </div>
      </div>
    );
  }
  return <CommandCenter />;
}

function CommandCenter() {
  const load = useServerFn(analyticsSnapshot);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState<7 | 30 | 90>(30);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await load({
        data: {
          from: new Date(Date.now() - range * 864e5).toISOString(),
          to: "",
        },
      });
      setSnapshot(result as Snapshot);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load command center data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const metrics = useMemo(() => {
    const s = snapshot;
    const paid = s?.orders.filter((o) => o.status === "paid") ?? [];
    const revenue = paid.reduce((sum, o) => sum + Number(o.amount || 0), 0);
    const spend = s?.expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) ?? 0;
    const pipeline = s?.bookings
      .filter((b) => ["requested", "confirmed"].includes(b.status))
      .reduce((sum, b) => sum + Number(b.value || 0), 0) ?? 0;
    const pending = s?.orders.filter((o) => o.status === "pending").length ?? 0;
    const activeClients = s?.clients.filter((c) => c.status === "active").length ?? 0;
    return {
      revenue,
      spend,
      profit: revenue - spend,
      pipeline,
      pending,
      activeClients,
      visits: s?.visits.length ?? 0,
      leads: s?.leads.length ?? 0,
      orders: paid.length,
      bookings: s?.bookings.length ?? 0,
      downloads: s?.downloads.length ?? 0,
      live: s?.liveVisitors ?? 0,
    };
  }, [snapshot]);

  const money = (value: number) =>
    value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <main className="min-h-screen bg-[#050510] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-300">
              <Sparkles className="h-4 w-4" /> EagerBeaver
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Executive Command Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/50">
              One operational view of revenue, clients, growth, activity and the work that needs attention.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setRange(days as 7 | 30 | 90)}
                className={`rounded-xl border px-3 py-2 text-xs ${range === days ? "border-fuchsia-400/40 bg-fuchsia-400/10 text-white" : "border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.06]"}`}
              >
                {days} days
              </button>
            ))}
            <button onClick={() => void refresh()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs hover:bg-white/[0.06]">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-white/90">
              Full admin <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {error ? <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<CircleDollarSign />} label="Revenue" value={money(metrics.revenue)} sub={`${metrics.orders} paid orders`} />
          <Metric icon={<BarChart3 />} label="Net result" value={money(metrics.profit)} sub={`Spend ${money(metrics.spend)}`} tone={metrics.profit >= 0 ? "good" : "bad"} />
          <Metric icon={<Users />} label="Active clients" value={String(metrics.activeClients)} sub={`${metrics.leads} leads in range`} />
          <Metric icon={<Activity />} label="Live visitors" value={String(metrics.live)} sub={`${metrics.visits.toLocaleString()} visits in range`} live />
        </section>

        <section className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniMetric icon={<ShoppingBag />} label="Orders" value={String(metrics.orders)} />
          <MiniMetric icon={<Clock3 />} label="Bookings" value={String(metrics.bookings)} sub={money(metrics.pipeline) + " pipeline"} />
          <MiniMetric icon={<Inbox />} label="Pending" value={String(metrics.pending)} sub="orders needing attention" />
          <MiniMetric icon={<BriefcaseBusiness />} label="Downloads" value={String(metrics.downloads)} sub="digital product activity" />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel title="What needs attention" icon={<Clock3 />}>
            <div className="grid gap-2 sm:grid-cols-2">
              <ActionRow title="Pending orders" value={String(metrics.pending)} detail="Review payment/order status" tone={metrics.pending ? "warn" : "good"} />
              <ActionRow title="Open leads" value={String(metrics.leads)} detail="Follow up with potential clients" tone={metrics.leads ? "info" : "good"} />
              <ActionRow title="Booking pipeline" value={money(metrics.pipeline)} detail="Requested + confirmed sessions" tone={metrics.pipeline ? "info" : "good"} />
              <ActionRow title="Security" value="Protected" detail="Admin role + server-side analytics" tone="good" />
            </div>
          </Panel>

          <Panel title="Operating pulse" icon={<Globe2 />}>
            <Pulse label="Visitors" value={metrics.visits} max={Math.max(metrics.visits, metrics.orders, metrics.leads, 1)} />
            <Pulse label="Leads" value={metrics.leads} max={Math.max(metrics.visits, metrics.orders, metrics.leads, 1)} />
            <Pulse label="Orders" value={metrics.orders} max={Math.max(metrics.visits, metrics.orders, metrics.leads, 1)} />
            <Pulse label="Downloads" value={metrics.downloads} max={Math.max(metrics.visits, metrics.orders, metrics.leads, 1)} />
          </Panel>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel title="Business" icon={<BriefcaseBusiness />}>
            <QuickLink href="/admin" title="Clients & projects" text="Manage relationships and delivery." />
            <QuickLink href="/admin" title="Sales & finance" text="Orders, expenses and growth goals." />
            <QuickLink href="/admin" title="Contracts" text="Engagements, invoices and proposals." />
          </Panel>
          <Panel title="Build" icon={<FolderKanban />}>
            <QuickLink href="/admin" title="Site builder" text="Create and manage digital experiences." />
            <QuickLink href="/admin" title="Development workspace" text="Keep projects, knowledge and deployments together." />
            <QuickLink href="/admin" title="Marketplace" text="Products, bundles, reviews and licenses." />
          </Panel>
          <Panel title="Intelligence" icon={<BarChart3 />}>
            <QuickLink href="/admin" title="Business intelligence" text="Deep analytics, geography and reports." />
            <QuickLink href="/admin" title="AI workspace" text="Use AI as an operational assistant." />
            <QuickLink href="/admin" title="Security center" text="Audit, devices, MFA and security controls." />
          </Panel>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11px] text-white/35">
          <span>{snapshot ? `Data refreshed ${new Date(snapshot.generatedAt).toLocaleString()}` : "Waiting for data…"}</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Admin-only operational view</span>
        </footer>
      </div>
    </main>
  );
}

function Metric({ icon, label, value, sub, tone, live }: { icon: React.ReactNode; label: string; value: string; sub: string; tone?: "good" | "bad"; live?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_20px_70px_-40px_rgba(168,85,247,0.45)]">
      <div className="flex items-center justify-between text-white/45">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">{label}</span>
        <span className="text-fuchsia-300">{icon}</span>
      </div>
      <div className={`mt-3 text-3xl font-black ${tone === "good" ? "text-emerald-300" : tone === "bad" ? "text-red-300" : "text-white"}`}>{value}</div>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-white/40">
        {live ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> : null}{sub}
      </div>
    </div>
  );
}

function MiniMetric({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-white/55">{icon}</div>
      <div className="min-w-0"><div className="text-[10px] uppercase tracking-[0.16em] text-white/35">{label}</div><div className="mt-0.5 text-lg font-bold">{value}</div>{sub ? <div className="truncate text-[11px] text-white/35">{sub}</div> : null}</div>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="mb-4 flex items-center gap-2"><span className="text-fuchsia-300">{icon}</span><h2 className="text-sm font-semibold">{title}</h2></div>
      {children}
    </section>
  );
}

function ActionRow({ title, value, detail, tone }: { title: string; value: string; detail: string; tone: "good" | "warn" | "info" }) {
  const dot = tone === "good" ? "bg-emerald-400" : tone === "warn" ? "bg-amber-400" : "bg-sky-400";
  return <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/10 px-3 py-3"><span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} /><div className="min-w-0 flex-1"><div className="text-xs font-medium">{title}</div><div className="truncate text-[11px] text-white/35">{detail}</div></div><span className="shrink-0 text-sm font-bold">{value}</span></div>;
}

function Pulse({ label, value, max }: { label: string; value: number; max: number }) {
  return <div className="mb-3 last:mb-0"><div className="mb-1 flex justify-between text-xs"><span className="text-white/55">{label}</span><span className="text-white/35">{value.toLocaleString()}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-400" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div></div>;
}

function QuickLink({ href, title, text }: { href: "/admin"; title: string; text: string }) {
  return <Link to={href} className="group mb-2 block rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:border-fuchsia-400/20 hover:bg-white/[0.05]"><div className="flex items-center justify-between gap-3"><span className="text-xs font-medium">{title}</span><ArrowRight className="h-3.5 w-3.5 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-fuchsia-300" /></div><p className="mt-1 text-[11px] text-white/35">{text}</p></Link>;
}
