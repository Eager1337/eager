import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Users,
  FolderKanban,
  LayoutGrid,
  BookOpen,
  Activity,
  Plus,
  Search,
  Star,
  Pin,
  Trash2,
  Save,
  X,
  ExternalLink,
  Archive,
  Copy,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  listClients,
  saveClient,
  deleteClient,
  setClientArchived,
  listClientProjects,
  saveClientProject,
  deleteClientProject,
  duplicateClientProject,
  listWorkspaceTools,
  saveWorkspaceTool,
  deleteWorkspaceTool,
  touchWorkspaceTool,
  seedWorkspaceTools,
  listKnowledge,
  saveKnowledge,
  deleteKnowledge,
  listVisits,
} from "../../lib/workspace.functions";

/* ============ shared UI ============ */

function Panel({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  icon: typeof Users;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-white/50">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">{action}</div>
      </header>
      {children}
    </section>
  );
}

const btn =
  "inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10";
const btnPrimary =
  "inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-sky-500 px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90";
const input =
  "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-fuchsia-400/60";
const card = "rounded-2xl border border-white/10 bg-white/[0.03] p-4";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] uppercase tracking-wider text-white/45">{label}</span>
      {children}
    </label>
  );
}

function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b0b14] p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button onClick={onClose} className={btn} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer ? <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/45">
      {label}
    </div>
  );
}

function useRows<T>(loader: () => Promise<{ records: T[] }>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loader();
      setRows(res.records);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load data");
    } finally {
      setLoading(false);
    }
  }, [loader]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return { rows, loading, error, refresh };
}

function Status({ loading, error }: { loading: boolean; error: string }) {
  if (loading)
    return (
      <div className="flex items-center gap-2 text-sm text-white/50">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
      </div>
    );
  if (error) return <div className="text-sm text-rose-300">{error}</div>;
  return null;
}

/* ============ Clients ============ */

type ClientRow = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  billing_info: string;
  contract_notes: string;
  project_notes: string;
  communication_log: string;
  feedback: string;
  reminder: string;
  follow_up_at: string | null;
  status: string;
  priority: string;
  archived: boolean;
  updated_at: string;
};

const emptyClient = {
  name: "",
  company: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  billing_info: "",
  contract_notes: "",
  project_notes: "",
  communication_log: "",
  feedback: "",
  documents: [] as { name: string; url: string }[],
  reminder: "",
  follow_up_at: null as string | null,
  status: "lead",
  priority: "medium",
  archived: false,
};

const CLIENT_STATUS = ["lead", "active", "paused", "won", "lost", "completed"];
const PRIORITY = ["low", "medium", "high", "critical"];

