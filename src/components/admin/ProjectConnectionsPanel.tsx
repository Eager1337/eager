import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, FileUp, Github, Link2, Loader2, Pencil, Plus, RefreshCw, Rocket, Save, Trash2, Upload, X } from "lucide-react";
import {
  deleteAdminProjectFile,
  deleteAdminProjectSource,
  listAdminProjectSources,
  saveAdminProjectSource,
  uploadAdminProjectFile,
} from "../../lib/admin-projects.functions";

type Provider = "github" | "lovable" | "replit" | "base44" | "vercel" | "link" | "other";
type Row = Record<string, any>;

const PROVIDERS: { key: Provider; label: string }[] = [
  { key: "github", label: "GitHub" },
  { key: "lovable", label: "Lovable" },
  { key: "replit", label: "Replit" },
  { key: "base44", label: "Base44" },
  { key: "vercel", label: "Vercel" },
  { key: "link", label: "Website" },
  { key: "other", label: "Other" },
];

function providerIcon(provider: Provider) {
  if (provider === "github") return <Github className="h-4 w-4" />;
  if (provider === "lovable" || provider === "replit" || provider === "base44" || provider === "vercel") return <Rocket className="h-4 w-4" />;
  return <Link2 className="h-4 w-4" />;
}

/** Shared project library for AI Builder and AI Workspace. */
export function ProjectConnectionsPanel({ compact = false }: { compact?: boolean }) {
  const load = useServerFn(listAdminProjectSources);
  const save = useServerFn(saveAdminProjectSource);
  const remove = useServerFn(deleteAdminProjectSource);
  const upload = useServerFn(uploadAdminProjectFile);
  const removeFile = useServerFn(deleteAdminProjectFile);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<Provider>("link");
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await load({});
      setRows((res.sources ?? []) as Row[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load project connections.");
    }
  }, [load]);

  useEffect(() => { void refresh(); }, [refresh]);

  const reset = () => {
    setEditing(null);
    setName("");
    setProvider("link");
    setUrl("");
    setPreview("");
    setDescription("");
  };

  const edit = (row: Row) => {
    setEditing(row);
    setName(String(row.name ?? ""));
    setProvider((row.provider ?? "link") as Provider);
    setUrl(String(row.source_url ?? ""));
    setPreview(String(row.preview_url ?? ""));
    setDescription(String(row.description ?? ""));
  };

  const submit = async () => {
    if (!name.trim()) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await save({ data: { id: editing?.id, name: name.trim(), provider, sourceUrl: url.trim(), previewUrl: preview.trim(), description: description.trim() } });
      setMessage(editing ? "Project connection updated." : "Project connected to the admin library.");
      reset();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the project.");
    } finally { setBusy(false); }
  };

  const uploadFile = async (file: File) => {
    setBusy(true); setError(""); setMessage("");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read that file."));
        reader.readAsDataURL(file);
      });
      await upload({ data: { sourceId: editing?.id, fileName: file.name, contentType: file.type || "application/octet-stream", dataUrl } });
      setMessage(`${file.name} uploaded to the project library.`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "File upload failed.");
    } finally { setBusy(false); }
  };

  const field = "min-h-[42px] w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none focus:border-fuchsia-400";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Link2 className="h-4 w-4 text-sky-300" /> Project Library & Connections</h2>
          <p className="mt-1 max-w-3xl text-xs text-white/45">Connect websites and projects from GitHub, Lovable, Replit, Base44, Vercel or any URL, then keep files and preview links together for your portfolio.</p>
        </div>
        <button onClick={() => void refresh()} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5" aria-label="Refresh project library"><RefreshCw className="h-3.5 w-3.5" /></button>
      </div>

      {!compact || editing ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label><span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-white/40">Project name</span><input value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="KK Drinks website" /></label>
            <label><span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-white/40">Provider</span><select value={provider} onChange={(e) => setProvider(e.target.value as Provider)} className={field}>{PROVIDERS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</select></label>
            <label className="sm:col-span-2"><span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-white/40">Project / repository / live URL</span><input value={url} onChange={(e) => setUrl(e.target.value)} className={field} placeholder="https://github.com/... or https://my-project.lovable.app" /></label>
            <label><span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-white/40">Preview URL</span><input value={preview} onChange={(e) => setPreview(e.target.value)} className={field} placeholder="Optional live preview" /></label>
            <label><span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-white/40">Description</span><input value={description} onChange={(e) => setDescription(e.target.value)} className={field} placeholder="What this project proves" /></label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button disabled={busy || !name.trim()} onClick={() => void submit()} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-xs font-semibold text-black disabled:opacity-40">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} {editing ? "Update connection" : "Connect project"}</button>
            {editing ? <button onClick={reset} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-white/10 px-4 text-xs"><X className="h-3.5 w-3.5" /> Cancel</button> : null}
            <input ref={fileRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadFile(f); e.currentTarget.value = ""; }} />
            <button disabled={busy || !editing} onClick={() => fileRef.current?.click()} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-sky-400/25 bg-sky-400/10 px-4 text-xs text-sky-100 disabled:opacity-40"><Upload className="h-3.5 w-3.5" /> Upload any file</button>
            {!editing ? <span className="inline-flex min-h-10 items-center px-2 text-[11px] text-white/35">Save a project first to attach files.</span> : null}
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing({})} className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-xs font-semibold text-black"><Plus className="h-3.5 w-3.5" /> Connect a project</button>
      )}

      {error ? <div className="mt-3 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-xs text-red-200">{error}</div> : null}
      {message ? <div className="mt-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">{message}</div> : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <article key={row.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-sky-300">{providerIcon(row.provider as Provider)}</span><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{row.name}</h3><p className="text-[10px] uppercase tracking-widest text-white/30">{row.provider}</p></div></div>
              <div className="flex gap-1"><button onClick={() => edit(row)} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5" aria-label="Edit project"><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => void (async () => { if (!window.confirm("Remove this project connection?")) return; await remove({ data: { id: row.id } }); await refresh(); })()} className="grid h-8 w-8 place-items-center rounded-lg border border-red-400/20 bg-red-400/10 text-red-200" aria-label="Remove project"><Trash2 className="h-3.5 w-3.5" /></button></div>
            </div>
            {row.description ? <p className="mt-3 text-xs text-white/45">{row.description}</p> : null}
            {row.source_url ? <a href={row.source_url} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-1 truncate text-xs text-sky-300 hover:text-white"><ExternalLink className="h-3 w-3 shrink-0" /> {row.source_url}</a> : null}
            {row.preview_url ? <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white"><iframe title={`${row.name} preview`} src={row.preview_url} className="h-48 w-full" loading="lazy" /></div> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {(row.files ?? []).map((file: Row) => <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] hover:bg-white/10"><FileUp className="h-3 w-3" /> {file.file_name}</a>)}
            </div>
          </article>
        ))}
        {!rows.length ? <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-white/35 md:col-span-2">No connected projects yet. Add your first GitHub, Lovable, Replit, Base44, Vercel or website project above.</div> : null}
      </div>
    </section>
  );
}
