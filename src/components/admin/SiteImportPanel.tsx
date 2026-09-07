import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ExternalLink, FolderUp, Github, Globe, Loader2, Rocket, Star, Trash2, Upload,
} from "lucide-react";
import { deleteSiteBuild, importSite, listSiteBuilds, updateSiteBuild } from "../../lib/site-builder.functions";

type Row = Record<string, any>;
type Kind = "link" | "github" | "zip" | "lovable" | "upload";

const KINDS: { key: Kind; label: string; hint: string; icon: typeof Globe }[] = [
  { key: "link", label: "Website link", hint: "https://example.com", icon: Globe },
  { key: "github", label: "GitHub repo", hint: "https://github.com/user/repo", icon: Github },
  { key: "lovable", label: "Lovable project", hint: "https://your-app.lovable.app", icon: Rocket },
  { key: "zip", label: "Zip folder", hint: "Pick a .zip that contains index.html", icon: FolderUp },
  { key: "upload", label: "HTML file", hint: "Pick an .html file from your computer", icon: Upload },
];

/** Read the first HTML document out of a zip, using the browser only. */
async function htmlFromZip(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(buf.buffer);
  const dec = new TextDecoder();
  let best: { name: string; offset: number } | null = null;

  for (let i = 0; i < buf.length - 3; i += 1) {
    if (view.getUint32(i, true) !== 0x02014b50) continue; // central directory entry
    const nameLen = view.getUint16(i + 28, true);
    const extraLen = view.getUint16(i + 30, true);
    const commentLen = view.getUint16(i + 32, true);
    const offset = view.getUint32(i + 42, true);
    const name = dec.decode(buf.subarray(i + 46, i + 46 + nameLen));
    if (/\.html?$/i.test(name) && (!best || /index\.html?$/i.test(name))) best = { name, offset };
    i += 45 + nameLen + extraLen + commentLen;
  }
  if (!best) throw new Error("No HTML file found inside that zip.");

  const o = best.offset;
  if (view.getUint32(o, true) !== 0x04034b50) throw new Error("That zip could not be read.");
  const method = view.getUint16(o + 8, true);
  let size = view.getUint32(o + 18, true);
  const nameLen = view.getUint16(o + 26, true);
  const extraLen = view.getUint16(o + 28, true);
  const start = o + 30 + nameLen + extraLen;
  if (!size) size = buf.length - start;
  const body = buf.subarray(start, start + size);
  if (method === 0) return dec.decode(body);
  if (method !== 8) throw new Error("That zip uses an unsupported compression method.");
  const stream = new Blob([body]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return dec.decode(new Uint8Array(await new Response(stream).arrayBuffer()));
}

/** Bring existing sites, repos, zips and other Lovable projects into the portfolio. */
export function SiteImportPanel() {
  const run = useServerFn(importSite);
  const load = useServerFn(listSiteBuilds);
  const patch = useServerFn(updateSiteBuild);
  const remove = useServerFn(deleteSiteBuild);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [kind, setKind] = useState<Kind>("link");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await load({});
      setRows((res.builds ?? []) as Row[]);
    } catch {
      /* ignore */
    }
  }, [load]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submit = async (html = "") => {
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      const res = await run({ data: { kind, url, name, summary, html, publish: true, featured: true } });
      setMsg(`Added "${String((res.build as Row).name)}". It now shows in the portfolio showcase.`);
      setUrl("");
      setName("");
      setSummary("");
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  };

  const pickFile = async (file: File) => {
    setErr("");
    try {
      const html = /\.zip$/i.test(file.name) ? await htmlFromZip(file) : await file.text();
      if (!name.trim()) setName(file.name.replace(/\.(zip|html?)$/i, ""));
      await submit(html);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That file could not be read.");
    }
  };

  const field =
    "min-h-[44px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-sky-400";
  const label = "mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45";
  const active = KINDS.find((k) => k.key === kind)!;

  return (
    <div className="space-y-5">
      <header className="min-w-0">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FolderUp className="h-4 w-4 text-sky-300" /> Import and showcase sites
        </h2>
        <p className="mt-1 max-w-2xl text-xs text-white/55">
          Add any site you already have: a live link, a GitHub repository, a zip folder, an HTML
          file, or another Lovable project. Each import gets a preview page and can be featured in
          the public showcase.
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.key}
              onClick={() => setKind(k.key)}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3 text-xs ${
                kind === k.key
                  ? "border-sky-400/50 bg-sky-400/15 text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              <k.icon className="h-3.5 w-3.5" /> {k.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {kind === "zip" || kind === "upload" ? (
            <div className="sm:col-span-2">
              <span className={label}>{active.hint}</span>
              <input
                ref={fileRef}
                type="file"
                accept={kind === "zip" ? ".zip" : ".html,.htm"}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void pickFile(f);
                }}
                className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2.5 text-sm file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white"
              />
            </div>
          ) : (
            <label className="block sm:col-span-2">
              <span className={label}>{active.label} URL</span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={active.hint}
                className={field}
              />
            </label>
          )}
          <label className="block">
            <span className={label}>Display name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" className={field} />
          </label>
          <label className="block">
            <span className={label}>Short summary</span>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What this build proves"
              className={field}
            />
          </label>
        </div>

        {err ? (
          <p className="mt-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs text-red-200">{err}</p>
        ) : null}
        {msg ? (
          <p className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-200">
            {msg}
          </p>
        ) : null}

        {kind !== "zip" && kind !== "upload" ? (
          <button
            disabled={busy || url.trim().length < 8}
            onClick={() => void submit()}
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-fuchsia-500 px-5 text-sm font-semibold disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderUp className="h-4 w-4" />}
            Import and feature it
          </button>
        ) : null}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-sm font-semibold">Showcase library</h3>
        <ul className="mt-3 space-y-2">
          {rows.map((r) => (
            <li
              key={String(r.id)}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm">{String(r.name)}</div>
                <div className="truncate text-[11px] text-white/45">
                  {String(r.source_kind ?? "prompt")} · /site/{String(r.slug)} ·{" "}
                  {r.published ? "published" : "draft"} · {r.featured ? "featured" : "not featured"}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() =>
                    void (async () => {
                      await patch({ data: { id: String(r.id), featured: !r.featured, published: true } });
                      await refresh();
                    })()
                  }
                  className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border px-3 text-xs ${
                    r.featured
                      ? "border-amber-300/40 bg-amber-300/15 text-amber-100"
                      : "border-white/15 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <Star className="h-3.5 w-3.5" /> {r.featured ? "Featured" : "Feature"}
                </button>
                <a
                  href={r.html ? `/site/${String(r.slug)}` : String(r.source_url ?? "#")}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-[34px] w-[34px] place-items-center rounded-lg border border-white/15 bg-white/5 hover:bg-white/10"
                  aria-label="Open preview"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() =>
                    void (async () => {
                      if (!window.confirm("Remove this entry?")) return;
                      await remove({ data: { id: String(r.id) } });
                      await refresh();
                    })()
                  }
                  aria-label="Delete entry"
                  className="grid h-[34px] w-[34px] place-items-center rounded-lg border border-red-400/25 bg-red-400/10 text-red-200 hover:bg-red-400/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
          {!rows.length ? (
            <li className="rounded-xl border border-white/10 bg-black/20 px-4 py-6 text-center text-xs text-white/45">
              Nothing imported yet.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
