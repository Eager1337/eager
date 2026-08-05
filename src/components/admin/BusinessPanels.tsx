import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Cloud,
  ExternalLink,
  Fingerprint,
  KeyRound,
  Loader2,
  Monitor,
  RefreshCw,
  ShieldCheck,
  Target,
} from "lucide-react";
import { RecordManager } from "./RecordManager";
import { listLoginHistory, registerAdminDevice } from "../../lib/business.functions";

const money = (n: number) =>
  Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const dateOnly = (v: unknown) => (v ? new Date(String(v)).toLocaleDateString() : "");

export function SalesPanel() {
  return (
    <RecordManager
      table="orders"
      title="Sales and orders"
      description="Every marketplace sale, retainer payment and product order in one ledger."
      orderBy="created_at"
      fields={[
        { key: "product_name", label: "Product or service", required: true },
        { key: "product_type", label: "Type", kind: "select", options: ["template", "system", "service", "retainer", "course", "other"] },
        { key: "amount", label: "Amount (USD)", kind: "number" },
        { key: "status", label: "Status", kind: "select", options: ["paid", "pending", "refunded", "failed"] },
        { key: "customer_name", label: "Customer name" },
        { key: "customer_email", label: "Customer email" },
        { key: "source", label: "Source", kind: "select", options: ["marketplace", "direct", "referral", "pinterest", "linkedin", "other"] },
        { key: "notes", label: "Notes", kind: "textarea", full: true },
      ]}
      columns={[
        { key: "product_name", label: "Product" },
        { key: "amount", label: "Amount", format: (r) => money(r.amount) },
        { key: "status", label: "Status" },
        { key: "customer_email", label: "Customer" },
        { key: "source", label: "Source" },
        { key: "created_at", label: "Date", format: (r) => dateOnly(r.created_at) },
      ]}
      summary={(rows) => {
        const paid = rows.filter((r) => r.status === "paid");
        const revenue = paid.reduce((s, r) => s + Number(r.amount || 0), 0);
        return [
          { label: "Orders", value: String(rows.length) },
          { label: "Paid revenue", value: money(revenue) },
          { label: "Average order", value: money(paid.length ? revenue / paid.length : 0) },
          { label: "Pending", value: String(rows.filter((r) => r.status === "pending").length) },
        ];
      }}
    />
  );
}

export function BookingsPanel() {
  return (
    <div className="space-y-8">
      <RecordManager
        table="bookings"
        title="Consultations and bookings"
        description="Track every discovery call, audit and strategy session with its value."
      fields={[
        { key: "name", label: "Client name", required: true },
        { key: "email", label: "Email" },
        { key: "session_type", label: "Session", kind: "select", options: ["discovery call", "technical audit", "strategy session", "build sprint", "training"] },
        { key: "scheduled_for", label: "Scheduled for", kind: "datetime" },
        { key: "status", label: "Status", kind: "select", options: ["requested", "confirmed", "completed", "no show", "cancelled"] },
        { key: "value", label: "Value (USD)", kind: "number" },
        { key: "notes", label: "Notes", kind: "textarea", full: true },
      ]}
      columns={[
        { key: "name", label: "Client" },
        { key: "session_type", label: "Session" },
        { key: "scheduled_for", label: "When", format: (r) => (r.scheduled_for ? new Date(r.scheduled_for).toLocaleString() : "") },
        { key: "status", label: "Status" },
        { key: "value", label: "Value", format: (r) => money(r.value) },
      ]}
      summary={(rows) => [
        { label: "Bookings", value: String(rows.length) },
        { label: "Confirmed", value: String(rows.filter((r) => r.status === "confirmed").length) },
        { label: "Completed", value: String(rows.filter((r) => r.status === "completed").length) },
        { label: "Pipeline value", value: money(rows.reduce((s, r) => s + Number(r.value || 0), 0)) },
      ]}
      />
      <RecordManager
        table="booking_reminders"
        title="Reminders and follow-ups"
        description="Every confirmation, reminder and follow-up recap queued for a booking. Edit the copy or the send time before it goes out."
        orderBy="send_at"
        fields={[
          { key: "kind", label: "Kind", kind: "select", options: ["confirmation", "reminder", "follow-up", "reschedule", "cancellation"] },
          { key: "channel", label: "Channel", kind: "select", options: ["email", "sms", "whatsapp"] },
          { key: "send_at", label: "Send at", kind: "datetime" },
          { key: "status", label: "Status", kind: "select", options: ["scheduled", "sent", "skipped", "failed"] },
          { key: "subject", label: "Subject", full: true },
          { key: "body", label: "Message", kind: "textarea", full: true },
        ]}
        columns={[
          { key: "kind", label: "Kind" },
          { key: "subject", label: "Subject" },
          { key: "send_at", label: "Send at", format: (r) => (r.send_at ? new Date(r.send_at).toLocaleString() : "") },
          { key: "channel", label: "Channel" },
          { key: "status", label: "Status" },
        ]}
        summary={(rows) => [
          { label: "Queued messages", value: String(rows.length) },
          { label: "Scheduled", value: String(rows.filter((r) => r.status === "scheduled").length) },
          { label: "Reminders", value: String(rows.filter((r) => r.kind === "reminder").length) },
          { label: "Follow-ups", value: String(rows.filter((r) => r.kind === "follow-up").length) },
        ]}
      />
    </div>
  );
}