export function ClientsPanel() {
  const load = useServerFn(listClients);
  const save = useServerFn(saveClient);
  const remove = useServerFn(deleteClient);
  const archive = useServerFn(setClientArchived);
  const { rows, loading, error, refresh } = useRows<ClientRow>(load as never);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<(typeof emptyClient & { id?: string }) | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (!showArchived && r.archived) return false;
      if (showArchived && !r.archived) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
      if (!q) return true;
      return [r.name, r.company, r.email, r.phone, r.project_notes]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, query, statusFilter, priorityFilter, showArchived]);

  const submit = async () => {
    if (!editing?.name.trim()) return alert("Client name is required");
    setBusy(true);
    try {
      const { id, ...values } = editing;
      await save({ data: { id: id ?? null, values } as never });
      setEditing(null);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      title="Client Management"
      subtitle="Companies, contacts, billing, contracts, notes, reminders and feedback."
      icon={Users}
      action={
        <>
          <button className={btn} onClick={() => void refresh()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button className={btnPrimary} onClick={() => setEditing({ ...emptyClient })}>
            <Plus className="h-3.5 w-3.5" /> New client
          </button>
        </>
      }
    >
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            className={`${input} pl-9`}
            placeholder="Search clients, companies, emails..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search clients"
          />
        </div>
        <select
          className={input}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {CLIENT_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className={input}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          {PRIORITY.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className={btn} onClick={() => setShowArchived((v) => !v)}>
          <Archive className="h-3.5 w-3.5" /> {showArchived ? "Active" : "Archived"}
        </button>
      </div>

      <Status loading={loading} error={error} />

      {!loading && !filtered.length ? <Empty label="No clients match this view yet." /> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((c) => (
          <article key={c.id} className={card}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-white">{c.name}</h3>
                <p className="truncate text-xs text-white/50">{c.company || "No company"}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/60">
                  {c.status}
                </span>
                <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-fuchsia-200">
                  {c.priority}
                </span>
              </div>
            </div>
            <dl className="mt-3 space-y-1 text-xs text-white/55">
              {c.email ? <div>{c.email}</div> : null}
              {c.phone ? <div>{c.phone}</div> : null}
              {c.follow_up_at ? (
                <div className="text-amber-200/80">
                  Follow up: {new Date(c.follow_up_at).toLocaleDateString()}
                </div>
              ) : null}
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className={btn}
                onClick={() =>
                  setEditing({
                    ...emptyClient,
                    ...c,
                    documents: [],
                    follow_up_at: c.follow_up_at ? c.follow_up_at.slice(0, 10) : null,
                  })
                }
              >
                Open profile
              </button>
              <button
                className={btn}
                onClick={async () => {
                  await archive({ data: { id: c.id, archived: !c.archived } });
                  await refresh();
                }}
              >
                <Archive className="h-3.5 w-3.5" /> {c.archived ? "Restore" : "Archive"}
              </button>
              <button
                className={`${btn} border-rose-400/30 text-rose-200`}
                onClick={async () => {
                  if (!confirm(`Delete ${c.name}?`)) return;
                  await remove({ data: { id: c.id } });
                  await refresh();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <Modal
          title={editing.id ? `Client: ${editing.name}` : "Add a new client"}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className={btn} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className={btnPrimary} onClick={() => void submit()} disabled={busy}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}{" "}
                Save client
              </button>
            </>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input
                className={input}
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </Field>
            <Field label="Company">
              <input
                className={input}
                value={editing.company}
                onChange={(e) => setEditing({ ...editing, company: e.target.value })}
              />
            </Field>
            <Field label="Email">
              <input
                className={input}
                value={editing.email}
                onChange={(e) => setEditing({ ...editing, email: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <input
                className={input}
                value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
              />
            </Field>
            <Field label="Website">
              <input
                className={input}
                value={editing.website}
                onChange={(e) => setEditing({ ...editing, website: e.target.value })}
              />
            </Field>
            <Field label="Address">
              <input
                className={input}
                value={editing.address}
                onChange={(e) => setEditing({ ...editing, address: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <select
                className={input}
                value={editing.status}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
              >
                {CLIENT_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select
                className={input}
                value={editing.priority}
                onChange={(e) => setEditing({ ...editing, priority: e.target.value })}
              >
                {PRIORITY.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Reminder">
              <input
                className={input}
                value={editing.reminder}
                onChange={(e) => setEditing({ ...editing, reminder: e.target.value })}
              />
            </Field>
            <Field label="Follow-up date">
              <input
                type="date"
                className={input}
                value={editing.follow_up_at ?? ""}
                onChange={(e) => setEditing({ ...editing, follow_up_at: e.target.value || null })}
              />
            </Field>
          </div>
          <Field label="Billing information">
            <textarea
              rows={2}
              className={input}
              value={editing.billing_info}
              onChange={(e) => setEditing({ ...editing, billing_info: e.target.value })}
            />
          </Field>
          <Field label="Contracts">
            <textarea
              rows={2}
              className={input}
              value={editing.contract_notes}
              onChange={(e) => setEditing({ ...editing, contract_notes: e.target.value })}
            />
          </Field>
          <Field label="Project notes">
            <textarea
              rows={3}
              className={input}
              value={editing.project_notes}
              onChange={(e) => setEditing({ ...editing, project_notes: e.target.value })}
            />
          </Field>
          <Field label="Communication history">
            <textarea
              rows={3}
              className={input}
              value={editing.communication_log}
              onChange={(e) => setEditing({ ...editing, communication_log: e.target.value })}
            />
          </Field>
          <Field label="Client feedback">
            <textarea
              rows={2}
              className={input}
              value={editing.feedback}
              onChange={(e) => setEditing({ ...editing, feedback: e.target.value })}
            />
          </Field>
        </Modal>
      ) : null}
    </Panel>
  );
}

/* ============ Projects ============ */

type ProjectRow = {
  id: string;
  client_id: string | null;
  name: string;
  summary: string;
  state: string;
  progress: number;
  deadline: string | null;
  budget: string;
  estimated_hours: number;
  completed_hours: number;
  milestones: { title: string; done: boolean }[];
  tasks: { title: string; done: boolean }[];
  requirements: string;
  meeting_notes: string;
  deployment_notes: string;
  api_docs: string;
  repo_url: string;
  live_url: string;
  archived: boolean;
  updated_at: string;
};

const emptyProject = {
  client_id: null as string | null,
  name: "",
  summary: "",
  state: "active",
  progress: 0,
  deadline: null as string | null,
  budget: "",
  estimated_hours: 0,
  completed_hours: 0,
  milestones: [] as { title: string; done: boolean }[],
  tasks: [] as { title: string; done: boolean }[],
  requirements: "",
  meeting_notes: "",
  deployment_notes: "",
  api_docs: "",
  design_assets: [] as { name: string; url: string }[],
  repo_url: "",
  live_url: "",
  archived: false,
};

function ChecklistEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: { title: string; done: boolean }[];
  onChange: (next: { title: string; done: boolean }[]) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-2">
      <span className="text-[11px] uppercase tracking-wider text-white/45">{label}</span>
      <div className="space-y-1.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={it.done}
              onChange={() =>
                onChange(items.map((x, j) => (i === j ? { ...x, done: !x.done } : x)))
              }
              className="h-4 w-4"
              aria-label={`Toggle ${it.title}`}
            />
            <span className={`flex-1 text-sm ${it.done ? "text-white/40 line-through" : "text-white/80"}`}>
              {it.title}
            </span>
            <button
              className={btn}
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              aria-label={`Remove ${it.title}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className={input}
          placeholder={`Add ${label.toLowerCase()}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              onChange([...items, { title: draft.trim(), done: false }]);
              setDraft("");
            }
          }}
        />
        <button
          className={btn}
          onClick={() => {
            if (!draft.trim()) return;
            onChange([...items, { title: draft.trim(), done: false }]);
            setDraft("");
          }}
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </div>
  );
}

export function ProjectsPanel() {
  const load = useServerFn(listClientProjects);
  const loadClients = useServerFn(listClients);
  const save = useServerFn(saveClientProject);
  const remove = useServerFn(deleteClientProject);
  const duplicate = useServerFn(duplicateClientProject);
  const { rows, loading, error, refresh } = useRows<ProjectRow>(load as never);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [view, setView] = useState<"active" | "completed" | "archived">("active");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<(typeof emptyProject & { id?: string }) | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (loadClients() as unknown as Promise<{ records: { id: string; name: string }[] }>)
      .then((r) => setClients(r.records))
      .catch(() => setClients([]));
  }, [loadClients]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((p) => {
      if (view === "archived") {
        if (!p.archived) return false;
      } else if (p.archived || p.state !== (view === "active" ? "active" : "completed")) {
        if (view === "active" && !p.archived && p.state === "on-hold") {
          /* on-hold shows in active */
        } else return false;
      }
      if (!q) return true;
      return [p.name, p.summary, p.requirements].join(" ").toLowerCase().includes(q);
    });
  }, [rows, view, query]);

  const submit = async () => {
    if (!editing?.name.trim()) return alert("Project name is required");
    setBusy(true);
    try {
      const { id, ...values } = editing;
      await save({ data: { id: id ?? null, values } as never });
      setEditing(null);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const clientName = (id: string | null) => clients.find((c) => c.id === id)?.name ?? "Internal";

  return (
    <Panel
      title="Project Management"
      subtitle="Active and past projects, milestones, tasks, hours, budgets and documentation."
      icon={FolderKanban}
      action={
        <>
          <button className={btn} onClick={() => void refresh()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button className={btnPrimary} onClick={() => setEditing({ ...emptyProject })}>
            <Plus className="h-3.5 w-3.5" /> New project
          </button>
        </>
      }
    >
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            className={`${input} pl-9`}
            placeholder="Search projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search projects"
          />
        </div>
        <div className="flex gap-2">
          {(["active", "completed", "archived"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`${btn} ${view === v ? "border-fuchsia-400/50 bg-fuchsia-500/15 text-white" : ""}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <Status loading={loading} error={error} />
      {!loading && !filtered.length ? <Empty label={`No ${view} projects yet.`} /> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((p) => (
          <article key={p.id} className={card}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">{p.name}</h3>
                <p className="text-xs text-white/45">{clientName(p.client_id)}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase text-white/60">
                {p.state}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-white/55">{p.summary}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500"
                style={{ width: `${p.progress}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/45">
              <span>{p.progress}% complete</span>
              <span>
                {p.completed_hours}/{p.estimated_hours} h
              </span>
              {p.budget ? <span>{p.budget}</span> : null}
              {p.deadline ? <span>Due {p.deadline}</span> : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className={btn}
                onClick={() =>
                  setEditing({
                    ...emptyProject,
                    ...p,
                    milestones: p.milestones ?? [],
                    tasks: p.tasks ?? [],
                    design_assets: [],
                  })
                }
              >
                Open
              </button>
              <button
                className={btn}
                onClick={async () => {
                  await duplicate({ data: { id: p.id } });
                  await refresh();
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </button>
              <button
                className={btn}
                onClick={async () => {
                  await save({
                    data: { id: p.id, values: { ...p, design_assets: [], archived: !p.archived } } as never,
                  });
                  await refresh();
                }}
              >
                <Archive className="h-3.5 w-3.5" /> {p.archived ? "Restore" : "Archive"}
              </button>
              {p.repo_url ? (
                <a className={btn} href={p.repo_url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> Repo
                </a>
              ) : null}
              <button
                className={`${btn} border-rose-400/30 text-rose-200`}
                onClick={async () => {
                  if (!confirm(`Delete ${p.name}?`)) return;
                  await remove({ data: { id: p.id } });
                  await refresh();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <Modal
          title={editing.id ? `Project: ${editing.name}` : "Create a new project"}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className={btn} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className={btnPrimary} onClick={() => void submit()} disabled={busy}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}{" "}
                Save project
              </button>
            </>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Project name">
              <input
                className={input}
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </Field>
            <Field label="Client">
              <select
                className={input}
                value={editing.client_id ?? ""}
                onChange={(e) => setEditing({ ...editing, client_id: e.target.value || null })}
              >
                <option value="">Internal / none</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="State">
              <select
                className={input}
                value={editing.state}
                onChange={(e) => setEditing({ ...editing, state: e.target.value })}
              >
                <option value="active">active</option>
                <option value="on-hold">on-hold</option>
                <option value="completed">completed</option>
              </select>
            </Field>
            <Field label="Deadline">
              <input
                type="date"
                className={input}
                value={editing.deadline ?? ""}
                onChange={(e) => setEditing({ ...editing, deadline: e.target.value || null })}
              />
            </Field>
            <Field label="Progress %">
              <input
                type="number"
                min={0}
                max={100}
                className={input}
                value={editing.progress}
                onChange={(e) => setEditing({ ...editing, progress: Number(e.target.value) })}
              />
            </Field>
            <Field label="Budget">
              <input
                className={input}
                value={editing.budget}
                onChange={(e) => setEditing({ ...editing, budget: e.target.value })}
              />
            </Field>
            <Field label="Estimated hours">
              <input
                type="number"
                min={0}
                className={input}
                value={editing.estimated_hours}
                onChange={(e) => setEditing({ ...editing, estimated_hours: Number(e.target.value) })}
              />
            </Field>
            <Field label="Completed hours">
              <input
                type="number"
                min={0}
                className={input}
                value={editing.completed_hours}
                onChange={(e) => setEditing({ ...editing, completed_hours: Number(e.target.value) })}
              />
            </Field>
            <Field label="Repository URL">
              <input
                className={input}
                value={editing.repo_url}
                onChange={(e) => setEditing({ ...editing, repo_url: e.target.value })}
              />
            </Field>
            <Field label="Live URL">
              <input
                className={input}
                value={editing.live_url}
                onChange={(e) => setEditing({ ...editing, live_url: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Summary">
            <textarea
              rows={2}
              className={input}
              value={editing.summary}
              onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
            />
          </Field>
          <ChecklistEditor
            label="Milestones"
            items={editing.milestones}
            onChange={(milestones) => setEditing({ ...editing, milestones })}
          />
          <ChecklistEditor
            label="Tasks"
            items={editing.tasks}
            onChange={(tasks) => setEditing({ ...editing, tasks })}
          />
          <Field label="Client requirements">
            <textarea
              rows={3}
              className={input}
              value={editing.requirements}
              onChange={(e) => setEditing({ ...editing, requirements: e.target.value })}
            />
          </Field>
          <Field label="Meeting notes">
            <textarea
              rows={3}
              className={input}
              value={editing.meeting_notes}
              onChange={(e) => setEditing({ ...editing, meeting_notes: e.target.value })}
            />
          </Field>
          <Field label="API documentation">
            <textarea
              rows={2}
              className={input}
              value={editing.api_docs}
              onChange={(e) => setEditing({ ...editing, api_docs: e.target.value })}
            />
          </Field>
          <Field label="Deployment notes">
            <textarea
              rows={2}
              className={input}
              value={editing.deployment_notes}
              onChange={(e) => setEditing({ ...editing, deployment_notes: e.target.value })}
            />
          </Field>
        </Modal>
      ) : null}
    </Panel>
  );
}

/* ============ Developer Workspace ============ */

type ToolRow = {
  id: string;
  name: string;
  url: string;
  category: string;
  notes: string;
  icon: string;
  favorite: boolean;
  pinned: boolean;
  last_opened_at: string | null;
  open_count: number;
};

export const DEFAULT_TOOLS = [
  { name: "GitHub", url: "https://github.com", category: "Code" },
  { name: "Vercel", url: "https://vercel.com/dashboard", category: "Hosting" },
  { name: "Netlify", url: "https://app.netlify.com", category: "Hosting" },
  { name: "Lovable", url: "https://lovable.dev", category: "Build" },
  { name: "Pinterest", url: "https://pinterest.com", category: "Inspiration" },
  { name: "Figma", url: "https://figma.com", category: "Design" },
  { name: "VS Code", url: "https://vscode.dev", category: "Code" },
  { name: "Supabase", url: "https://supabase.com/dashboard", category: "Backend" },
  { name: "Firebase", url: "https://console.firebase.google.com", category: "Backend" },
  { name: "Cloudflare", url: "https://dash.cloudflare.com", category: "Infra" },
  { name: "Google Cloud", url: "https://console.cloud.google.com", category: "Infra" },
  { name: "AWS", url: "https://console.aws.amazon.com", category: "Infra" },
  { name: "Render", url: "https://dashboard.render.com", category: "Hosting" },
  { name: "Railway", url: "https://railway.app", category: "Hosting" },
  { name: "Replit", url: "https://replit.com", category: "Code" },
  { name: "Cursor", url: "https://cursor.com", category: "Code" },
  { name: "Docker", url: "https://hub.docker.com", category: "Infra" },
  { name: "Postman", url: "https://postman.com", category: "API" },
  { name: "Notion", url: "https://notion.so", category: "Planning" },
  { name: "Linear", url: "https://linear.app", category: "Planning" },
  { name: "Trello", url: "https://trello.com", category: "Planning" },
  { name: "Jira", url: "https://jira.atlassian.com", category: "Planning" },
];

const emptyTool = {
  name: "",
  url: "",
  category: "General",
  notes: "",
  icon: "",
  favorite: false,
  pinned: false,
};

export function DevWorkspacePanel() {
  const load = useServerFn(listWorkspaceTools);
  const save = useServerFn(saveWorkspaceTool);
  const remove = useServerFn(deleteWorkspaceTool);
  const touch = useServerFn(touchWorkspaceTool);
  const seed = useServerFn(seedWorkspaceTools);
  const { rows, loading, error, refresh } = useRows<ToolRow>(load as never);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [favOnly, setFavOnly] = useState(false);
  const [editing, setEditing] = useState<(typeof emptyTool & { id?: string }) | null>(null);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(rows.map((r) => r.category))).sort()],
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((t) => (category === "all" ? true : t.category === category))
      .filter((t) => (favOnly ? t.favorite : true))
      .filter((t) => (!q ? true : `${t.name} ${t.url} ${t.notes}`.toLowerCase().includes(q)))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.name.localeCompare(b.name));
  }, [rows, query, category, favOnly]);

  const open = async (t: ToolRow) => {
    window.open(t.url, "_blank", "noopener,noreferrer");
    try {
      await touch({ data: { id: t.id, openCount: t.open_count } });
      await refresh();
    } catch {
      /* opening should never fail because of tracking */
    }
  };

  return (
    <Panel
      title="Developer Workspace"
      subtitle="Quick-launch every tool in your build flow, with notes, favourites and pinning."
      icon={LayoutGrid}
      action={
        <>
          <button
            className={btn}
            onClick={async () => {
              const res = (await seed({ data: { tools: DEFAULT_TOOLS } })) as { inserted: number };
              alert(`${res.inserted} tool(s) added`);
              await refresh();
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Load default tools
          </button>
          <button className={btnPrimary} onClick={() => setEditing({ ...emptyTool })}>
            <Plus className="h-3.5 w-3.5" /> Add tool
          </button>
        </>
      }
    >
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            className={`${input} pl-9`}
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search tools"
          />
        </div>
        <select
          className={input}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All categories" : c}
            </option>
          ))}
        </select>
        <button
          className={`${btn} ${favOnly ? "border-amber-400/50 text-amber-200" : ""}`}
          onClick={() => setFavOnly((v) => !v)}
        >
          <Star className="h-3.5 w-3.5" /> Favourites
        </button>
      </div>

      <Status loading={loading} error={error} />
      {!loading && !rows.length ? (
        <Empty label="No tools yet. Click 'Load default tools' to add GitHub, Vercel, Lovable, Figma and more." />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <article key={t.id} className={`${card} flex flex-col justify-between`}>
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  {t.icon ? (
                    <img src={t.icon} alt="" className="h-8 w-8 rounded-lg object-cover" />
                  ) : (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500/30 to-sky-500/30 text-xs font-bold">
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{t.name}</h3>
                    <p className="text-[11px] text-white/40">{t.category}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    aria-label="Toggle favourite"
                    className={`rounded-lg p-1.5 ${t.favorite ? "text-amber-300" : "text-white/30"}`}
                    onClick={async () => {
                      await save({ data: { id: t.id, values: { ...t, favorite: !t.favorite } } as never });
                      await refresh();
                    }}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Toggle pin"
                    className={`rounded-lg p-1.5 ${t.pinned ? "text-sky-300" : "text-white/30"}`}
                    onClick={async () => {
                      await save({ data: { id: t.id, values: { ...t, pinned: !t.pinned } } as never });
                      await refresh();
                    }}
                  >
                    <Pin className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {t.notes ? <p className="mt-2 line-clamp-2 text-xs text-white/50">{t.notes}</p> : null}
              <p className="mt-2 text-[11px] text-white/35">
                {t.last_opened_at
                  ? `Last opened ${new Date(t.last_opened_at).toLocaleString()}`
                  : "Not opened yet"}
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <button className={btnPrimary} onClick={() => void open(t)}>
                <ExternalLink className="h-3.5 w-3.5" /> Launch
              </button>
              <button className={btn} onClick={() => setEditing({ ...emptyTool, ...t })}>
                Edit
              </button>
              <button
                className={`${btn} border-rose-400/30 text-rose-200`}
                onClick={async () => {
                  if (!confirm(`Remove ${t.name}?`)) return;
                  await remove({ data: { id: t.id } });
                  await refresh();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <Modal
          title={editing.id ? `Edit ${editing.name}` : "Add a custom tool"}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className={btn} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button
                className={btnPrimary}
                onClick={async () => {
                  if (!editing.name.trim() || !editing.url.trim())
                    return alert("Name and URL are required");
                  const { id, ...values } = editing;
                  await save({ data: { id: id ?? null, values } as never });
                  setEditing(null);
                  await refresh();
                }}
              >
                <Save className="h-3.5 w-3.5" /> Save tool
              </button>
            </>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input
                className={input}
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </Field>
            <Field label="URL">
              <input
                className={input}
                value={editing.url}
                onChange={(e) => setEditing({ ...editing, url: e.target.value })}
              />
            </Field>
            <Field label="Category">
              <input
                className={input}
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              />
            </Field>
            <Field label="Custom icon URL">
              <input
                className={input}
                value={editing.icon}
                onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              rows={3}
              className={input}
              value={editing.notes}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
            />
          </Field>
        </Modal>
      ) : null}
    </Panel>
  );
}

/* ============ Knowledge base ============ */

type KnowledgeRow = {
  id: string;
  title: string;
  kind: string;
  url: string;
  body: string;
  tags: string[];
  favorite: boolean;
  updated_at: string;
};

const KINDS = [
  "research",
  "article",
  "video",
  "documentation",
  "api",
  "design",
  "ui-idea",
  "startup-idea",
  "business-idea",
  "marketing-idea",
  "ai-prompt",
  "meeting",
  "note",
];

const emptyKnowledge = {
  title: "",
  kind: "note",
  url: "",
  body: "",
  tags: [] as string[],
  favorite: false,
};

export function KnowledgePanel() {
  const load = useServerFn(listKnowledge);
  const save = useServerFn(saveKnowledge);
  const remove = useServerFn(deleteKnowledge);
  const { rows, loading, error, refresh } = useRows<KnowledgeRow>(load as never);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [editing, setEditing] = useState<(typeof emptyKnowledge & { id?: string }) | null>(null);
  const [tagDraft, setTagDraft] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => (kind === "all" ? true : r.kind === kind))
      .filter((r) =>
        !q ? true : `${r.title} ${r.body} ${r.url} ${(r.tags ?? []).join(" ")}`.toLowerCase().includes(q),
      );
  }, [rows, query, kind]);

  return (
    <Panel
      title="Knowledge Base"
      subtitle="Research, articles, videos, docs, ideas, prompts and notes, all searchable."
      icon={BookOpen}
      action={
        <button className={btnPrimary} onClick={() => setEditing({ ...emptyKnowledge })}>
          <Plus className="h-3.5 w-3.5" /> New entry
        </button>
      }
    >
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            className={`${input} pl-9`}
            placeholder="Search everything you saved..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search knowledge base"
          />
        </div>
        <select className={input} value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Filter by type">
          <option value="all">All types</option>
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <Status loading={loading} error={error} />
      {!loading && !filtered.length ? <Empty label="Nothing saved here yet." /> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((k) => (
          <article key={k.id} className={card}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold">{k.title}</h3>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase text-white/60">
                {k.kind}
              </span>
            </div>
            {k.body ? <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs text-white/55">{k.body}</p> : null}
            {(k.tags ?? []).length ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {k.tags.map((t) => (
                  <span key={t} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">
                    #{t}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {k.url ? (
                <a className={btn} href={k.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> Open
                </a>
              ) : null}
              <button className={btn} onClick={() => setEditing({ ...emptyKnowledge, ...k, tags: k.tags ?? [] })}>
                Edit
              </button>
              <button
                className={`${btn} border-rose-400/30 text-rose-200`}
                onClick={async () => {
                  if (!confirm("Delete this entry?")) return;
                  await remove({ data: { id: k.id } });
                  await refresh();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <Modal
          title={editing.id ? "Edit entry" : "Save something new"}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className={btn} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button
                className={btnPrimary}
                onClick={async () => {
                  if (!editing.title.trim()) return alert("Title is required");
                  const { id, ...values } = editing;
                  await save({ data: { id: id ?? null, values } as never });
                  setEditing(null);
                  await refresh();
                }}
              >
                <Save className="h-3.5 w-3.5" /> Save
              </button>
            </>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title">
              <input
                className={input}
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </Field>
            <Field label="Type">
              <select
                className={input}
                value={editing.kind}
                onChange={(e) => setEditing({ ...editing, kind: e.target.value })}
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Link">
            <input
              className={input}
              value={editing.url}
              onChange={(e) => setEditing({ ...editing, url: e.target.value })}
            />
          </Field>
          <Field label="Content">
            <textarea
              rows={6}
              className={input}
              value={editing.body}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
            />
          </Field>
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-white/45">Tags</span>
            <div className="flex flex-wrap gap-1.5">
              {editing.tags.map((t) => (
                <button
                  key={t}
                  className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-white/60"
                  onClick={() => setEditing({ ...editing, tags: editing.tags.filter((x) => x !== t) })}
                >
                  #{t} <X className="inline h-3 w-3" />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className={input}
                placeholder="Add a tag"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagDraft.trim()) {
                    e.preventDefault();
                    setEditing({ ...editing, tags: [...editing.tags, tagDraft.trim()] });
                    setTagDraft("");
                  }
                }}
              />
            </div>
          </div>
        </Modal>
      ) : null}
    </Panel>
  );
}

/* ============ Visitors + analytics ============ */

type VisitRow = {
  id: string;
  session_id: string;
  path: string;
  referrer: string;
  device: string;
  browser: string;
  os: string;
  language: string;
  timezone: string;
  is_returning: boolean;
  created_at: string;
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={card}>
      <div className="text-[11px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function Breakdown({ title, data }: { title: string; data: [string, number][] }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  return (
    <div className={card}>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {!data.length ? <p className="text-xs text-white/40">No data yet.</p> : null}
      <div className="space-y-2">
        {data.slice(0, 8).map(([k, n]) => (
          <div key={k}>
            <div className="flex justify-between text-xs text-white/60">
              <span className="truncate">{k || "unknown"}</span>
              <span>{n}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500"
                style={{ width: `${(n / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function tally(rows: VisitRow[], key: keyof VisitRow): [string, number][] {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const k = String(r[key] ?? "");
    map.set(k, (map.get(k) ?? 0) + 1);
  });
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

export function VisitorsPanel() {
  const load = useServerFn(listVisits);
  const { rows, loading, error, refresh } = useRows<VisitRow>(load as never);
  const [query, setQuery] = useState("");

  const sessions = new Set(rows.map((r) => r.session_id)).size;
  const returning = new Set(rows.filter((r) => r.is_returning).map((r) => r.session_id)).size;
  const today = rows.filter(
    (r) => new Date(r.created_at).toDateString() === new Date().toDateString(),
  ).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows.slice(0, 200);
    return rows
      .filter((r) => `${r.path} ${r.browser} ${r.device} ${r.os} ${r.referrer}`.toLowerCase().includes(q))
      .slice(0, 200);
  }, [rows, query]);

  return (
    <Panel
      title="Visitor Analytics"
      subtitle="Every visitor that lands on your site, with device, browser, page and referrer breakdowns."
      icon={Activity}
      action={
        <button className={btn} onClick={() => void refresh()}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      }
    >
      <Status loading={loading} error={error} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Page views" value={rows.length} />
        <Stat label="Unique visitors" value={sessions} />
        <Stat label="Returning" value={returning} />
        <Stat label="Views today" value={today} />
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Breakdown title="Most visited pages" data={tally(rows, "path")} />
        <Breakdown title="Devices" data={tally(rows, "device")} />
        <Breakdown title="Browsers" data={tally(rows, "browser")} />
        <Breakdown title="Operating systems" data={tally(rows, "os")} />
        <Breakdown title="Regions (timezone)" data={tally(rows, "timezone")} />
        <Breakdown title="Referrers" data={tally(rows, "referrer")} />
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          className={`${input} pl-9`}
          placeholder="Search visits..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search visits"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Page</th>
              <th className="px-3 py-2">Device</th>
              <th className="px-3 py-2">Browser</th>
              <th className="px-3 py-2">Region</th>
              <th className="px-3 py-2">Type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-white/5 text-white/70">
                <td className="px-3 py-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">{r.path}</td>
                <td className="px-3 py-2">{r.device}</td>
                <td className="px-3 py-2">{r.browser}</td>
                <td className="px-3 py-2">{r.timezone}</td>
                <td className="px-3 py-2">{r.is_returning ? "Returning" : "New"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
