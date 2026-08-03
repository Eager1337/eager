import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { listRows, upsertRow, deleteRow, type BusinessTable } from "../../lib/business.functions";

export type FieldKind = "text" | "textarea" | "number" | "date" | "datetime" | "select" | "bool" | "tags";

export type FieldDef = {
  key: string;
  label: string;
  kind?: FieldKind;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  full?: boolean;
};

type Row = Record<string, any>;

/** Reusable dark-UI CRUD manager used by every business admin section. */
export function RecordManager({
  table,
  title,
  description,
  fields,
  columns,
  orderBy = "created_at",
  summary,
}: {
  table: BusinessTable;
  title: string;
  description: string;
  fields: FieldDef[];
  columns: { key: string; label: string; format?: (row: Row) => string }[];
  orderBy?: string;
  summary?: (rows: Row[]) => { label: string; value: string }[];
}) {
  const load = useServerFn(listRows);
  const save = useServerFn(upsertRow);
  const remove = useServerFn(deleteRow);

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = (await load({ data: { table, orderBy, limit: 300 } })) as { rows: Row[] };
      setRows(res.rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load records.");
    } finally {
      setLoading(false);
    }
  }, [load, table, orderBy]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, query]);

  const blank = useMemo(() => {
    const o: Row = { id: null };
    for (const f of fields) o[f.key] = f.kind === "bool" ? false : f.kind === "number" ? 0 : "";
    return o;
  }, [fields]);

  const submit = async () => {
    if (!editing) return;
    setBusy(true);
    setError("");
    try {
      const values: Row = {};
      for (const f of fields) {
        let v = editing[f.key];
        if (f.kind === "number") v = Number(v || 0);
        if (f.kind === "tags")
          v = typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : v ?? [];
        values[f.key] = v ?? "";
      }
      await save({ data: { table, id: editing.id ?? null, values } });
      setEditing(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: string) => {
    if (!window.confirm("Delete this record permanently?")) return;
    try {
      await remove({ data: { table, id } });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete.");
    }
  };

  const cards = summary?.(rows) ?? [];

  return (
    <div className="min-w-0 space-y-4">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold sm:text-xl">{title}</h2>
          <p className="mt-1 text-xs text-white/50">{description}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => void refresh()}
            aria-label="Refresh"
            className="grid h-[38px] w-[38px] place-items-center rounded-lg border border-white/15 bg-white/5 hover:bg-white/10"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setEditing({ ...blank })}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-black hover:bg-white/90"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>
      </header>

      {cards.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="truncate text-[10px] uppercase tracking-[0.2em] text-white/45">{c.label}</div>
              <div className="mt-1.5 truncate text-lg font-semibold">{c.value}</div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}`}
          className="min-h-[40px] w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-xs outline-none focus:border-fuchsia-400/60"
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs text-red-200">{error}</p>
      ) : null}

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="text-white/45">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="whitespace-nowrap border-b border-white/10 pb-2 pr-4 font-medium">
                  {c.label}
                </th>
              ))}
              <th className="border-b border-white/10 pb-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-white/5">
                {columns.map((c) => (
                  <td key={c.key} className="max-w-[240px] truncate py-2.5 pr-4">
                    {c.format ? c.format(r) : String(r[c.key] ?? "")}
                  </td>
                ))}
                <td className="py-2.5 text-right">
                  <div className="inline-flex gap-1.5">
                    <button
                      onClick={() =>
                        setEditing({
                          ...r,
                          ...Object.fromEntries(
                            fields
                              .filter((f) => f.kind === "tags")
                              .map((f) => [f.key, Array.isArray(r[f.key]) ? r[f.key].join(", ") : r[f.key] ?? ""]),
                          ),
                        })
                      }
                      aria-label="Edit record"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => void del(r.id)}
                      aria-label="Delete record"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-red-400/20 bg-red-400/10 text-red-200 hover:bg-red-400/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && !loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-6 text-center text-white/40">
                  Nothing here yet. Use New to add the first record.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${editing.id ? "Edit" : "New"} ${title}`}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b0b14] p-5 sm:rounded-3xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base font-semibold">
                {editing.id ? "Edit" : "New"} {title.replace(/s$/, "")}
              </h3>
              <button
                onClick={() => setEditing(null)}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {fields.map((f) => (
                <label key={f.key} className={`min-w-0 text-xs ${f.full ? "sm:col-span-2" : ""}`}>
                  <span className="text-white/50">{f.label}</span>
                  {f.kind === "textarea" ? (
                    <textarea
                      value={editing[f.key] ?? ""}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                      rows={4}
                      placeholder={f.placeholder}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-fuchsia-400/60"
                    />
                  ) : f.kind === "select" ? (
                    <select
                      value={editing[f.key] ?? ""}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                      className="mt-1.5 min-h-[42px] w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm outline-none focus:border-fuchsia-400/60"
                    >
                      <option value="">Select</option>
                      {(f.options ?? []).map((o) => (
                        <option key={o} value={o} className="bg-[#0b0b14]">
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : f.kind === "bool" ? (
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, [f.key]: !editing[f.key] })}
                      className={`mt-1.5 inline-flex min-h-[42px] w-full items-center justify-between rounded-lg border px-3 text-sm ${editing[f.key] ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" : "border-white/10 bg-white/5 text-white/60"}`}
                    >
                      {editing[f.key] ? "Yes" : "No"}
                      <span className="text-[10px] uppercase tracking-widest">toggle</span>
                    </button>
                  ) : (
                    <input
                      type={
                        f.kind === "number"
                          ? "number"
                          : f.kind === "date"
                            ? "date"
                            : f.kind === "datetime"
                              ? "datetime-local"
                              : "text"
                      }
                      value={
                        f.kind === "datetime" && editing[f.key]
                          ? String(editing[f.key]).slice(0, 16)
                          : f.kind === "date" && editing[f.key]
                            ? String(editing[f.key]).slice(0, 10)
                            : editing[f.key] ?? ""
                      }
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="mt-1.5 min-h-[42px] w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm outline-none focus:border-fuchsia-400/60"
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setEditing(null)}
                className="min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-5 text-sm hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => void submit()}
                disabled={busy}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