export function FinancePanel() {
  const [tab, setTab] = useState<"expenses" | "goals">("expenses");
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-1">
        {(["expenses", "goals"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`min-h-[36px] rounded-lg px-4 text-xs capitalize ${tab === t ? "bg-white/15" : "text-white/55 hover:text-white"}`}
          >
            {t === "expenses" ? "Expenses" : "Growth goals"}
          </button>
        ))}
      </div>
      {tab === "expenses" ? (
        <RecordManager
          table="business_expenses"
          title="Business expenses"
          description="Tools, hosting, contractors and marketing spend, so profit is always accurate."
          orderBy="spent_on"
          fields={[
            { key: "label", label: "Expense", required: true },
            { key: "category", label: "Category", kind: "select", options: ["tools", "hosting", "marketing", "contractor", "hardware", "education", "other"] },
            { key: "amount", label: "Amount (USD)", kind: "number" },
            { key: "spent_on", label: "Date", kind: "date" },
            { key: "notes", label: "Notes", kind: "textarea", full: true },
          ]}
          columns={[
            { key: "label", label: "Expense" },
            { key: "category", label: "Category" },
            { key: "amount", label: "Amount", format: (r) => money(r.amount) },
            { key: "spent_on", label: "Date", format: (r) => dateOnly(r.spent_on) },
          ]}
          summary={(rows) => [
            { label: "Entries", value: String(rows.length) },
            { label: "Total spend", value: money(rows.reduce((s, r) => s + Number(r.amount || 0), 0)) },
            { label: "Tools", value: money(rows.filter((r) => r.category === "tools").reduce((s, r) => s + Number(r.amount || 0), 0)) },
            { label: "Marketing", value: money(rows.filter((r) => r.category === "marketing").reduce((s, r) => s + Number(r.amount || 0), 0)) },
          ]}
        />
      ) : (
        <RecordManager
          table="business_goals"
          title="Growth goals"
          description="Quarterly targets with live progress, ready to show an investor."
          orderBy="due_on"
          fields={[
            { key: "title", label: "Goal", required: true },
            { key: "category", label: "Category", kind: "select", options: ["revenue", "clients", "traffic", "product", "skills", "brand"] },
            { key: "target_value", label: "Target", kind: "number" },
            { key: "current_value", label: "Current", kind: "number" },
            { key: "unit", label: "Unit", placeholder: "USD, clients, visits" },
            { key: "due_on", label: "Due", kind: "date" },
            { key: "status", label: "Status", kind: "select", options: ["on track", "at risk", "achieved", "paused"] },
            { key: "notes", label: "Notes", kind: "textarea", full: true },
          ]}
          columns={[
            { key: "title", label: "Goal" },
            { key: "category", label: "Category" },
            {
              key: "progress",
              label: "Progress",
              format: (r) =>
                `${Math.min(100, Math.round((Number(r.current_value || 0) / Math.max(1, Number(r.target_value || 1))) * 100))}% (${r.current_value ?? 0}/${r.target_value ?? 0} ${r.unit ?? ""})`,
            },
            { key: "status", label: "Status" },
            { key: "due_on", label: "Due", format: (r) => dateOnly(r.due_on) },
          ]}
          summary={(rows) => [
            { label: "Goals", value: String(rows.length) },
            { label: "On track", value: String(rows.filter((r) => r.status === "on track").length) },
            { label: "At risk", value: String(rows.filter((r) => r.status === "at risk").length) },
            { label: "Achieved", value: String(rows.filter((r) => r.status === "achieved").length) },
          ]}
        />
      )}
    </div>
  );
}

