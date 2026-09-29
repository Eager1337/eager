import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Code2,
  Database,
  FileBarChart,
  FileText,
  Globe2,
  Headphones,
  KeyRound,
  Megaphone,
  Network,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  Webhook,
} from "lucide-react";
import { ClientsPanel, DevWorkspacePanel, KnowledgePanel } from "./WorkspacePanels";
import { AnalyticsCenter } from "./AnalyticsCenter";
import { SalesPanel, TeamPanel } from "./BusinessPanels";
import { ReviewsPanel } from "./MarketplacePanels";
import { MediaLibraryPanel, SiteSettingsPanel, LeadsPanel } from "./ExtraPanels";

type ModuleKey =
  | "users"
  | "teams"
  | "roles"
  | "notifications"
  | "marketing"
  | "website"
  | "content"
  | "support"
  | "moderation"
  | "health"
  | "integrations"
  | "reports"
  | "activity"
  | "backups"
  | "developer"
  | "ai";

type Props = {
  module: ModuleKey;
};

const META: Record<ModuleKey, {
  title: string;
  description: string;
  icon: typeof Users;
  status: "live" | "partial" | "configure";
}> = {
  users: { title: "User Management", description: "Accounts, verification, suspension workflows and user activity.", icon: Users, status: "partial" },
  teams: { title: "Team Management", description: "Staff members, invitations, permissions and staff activity.", icon: Users, status: "live" },
  roles: { title: "Roles & Permissions", description: "Define administrative access boundaries without exposing service credentials.", icon: ShieldCheck, status: "partial" },
  notifications: { title: "Notifications Center", description: "System notifications, templates and delivery channels.", icon: Bell, status: "partial" },
  marketing: { title: "Marketing Center", description: "Campaigns, promotions, coupons, banners and announcements.", icon: Megaphone, status: "partial" },
  website: { title: "Website Management", description: "Pages, navigation, SEO, redirects and site-level configuration.", icon: Globe2, status: "partial" },
  content: { title: "Content Management", description: "Articles, media, categories and publishing workflow.", icon: FileText, status: "partial" },
  support: { title: "Customer Support", description: "Support operations, customer history and assigned staff.", icon: Headphones, status: "partial" },
  moderation: { title: "Reviews & Moderation", description: "Reviews, reports and flagged-content workflows.", icon: CircleHelp, status: "live" },
  health: { title: "System Health", description: "Application, database, API and background-job visibility.", icon: Server, status: "configure" },
  integrations: { title: "Integrations", description: "GitHub, Vercel, Supabase, payment, SMS, email and webhook configuration.", icon: Network, status: "configure" },
  reports: { title: "Reports & Exports", description: "Business, sales, traffic and operational reporting.", icon: FileBarChart, status: "partial" },
  activity: { title: "Activity Center", description: "A unified view of admin actions, security events and operational activity.", icon: Activity, status: "partial" },
  backups: { title: "Backup & Recovery", description: "Backup readiness, restore points and recovery procedures.", icon: Database, status: "configure" },
  developer: { title: "Developer Tools", description: "API documentation, keys, webhooks, feature flags and environment status.", icon: Code2, status: "partial" },
  ai: { title: "AI Control Center", description: "Providers, models, usage, prompts, generated content and API health.", icon: Sparkles, status: "partial" },
};

