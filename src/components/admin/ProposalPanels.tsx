import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Download,
  Eraser,
  FileSignature,
  FileText,
  Loader2,
  PenLine,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { listRows, upsertRow, deleteRow } from "../../lib/business.functions";
import { downloadProposalPdf, downloadContractPdf } from "../../lib/pdf-exports";

type Row = Record<string, any>;

const shell =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur";
const input =
  "w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400";
const btn =
  "inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10";
const primary =
  "inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-sky-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-90";

const STATUSES = ["draft", "sent", "accepted", "declined", "expired"] as const;

function emptyProposal(): Row {
  return {
    id: null,
    client_name: "",
    client_email: "",
    title: "New project proposal",
    summary: "",
    scope: [],
    deliverables: "",
    timeline: "",
    price: 0,
    currency: "USD",
    status: "draft",
    valid_until: "",
    notes: "",
  };
}

function Labeled({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/50">{label}</span>
      {children}
    </label>
  );
}

/** Branded proposal generator: build, store, and export a client-ready PDF. */
export function ProposalsPanel() {
  const load = useServerFn(listRows);
  const save = useServerFn(upsertRow);
  const remove = useServerFn(deleteRow);

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = (await load({ data: { table: "proposals", orderBy: "created_at", limit: 300 } })) as {
        rows: Row[];
      };
      setRows(res.rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load proposals.");
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const totals = useMemo(() => {
    const accepted = rows.filter((r) => r.status === "accepted");
    const pipeline = rows
      .filter((r) => r.status === "sent")
      .reduce((s, r) => s + Number(r.price || 0), 0);
    const won = accepted.reduce((s, r) => s + Number(r.price || 0), 0);
    const sent = rows.filter((r) => r.status !== "draft").length;
    return [
      { label: "Proposals", value: String(rows.length) },
      { label: "Open pipeline", value: `$${pipeline.toLocaleString()}` },
      { label: "Won value", value: `$${won.toLocaleString()}` },
      { label: "Win rate", value: sent ? `${Math.round((accepted.length / sent) * 100)}%` : "0%" },
    ];
  }, [rows]);

  const set = (key: string, value: unknown) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  const persist = async () => {
    if (!draft) return;
    setBusy(true);
    setError("");
    try {
      const { id, ...values } = draft;
      await save({ data: { table: "proposals", id: id ?? null, values } });
      setDraft(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the proposal.");
    } finally {
      setBusy(false);
    }
  };

  const scopeText = (r: Row) => (Array.isArray(r.scope) ? r.scope.join("\n") : String(r.scope ?? ""));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Proposal generator</h2>
          <p className="mt-1 max-w-2xl text-xs text-white/50">
            Build a branded proposal, store it, and export a client-ready PDF with scope, timeline
            and investment already laid out.
          </p>
        </div>
        <div className="flex gap-2">
          <button className={btn} onClick={() => void refresh()}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button className={primary} onClick={() => setDraft(emptyProposal())}>
            <Plus className="h-3.5 w-3.5" /> New proposal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {totals.map((t) => (
          <div key={t.label} className={shell}>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">{t.label}</div>
            <div className="mt-1 text-lg font-semibold text-white">{t.value}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </div>
      )}

      {draft && (
        <div className={shell}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              {draft.id ? "Edit proposal" : "New proposal"}
            </h3>
            <button className={btn} onClick={() => setDraft(null)}>
              <X className="h-3.5 w-3.5" /> Close
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Proposal title">
              <input className={input} value={draft.title} onChange={(e) => set("title", e.target.value)} />
            </Labeled>
            <Labeled label="Status">
              <select className={input} value={draft.status} onChange={(e) => set("status", e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-black">
                    {s}
                  </option>
                ))}
              </select>
            </Labeled>
            <Labeled label="Client name">
              <input
                className={input}
                value={draft.client_name}
                onChange={(e) => set("client_name", e.target.value)}
              />
            </Labeled>
            <Labeled label="Client email">
              <input
                className={input}
                value={draft.client_email}
                onChange={(e) => set("client_email", e.target.value)}
              />
            </Labeled>
            <Labeled label="Executive summary" full>
              <textarea
                rows={3}
                className={input}
                value={draft.summary}
                onChange={(e) => set("summary", e.target.value)}
              />
            </Labeled>
            <Labeled label="Scope of work (one item per line)" full>
              <textarea
                rows={4}
                className={input}
                value={scopeText(draft)}
                onChange={(e) => set("scope", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 50))}
              />
            </Labeled>
            <Labeled label="Deliverables (one per line)" full>
              <textarea
                rows={3}
                className={input}
                value={draft.deliverables}
                onChange={(e) => set("deliverables", e.target.value)}
              />
            </Labeled>
            <Labeled label="Timeline">
              <input className={input} value={draft.timeline} onChange={(e) => set("timeline", e.target.value)} />
            </Labeled>
            <Labeled label="Valid until">
              <input
                type="date"
                className={input}
                value={draft.valid_until ?? ""}
                onChange={(e) => set("valid_until", e.target.value)}
              />
            </Labeled>
            <Labeled label="Price">
              <input
                type="number"
                className={input}
                value={draft.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </Labeled>
            <Labeled label="Currency">
              <input
                className={input}
                value={draft.currency}
                onChange={(e) => set("currency", e.target.value.toUpperCase().slice(0, 4))}
              />
            </Labeled>
            <Labeled label="Internal notes" full>
              <textarea
                rows={2}
                className={input}
                value={draft.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Labeled>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className={primary} disabled={busy} onClick={() => void persist()}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
            </button>
            <button
              className={btn}
              onClick={() =>
                void downloadProposalPdf({
                  client_name: draft.client_name,
                  client_email: draft.client_email,
                  title: draft.title,
                  summary: draft.summary,
                  scope: Array.isArray(draft.scope) ? draft.scope : [],
                  deliverables: draft.deliverables,
                  timeline: draft.timeline,
                  price: Number(draft.price || 0),
                  currency: draft.currency,
                  valid_until: draft.valid_until,
                  notes: draft.notes,
                })
              }
            >
              <Download className="h-3.5 w-3.5" /> Preview PDF
            </button>
          </div>
        </div>
      )}

      <div className={`${shell} overflow-x-auto`}>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading proposals...
          </div>
        ) : rows.length === 0 ? (
          <p className="text-xs text-white/50">No proposals yet. Create the first one above.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              <tr>
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Value</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/10">
                  <td className="py-2.5 pr-3">{r.title}</td>
                  <td className="py-2.5 pr-3">{r.client_name || "-"}</td>
                  <td className="py-2.5 pr-3">
                    {r.currency} {Number(r.price || 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-3 capitalize">{r.status}</td>
                  <td className="py-2.5 pr-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        className={btn}
                        onClick={() =>
                          setDraft({ ...r, valid_until: r.valid_until ?? "", scope: r.scope ?? [] })
                        }
                      >
                        <PenLine className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        className={btn}
                        onClick={() =>
                          void downloadProposalPdf({
                            client_name: r.client_name,
                            client_email: r.client_email,
                            title: r.title,
                            summary: r.summary,
                            scope: Array.isArray(r.scope) ? r.scope : [],
                            deliverables: r.deliverables,
                            timeline: r.timeline,
                            price: Number(r.price || 0),
                            currency: r.currency,
                            valid_until: r.valid_until,
                            notes: r.notes,
                          })
                        }
                      >
                        <FileText className="h-3.5 w-3.5" /> PDF
                      </button>
                      <button
                        className={btn}
                        onClick={async () => {
                          if (!confirm("Delete this proposal?")) return;
                          await remove({ data: { table: "proposals", id: r.id } });
                          await refresh();
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/** Draw-to-sign pad used by the contract signing panel. */
function SignaturePad({ onChange }: { onChange: (dataUrl: string) => void }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = ref.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = ref.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <canvas
        ref={ref}
        width={560}
        height={180}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="w-full touch-none rounded-lg border border-white/20 bg-white"
      />
      <button className={`${btn} mt-2`} onClick={clear}>
        <Eraser className="h-3.5 w-3.5" /> Clear signature
      </button>
    </div>
  );
}

/** Contract creation, e-signature capture, and signed-PDF export. */
export function ContractSigningPanel() {
  const load = useServerFn(listRows);
  const save = useServerFn(upsertRow);

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState<Row | null>(null);
  const [signer, setSigner] = useState({ name: "", email: "" });
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = (await load({ data: { table: "contracts", orderBy: "created_at", limit: 300 } })) as {
        rows: Row[];
      };
      setRows(res.rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load contracts.");
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const sign = async () => {
    if (!active) return;
    if (!signer.name.trim() || !signature) {
      setError("Add the signer name and draw a signature before signing.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await save({
        data: {
          table: "contracts",
          id: active.id,
          values: {
            signer_name: signer.name.trim(),
            signer_email: signer.email.trim(),
            signature_data: signature,
            signed_at: new Date().toISOString(),
            status: "signed",
          },
        },
      });
      setActive(null);
      setSignature("");
      setSigner({ name: "", email: "" });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not store the signature.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Contracts and e-signature</h2>
          <p className="mt-1 max-w-2xl text-xs text-white/50">
            Sign a contract in the browser, store the signature with the record, and export the
            signed PDF. Create the contract itself under Contracts and invoices.
          </p>
        </div>
        <button className={btn} onClick={() => void refresh()}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </div>
      )}

      {active && (
        <div className={shell}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Sign: {active.title}</h3>
            <button className={btn} onClick={() => setActive(null)}>
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Signer name">
              <input
                className={input}
                value={signer.name}
                onChange={(e) => setSigner((s) => ({ ...s, name: e.target.value }))}
              />
            </Labeled>
            <Labeled label="Signer email">
              <input
                className={input}
                value={signer.email}
                onChange={(e) => setSigner((s) => ({ ...s, email: e.target.value }))}
              />
            </Labeled>
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/50">
                Signature
              </span>
              <SignaturePad onChange={setSignature} />
            </div>
          </div>
          <button className={`${primary} mt-4`} disabled={busy} onClick={() => void sign()}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSignature className="h-3.5 w-3.5" />}{" "}
            Store signature
          </button>
        </div>
      )}

      <div className={`${shell} overflow-x-auto`}>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading contracts...
          </div>
        ) : rows.length === 0 ? (
          <p className="text-xs text-white/50">
            No contracts yet. Add one under Contracts and invoices, then sign it here.
          </p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              <tr>
                <th className="py-2 pr-3">Contract</th>
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Value</th>
                <th className="py-2 pr-3">Signed</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/10">
                  <td className="py-2.5 pr-3">{r.title}</td>
                  <td className="py-2.5 pr-3">{r.client_name || "-"}</td>
                  <td className="py-2.5 pr-3">${Number(r.value || 0).toLocaleString()}</td>
                  <td className="py-2.5 pr-3">
                    {r.signed_at ? `${r.signer_name} · ${new Date(r.signed_at).toLocaleDateString()}` : "Unsigned"}
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        className={btn}
                        onClick={() => {
                          setActive(r);
                          setSigner({ name: r.signer_name || r.client_name || "", email: r.signer_email || "" });
                          setSignature("");
                        }}
                      >
                        <FileSignature className="h-3.5 w-3.5" /> Sign
                      </button>
                      <button
                        className={btn}
                        onClick={() =>
                          void downloadContractPdf({
                            title: r.title,
                            client_name: r.client_name,
                            value: Number(r.value || 0),
                            starts_on: r.starts_on,
                            ends_on: r.ends_on,
                            terms: r.terms,
                            signer_name: r.signer_name,
                            signer_email: r.signer_email,
                            signature_data: r.signature_data,
                            signed_at: r.signed_at,
                          })
                        }
                      >
                        <Download className="h-3.5 w-3.5" /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}