export function TeamPanel() {
  return (
    <RecordManager
      table="team_members"
      title="Team workspace"
      description="Collaborators, their role and what they are allowed to touch."
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "email", label: "Email" },
        { key: "role", label: "Role", kind: "select", options: ["owner", "developer", "designer", "editor", "marketing", "viewer"] },
        { key: "permissions", label: "Permissions (comma separated)", kind: "tags", full: true, placeholder: "clients, projects, media" },
        { key: "status", label: "Status", kind: "select", options: ["active", "invited", "paused"] },
        { key: "notes", label: "Notes", kind: "textarea", full: true },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "email", label: "Email" },
        { key: "permissions", label: "Permissions", format: (r) => (Array.isArray(r.permissions) ? r.permissions.join(", ") : "") },
        { key: "status", label: "Status" },
      ]}
      summary={(rows) => [
        { label: "Members", value: String(rows.length) },
        { label: "Active", value: String(rows.filter((r) => r.status === "active").length) },
        { label: "Invited", value: String(rows.filter((r) => r.status === "invited").length) },
        { label: "Roles", value: String(new Set(rows.map((r) => r.role)).size) },
      ]}
    />
  );
}

export function ContractsPanel() {
  const [tab, setTab] = useState<"contracts" | "invoices">("contracts");
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-1">
        {(["contracts", "invoices"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`min-h-[36px] rounded-lg px-4 text-xs capitalize ${tab === t ? "bg-white/15" : "text-white/55 hover:text-white"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "contracts" ? (
        <RecordManager
          table="contracts"
          title="Contracts"
          description="Scope, value and dates for every signed engagement."
          fields={[
            { key: "client_name", label: "Client", required: true },
            { key: "title", label: "Contract title" },
            { key: "value", label: "Value (USD)", kind: "number" },
            { key: "status", label: "Status", kind: "select", options: ["draft", "sent", "signed", "active", "completed", "cancelled"] },
            { key: "starts_on", label: "Starts", kind: "date" },
            { key: "ends_on", label: "Ends", kind: "date" },
            { key: "terms", label: "Terms and scope", kind: "textarea", full: true },
          ]}
          columns={[
            { key: "client_name", label: "Client" },
            { key: "title", label: "Title" },
            { key: "value", label: "Value", format: (r) => money(r.value) },
            { key: "status", label: "Status" },
            { key: "ends_on", label: "Ends", format: (r) => dateOnly(r.ends_on) },
          ]}
          summary={(rows) => [
            { label: "Contracts", value: String(rows.length) },
            { label: "Active", value: String(rows.filter((r) => r.status === "active").length) },
            { label: "Signed value", value: money(rows.filter((r) => ["signed", "active", "completed"].includes(r.status)).reduce((s, r) => s + Number(r.value || 0), 0)) },
            { label: "Drafts", value: String(rows.filter((r) => r.status === "draft").length) },
          ]}
        />
      ) : (
        <RecordManager
          table="invoices"
          title="Invoices"
          description="Billing status so nothing goes uncollected."
          fields={[
            { key: "client_name", label: "Client", required: true },
            { key: "number", label: "Invoice number" },
            { key: "amount", label: "Amount (USD)", kind: "number" },
            { key: "status", label: "Status", kind: "select", options: ["draft", "sent", "paid", "overdue", "void"] },
            { key: "issued_on", label: "Issued", kind: "date" },
            { key: "due_on", label: "Due", kind: "date" },
            { key: "notes", label: "Notes", kind: "textarea", full: true },
          ]}
          columns={[
            { key: "number", label: "Number" },
            { key: "client_name", label: "Client" },
            { key: "amount", label: "Amount", format: (r) => money(r.amount) },
            { key: "status", label: "Status" },
            { key: "due_on", label: "Due", format: (r) => dateOnly(r.due_on) },
          ]}
          summary={(rows) => [
            { label: "Invoices", value: String(rows.length) },
            { label: "Paid", value: money(rows.filter((r) => r.status === "paid").reduce((s, r) => s + Number(r.amount || 0), 0)) },
            { label: "Outstanding", value: money(rows.filter((r) => ["sent", "overdue"].includes(r.status)).reduce((s, r) => s + Number(r.amount || 0), 0)) },
            { label: "Overdue", value: String(rows.filter((r) => r.status === "overdue").length) },
          ]}
        />
      )}
    </div>
  );
}

const DEPLOY_GROUPS: { group: string; tools: { name: string; url: string; note: string }[] }[] = [
  {
    group: "Deploy and host",
    tools: [
      { name: "Vercel", url: "https://vercel.com/dashboard", note: "Production deploys and logs" },
      { name: "Netlify", url: "https://app.netlify.com", note: "Static and edge hosting" },
      { name: "Cloudflare", url: "https://dash.cloudflare.com", note: "DNS, WAF and cache" },
      { name: "Render", url: "https://dashboard.render.com", note: "Services and cron" },
      { name: "Railway", url: "https://railway.app/dashboard", note: "Databases and workers" },
      { name: "Fly.io", url: "https://fly.io/dashboard", note: "Global app runtime" },
    ],
  },
  {
    group: "Code and CI",
    tools: [
      { name: "GitHub", url: "https://github.com", note: "Repos, actions and releases" },
      { name: "GitHub Actions", url: "https://github.com/notifications", note: "Pipeline status" },
      { name: "Lovable", url: "https://lovable.dev/projects", note: "Build and iterate" },
      { name: "Sentry", url: "https://sentry.io", note: "Runtime error tracking" },
      { name: "Linear", url: "https://linear.app", note: "Issues and sprints" },
    ],
  },
  {
    group: "Data and backend",
    tools: [
      { name: "Supabase", url: "https://supabase.com/dashboard", note: "Database, auth and storage" },
      { name: "Firebase", url: "https://console.firebase.google.com", note: "Realtime and messaging" },
      { name: "Upstash", url: "https://console.upstash.com", note: "Redis and queues" },
      { name: "Stripe", url: "https://dashboard.stripe.com", note: "Payments and payouts" },
    ],
  },
  {
    group: "Design and growth",
    tools: [
      { name: "Figma", url: "https://figma.com/files", note: "UI design system" },
      { name: "Pinterest", url: "https://pinterest.com", note: "Visual distribution" },
      { name: "Search Console", url: "https://search.google.com/search-console", note: "Indexing and queries" },
      { name: "Analytics", url: "https://analytics.google.com", note: "Traffic and funnels" },
      { name: "PageSpeed", url: "https://pagespeed.web.dev", note: "Core web vitals" },
    ],
  },
];

const ENV_VARS = [
  { key: "VITE_SUPABASE_URL", note: "Public backend URL, safe in the browser" },
  { key: "VITE_SUPABASE_PUBLISHABLE_KEY", note: "Public key, safe in the browser" },
  { key: "SUPABASE_URL", note: "Server side backend URL" },
  { key: "SUPABASE_PUBLISHABLE_KEY", note: "Server side public key" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", note: "Server only, never expose" },
  { key: "OWNER_LOGIN_USERNAME", note: "Admin username" },
  { key: "OWNER_LOGIN_PASSWORDS", note: "Admin password" },
  { key: "LOVABLE_API_KEY", note: "Server only, powers the AI workspace" },
];

export function DeploymentCenterPanel() {
  const [copied, setCopied] = useState("");
  return (
    <div className="min-w-0 space-y-5">
      <header className="min-w-0">
        <h2 className="text-lg font-semibold sm:text-xl">Deployment center</h2>
        <p className="mt-1 text-xs text-white/50">
          One click to every platform in the build pipeline, plus the environment variables the deploy needs.
        </p>
      </header>

      {DEPLOY_GROUPS.map((g) => (
        <section key={g.group} className="min-w-0">
          <h3 className="text-[10px] uppercase tracking-[0.25em] text-white/45">{g.group}</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {g.tools.map((t) => (
              <a
                key={t.name}
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-[64px] min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-fuchsia-400/40 hover:bg-white/[0.06]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{t.name}</span>
                  <span className="block truncate text-[11px] text-white/45">{t.note}</span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-white/40 group-hover:text-white" />
              </a>
            ))}
          </div>
        </section>
      ))}

      <section className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-white/50" />
          <h3 className="text-sm font-semibold">Deployment checklist and environment variables</h3>
        </div>
        <ol className="mt-3 space-y-1.5 text-xs text-white/60">
          <li>1. Push from Lovable to GitHub, the main branch is the deploy source.</li>
          <li>2. In Vercel, import the repo and keep the framework preset as detected.</li>
          <li>3. Add every variable below in Vercel project settings, for production and preview.</li>
          <li>4. Redeploy, then sign in at /admin to confirm the owner login works in production.</li>
        </ol>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {ENV_VARS.map((v) => (
            <button
              key={v.key}
              onClick={() => {
                void navigator.clipboard.writeText(v.key);
                setCopied(v.key);
                setTimeout(() => setCopied(""), 1500);
              }}
              className="flex min-h-[52px] min-w-0 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left hover:bg-white/[0.06]"
            >
              <span className="min-w-0">
                <span className="block truncate font-mono text-[11px]">{v.key}</span>
                <span className="block truncate text-[10px] text-white/45">{v.note}</span>
              </span>
              <span className="shrink-0 text-[10px] text-white/40">{copied === v.key ? "copied" : "copy"}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export function SecurityCenterPanel() {
  const loadHistory = useServerFn(listLoginHistory);
  const registerDevice = useServerFn(registerAdminDevice);
  const [history, setHistory] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await loadHistory({})) as { rows: Record<string, any>[] };
      setHistory(res.rows);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load login history.");
    } finally {
      setLoading(false);
    }
  }, [loadHistory]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const fp = `${navigator.userAgent}|${screen.width}x${screen.height}|${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
    void registerDevice({
      data: { label: `${navigator.platform || "Device"} browser session`, fingerprint: fp.slice(0, 200) },
    }).catch(() => undefined);
  }, [registerDevice]);

  const stats = useMemo(() => {
    const failed = history.filter((h) => h.outcome !== "success").length;
    return [
      { label: "Sign in events", value: String(history.length) },
      { label: "Successful", value: String(history.length - failed) },
      { label: "Blocked or failed", value: String(failed) },
      { label: "Locations seen", value: String(new Set(history.map((h) => h.location_label).filter(Boolean)).size) },
    ];
  }, [history]);

  const controls = [
    { icon: <KeyRound className="h-4 w-4" />, title: "Role based access", body: "Admin actions are gated by a database role check on every server call, not by client state." },
    { icon: <ShieldCheck className="h-4 w-4" />, title: "Two factor and OTP", body: "Owner login requires the second factor step before the dashboard unlocks." },
    { icon: <Fingerprint className="h-4 w-4" />, title: "Device recognition", body: "Each admin browser is fingerprinted and listed below, unknown devices stand out." },
    { icon: <Monitor className="h-4 w-4" />, title: "Rate limiting and lockout", body: "Repeated failures lock the identifier for the configured window." },
  ];

  return (
    <div className="min-w-0 space-y-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold sm:text-xl">Cybersecurity center</h2>
          <p className="mt-1 text-xs text-white/50">Access control, sign in history, devices and open findings.</p>
        </div>
        <button
          onClick={() => void refresh()}
          className="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs hover:bg-white/10"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Refresh
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="truncate text-[10px] uppercase tracking-[0.2em] text-white/45">{s.label}</div>
            <div className="mt-1.5 text-lg font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {controls.map((c) => (
          <div key={c.title} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-emerald-300">{c.icon}<span className="text-sm font-semibold text-white">{c.title}</span></div>
            <p className="mt-2 text-xs leading-relaxed text-white/55">{c.body}</p>
          </div>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs text-red-200">{error}</p>
      ) : null}

      <section className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <h3 className="text-sm font-semibold">Login history</h3>
        <div className="-mx-4 mt-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="text-white/45">
              <tr>
                {["When", "Identifier", "Outcome", "Location", "Device", "Browser"].map((h) => (
                  <th key={h} className="whitespace-nowrap border-b border-white/10 pb-2 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-white/5">
                  <td className="whitespace-nowrap py-2 pr-4 text-white/60">{new Date(h.created_at).toLocaleString()}</td>
                  <td className="max-w-[160px] truncate py-2 pr-4">{h.identifier}</td>
                  <td className="py-2 pr-4">
                    <span className={h.outcome === "success" ? "text-emerald-300" : "text-red-300"}>{h.outcome}</span>
                  </td>
                  <td className="max-w-[180px] truncate py-2 pr-4 text-white/60">{h.location_label || "Unknown"}</td>
                  <td className="py-2 pr-4">{h.device}</td>
                  <td className="py-2 pr-4">{h.browser}</td>
                </tr>
              ))}
              {!history.length && !loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-white/40">No sign in events recorded yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <RecordManager
        table="admin_devices"
        title="Trusted devices"
        description="Devices that have opened the dashboard. Mark the ones you recognise as trusted."
        orderBy="last_seen_at"
        fields={[
          { key: "label", label: "Device label", required: true },
          { key: "fingerprint", label: "Fingerprint", full: true },
          { key: "trusted", label: "Trusted", kind: "bool" },
        ]}
        columns={[
          { key: "label", label: "Device" },
          { key: "trusted", label: "Trusted", format: (r) => (r.trusted ? "Yes" : "No") },
          { key: "last_seen_at", label: "Last seen", format: (r) => (r.last_seen_at ? new Date(r.last_seen_at).toLocaleString() : "") },
        ]}
      />

      <RecordManager
        table="security_findings"
        title="Security findings"
        description="Track hardening work, from discovery through remediation."
        fields={[
          { key: "title", label: "Finding", required: true },
          { key: "severity", label: "Severity", kind: "select", options: ["critical", "high", "medium", "low", "info"] },
          { key: "category", label: "Category", kind: "select", options: ["access control", "data exposure", "dependency", "configuration", "monitoring"] },
          { key: "status", label: "Status", kind: "select", options: ["open", "in progress", "resolved", "accepted risk"] },
          { key: "source", label: "Source", placeholder: "scan, review, report" },
          { key: "remediation", label: "Remediation", kind: "textarea", full: true },
        ]}
        columns={[
          { key: "title", label: "Finding" },
          { key: "severity", label: "Severity" },
          { key: "category", label: "Category" },
          { key: "status", label: "Status" },
        ]}
        summary={(rows) => [
          { label: "Findings", value: String(rows.length) },
          { label: "Open", value: String(rows.filter((r) => r.status === "open").length) },
          { label: "High or critical", value: String(rows.filter((r) => ["high", "critical"].includes(r.severity)).length) },
          { label: "Resolved", value: String(rows.filter((r) => r.status === "resolved").length) },
        ]}
      />

      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/50">
        <Target className="h-4 w-4 shrink-0" /> Every write on this page runs through a server side admin role check, so a
        stolen browser session cannot escalate privileges.
      </div>
    </div>
  );
}