const STATUS = {
  live: { label: "Connected", className: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300" },
  partial: { label: "In progress", className: "border-amber-400/25 bg-amber-500/10 text-amber-300" },
  configure: { label: "Configure", className: "border-sky-400/25 bg-sky-500/10 text-sky-300" },
} as const;

function Surface({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">{children}</div>;
}

function EmptyState({ icon: Icon, title, body }: { icon: typeof Users; title: string; body: string }) {
  return (
    <Surface>
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5">
          <Icon className="h-5 w-5 text-white/70" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-white/50">{body}</p>
        </div>
      </div>
    </Surface>
  );
}

function StatusPill({ status }: { status: keyof typeof STATUS }) {
  const s = STATUS[status];
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${s.className}`}>{s.label}</span>;
}

export function AdminOperationsPanel({ module }: Props) {
  const meta = META[module];
  const Icon = meta.icon;
  const [showDetails, setShowDetails] = useState(false);

  const quickLinks = useMemo(() => ({
    users: ["Clients", "Visitors", "Leads"],
    teams: ["Team Workspace", "Audit Log"],
    roles: ["2FA & Passkeys", "Security Center"],
    notifications: ["Leads Inbox", "Bookings"],
    marketing: ["Sales & Orders", "Pricing Tiers", "Landing Pages"],
    website: ["Site Settings", "Content Sections", "Theme Studio"],
    content: ["Knowledge Base", "Media Library", "Content Sections"],
    support: ["Clients", "Leads Inbox", "Bookings"],
    moderation: ["Customer Reviews", "Security Center", "Audit Log"],
    health: ["Business Intelligence", "Deployment Center", "Security Center"],
    integrations: ["Developer Workspace", "Deployment Center", "Import & Connect Sites"],
    reports: ["Business Intelligence", "Sales & Orders", "Finance & Goals"],
    activity: ["Visitors", "Audit Log", "Sign-in Security"],
    backups: ["Deployment Center", "Site Settings", "Export"],
    developer: ["Developer Workspace", "Deployment Center", "AI Workspace"],
    ai: ["AI Workspace", "AI Website Builder", "Developer Workspace"],
  } as Record<ModuleKey, string[]>), []);

  if (module === "teams") return <TeamPanel />;
  if (module === "moderation") return <ReviewsPanel />;
  if (module === "website") return <SiteSettingsPanel />;
  if (module === "content") return <MediaLibraryPanel />;
  if (module === "reports") return <AnalyticsCenter />;
  if (module === "developer") return <DevWorkspacePanel />;
  if (module === "ai") {
    return (
      <div className="space-y-4">
        <Surface>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-fuchsia-500/10">
                <Sparkles className="h-5 w-5 text-fuchsia-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold">AI Control Center</h2>
                <p className="mt-1 text-sm text-white/50">The existing AI workspace remains the execution surface; this control center is the governance layer around it.</p>
              </div>
            </div>
            <StatusPill status="partial" />
          </div>
        </Surface>
        <EmptyState icon={KeyRound} title="Provider governance" body="Keep provider credentials in server-side environment secrets. This dashboard intentionally does not render API keys or secret values." />
        <EmptyState icon={BarChart3} title="Usage and cost telemetry" body="Connect provider usage telemetry before showing cost figures. No placeholder numbers are displayed." />
        <EmptyState icon={Webhook} title="Model and prompt controls" body="Model selection, prompt versions and generated-content review can be added without changing the existing AI workspace contract." />
      </div>
    );
  }

  const directPanel = {
    users: <ClientsPanel />,
    support: <LeadsPanel />,
    notifications: <EmptyState icon={Bell} title="Notification delivery" body="Email, SMS and push delivery require provider credentials and webhook endpoints. The control surface is ready without inventing delivery status." />,
    marketing: <EmptyState icon={Megaphone} title="Campaign workspace" body="Campaign records should be persisted in Supabase before this panel reports sends, opens or conversions. Existing sales and pricing data remains available below." />,
    roles: <EmptyState icon={ShieldCheck} title="Permission governance" body="The existing admin role check remains the enforcement boundary. Fine-grained roles should be introduced with explicit database policies rather than client-only switches." />,
    health: <EmptyState icon={Server} title="Runtime health checks" body="Connect deployment, database and provider health endpoints to populate this panel. Until then, the dashboard reports configuration state instead of fake uptime." />,
    integrations: <EmptyState icon={Network} title="Integration registry" body="Store integration metadata server-side and keep tokens in environment secrets. GitHub, Vercel, Supabase, payment, SMS and email connections can be surfaced here." />,
    activity: <EmptyState icon={Activity} title="Unified activity stream" body="The existing audit and security logs are the trusted sources. A unified stream should aggregate those sources server-side rather than duplicating events in the browser." />,
    backups: <EmptyState icon={Database} title="Backup readiness" body="Database restore operations should remain provider-controlled. This module is intentionally configuration-first until a verified backup provider and restore workflow are connected." />,
  }[module];

  return (
    <div className="space-y-4">
      <Surface>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/5">
              <Icon className="h-5 w-5 text-sky-300" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">Admin module</div>
              <h2 className="mt-1 text-xl font-bold">{meta.title}</h2>
              <p className="mt-1 max-w-2xl text-sm text-white/50">{meta.description}</p>
            </div>
          </div>
          <StatusPill status={meta.status} />
        </div>
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
        >
          <Settings2 className="h-3.5 w-3.5" /> Module details
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDetails ? "rotate-180" : ""}`} />
        </button>
        {showDetails && (
          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/50">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Admin authentication remains enforced server-side.</div>
            <div className="mt-2 flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Existing RLS and <code className="text-white/70">has_role('admin')</code> checks are preserved.</div>
            <div className="mt-2 flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> External credentials are never rendered in this UI.</div>
          </div>
        )}
      </Surface>

      {directPanel}

      <Surface>
        <div className="flex items-center gap-2 text-sm font-semibold"><BriefcaseBusiness className="h-4 w-4 text-fuchsia-300" /> Existing Eager surfaces</div>
        <p className="mt-1 text-xs text-white/40">These are real modules already present in the dashboard. The expansion intentionally links governance to existing data instead of creating duplicate fake stores.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickLinks[module].map((label) => (
            <span key={label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/60">{label}</span>
          ))}
        </div>
      </Surface>
    </div>
  );
}
