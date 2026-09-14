import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, ExternalLink, Loader2, RefreshCw, Save, Sparkles, Trash2, Wand2, Globe2 } from "lucide-react";
import { ImageUploadField } from "./ImageUploadField";
import { ProjectConnectionsPanel } from "./ProjectConnectionsPanel";
import { buildSiteFromPrompt, deleteSiteBuild, listSiteBuilds, updateSiteBuild } from "../../lib/site-builder.functions";

type Row = Record<string, any>;

const IDEAS = [
  "A premium dental clinic site with online booking, team bios and insurance FAQs",
  "A Sierra Leone logistics company site with tracking, fleet stats and quote request form",
  "A fintech landing page with pricing, security section and investor metrics",
  "A restaurant site with menu, reservations, gallery and opening hours",
];

function escapeAttr(value: string) { return value.replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function decorateHtml(html: string, name: string, logo: string, welcome: string) {
  let output = html.trim();
  if (!/<html[\s>]/i.test(output)) return output;
  const safeName = escapeAttr(name || "Eager Beaver");
  const safeWelcome = escapeAttr(welcome || `Welcome to ${name || "our website"}`);
  const logoMarkup = logo ? `<img src="${escapeAttr(logo)}" alt="${safeName} logo" style="width:52px;height:52px;object-fit:contain;border-radius:14px;background:rgba(255,255,255,.08);padding:7px;margin:0 auto 14px;display:block">` : "";
  const overlay = `<div id="eager-welcome-overlay" style="position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(4,4,10,.78);backdrop-filter:blur(14px);padding:24px;font-family:Inter,system-ui,sans-serif"><div style="width:min(440px,100%);border:1px solid rgba(255,255,255,.16);border-radius:28px;padding:30px;text-align:center;color:white;background:rgba(18,18,28,.94);box-shadow:0 30px 100px rgba(0,0,0,.45)">${logoMarkup}<div style="font-size:10px;letter-spacing:.24em;text-transform:uppercase;opacity:.55">Welcome</div><h1 style="font-size:28px;line-height:1.1;margin:8px 0 10px">${safeName}</h1><p style="font-size:14px;line-height:1.6;opacity:.68;margin:0">${safeWelcome}</p><button onclick="document.getElementById('eager-welcome-overlay')?.remove();try{sessionStorage.setItem('eager-welcome-seen','1')}catch(e){}" style="margin-top:22px;border:0;border-radius:13px;padding:11px 20px;font-weight:700;background:white;color:#08080c;cursor:pointer">Enter website</button></div></div><script>try{if(sessionStorage.getItem('eager-welcome-seen')==='1'){document.getElementById('eager-welcome-overlay')?.remove()}}catch(e){}</script>`;
  if (!output.includes("eager-welcome-overlay")) output = output.replace(/<body([^>]*)>/i, `<body$1>${overlay}`);
  if (logo && !/<link[^>]+rel=["']icon/i.test(output)) output = output.replace(/<head([^>]*)>/i, `<head$1><link rel="icon" href="${escapeAttr(logo)}">`);
  return output;
}

export function SiteBuilderPanel() {
  const build = useServerFn(buildSiteFromPrompt);
  const load = useServerFn(listSiteBuilds);
  const patch = useServerFn(updateSiteBuild);
  const remove = useServerFn(deleteSiteBuild);
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [style, setStyle] = useState("");
  const [pages, setPages] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [builds, setBuilds] = useState<Row[]>([]);
  const [active, setActive] = useState<Row | null>(null);
  const [welcome, setWelcome] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try { const res = await load({ kind: "site" }); setBuilds(res.builds as Row[]); setErr(""); }
    catch (e) { setErr(e instanceof Error ? e.message : "Could not load builds."); }
    finally { setLoading(false); }
  }, [load]);
  useEffect(() => { void refresh(); }, [refresh]);

  const openBuild = (row: Row) => { setActive(row); setWelcome(String(row.welcome_message ?? `Welcome to ${row.name ?? "our website"}`)); };

  const generate = async () => {
    setBusy(true); setErr("");
    try {
      const res = await build({ data: { prompt, name, style, pages } });
      const row = res.build as Row;
      row.html = decorateHtml(String(row.html ?? ""), String(row.name ?? name), "", `Welcome to ${String(row.name ?? name)}. We are glad you are here.`);
      setActive(row); setWelcome(`Welcome to ${String(row.name ?? name)}. We are glad you are here.`); await refresh();
    } catch (e) { setErr(e instanceof Error ? e.message : "Generation failed."); }
    finally { setBusy(false); }
  };

  const saveActive = async (publish?: boolean) => {
    if (!active) return;
    setSaving(true); setSaveErr("");
    try {
      const decorated = decorateHtml(String(active.html ?? ""), String(active.name ?? ""), String(active.logo_url ?? ""), welcome);
      const res = await patch({ data: { id: String(active.id), name: String(active.name ?? ""), slug: String(active.slug ?? ""), summary: String(active.summary ?? ""), logo_url: String(active.logo_url ?? ""), html: decorated, published: publish === undefined ? Boolean(active.published) : publish } });
      setActive((prev) => prev ? { ...prev, html: decorated, slug: res?.slug ?? prev.slug, published: publish === undefined ? prev.published : publish } : prev); await refresh();
    } catch (e) { setSaveErr(e instanceof Error ? e.message : "Could not save the changes."); }
    finally { setSaving(false); }
  };

  const download = (row: Row) => { const blob = new Blob([String(row.html ?? "")], { type: "text/html" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${row.slug ?? "site"}.html`; a.click(); URL.revokeObjectURL(url); };

  return (
    <div className="space-y-5">
      <header><h2 className="flex items-center gap-2 text-lg font-semibold"><Wand2 className="h-4 w-4 text-fuchsia-300" /> AI Website Builder</h2><p className="mt-1 max-w-3xl text-xs text-white/55">Build, edit, preview, brand, publish and revisit every AI website as a real portfolio project.</p></header>
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">What should it build?</span><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} placeholder="A modern business website for a Freetown company..." className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-fuchsia-400" /></label>
          <label><span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">Project name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Hammakay" className="min-h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-fuchsia-400" /></label>
          <label><span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">Visual direction</span><input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Premium, modern, local brand" className="min-h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-fuchsia-400" /></label>
          <label className="sm:col-span-2"><span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">Required pages / sections</span><input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="Home, services, products, about, contact, booking" className="min-h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-fuchsia-400" /></label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">{IDEAS.map((idea) => <button key={idea} onClick={() => setPrompt(idea)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/55 hover:bg-white/10">{idea.slice(0, 48)}</button>)}</div>
        {err ? <p className="mt-3 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-xs text-red-200">{err}</p> : null}
        <button disabled={busy || prompt.trim().length < 8} onClick={() => void generate()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-sky-500 px-5 text-sm font-semibold disabled:opacity-40">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{busy ? "Building..." : "Build website"}</button>
      </section>
      {active ? (
        <section className="rounded-2xl border border-fuchsia-400/20 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-base font-semibold">Editing project: {String(active.name)}</h3><p className="mt-1 text-xs text-white/45">Changes are saved to the project and can be reopened anytime.</p></div><span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/45"><Globe2 className="h-3 w-3" /> {active.published ? "Published" : "Draft"}</span></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label><span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-white/45">Website name</span><input value={String(active.name ?? "")} onChange={(e) => setActive({ ...active, name: e.target.value })} className="min-h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-fuchsia-400" /></label>
            <label><span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-white/45">Short published name</span><input value={String(active.slug ?? "")} onChange={(e) => setActive({ ...active, slug: e.target.value })} className="min-h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-fuchsia-400" /><span className="mt-1 block text-[10px] text-white/35">Target: {String(active.slug || "site")}.eager.app</span></label>
            <label className="sm:col-span-2"><span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-white/45">Welcome message</span><input value={welcome} onChange={(e) => setWelcome(e.target.value)} placeholder="Welcome to our website" className="min-h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-fuchsia-400" /></label>
            <div className="sm:col-span-2"><ImageUploadField label="Website logo" keyHint={`logo-${String(active.slug ?? "site")}`} value={String(active.logo_url ?? "")} onChange={(url) => setActive({ ...active, logo_url: url })} /></div>
            <label className="sm:col-span-2"><span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-white/45">Edit website code</span><textarea value={String(active.html ?? "")} onChange={(e) => setActive({ ...active, html: e.target.value })} rows={12} spellCheck={false} className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] outline-none focus:border-fuchsia-400" /></label>
          </div>
          {saveErr ? <p className="mt-3 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-xs text-red-200">{saveErr}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2"><button disabled={saving} onClick={() => void saveActive()} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-500 px-4 text-xs font-semibold text-black disabled:opacity-40"><Save className="h-3.5 w-3.5" /> Save project</button><button disabled={saving} onClick={() => void saveActive(true)} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-xs font-semibold text-black disabled:opacity-40"><Globe2 className="h-3.5 w-3.5" /> Publish</button><button onClick={() => download(active)} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 text-xs"><Download className="h-3.5 w-3.5" /> Download</button>{active.published ? <a href={`/site/${String(active.slug)}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 text-xs"><ExternalLink className="h-3.5 w-3.5" /> Open published</a> : null}</div>
          <iframe title="Website preview" srcDoc={decorateHtml(String(active.html ?? ""), String(active.name ?? ""), String(active.logo_url ?? ""), welcome)} className="mt-4 h-[560px] w-full rounded-2xl border border-white/10 bg-white" sandbox="allow-scripts allow-popups allow-forms" />
        </section>
      ) : null}
      <ProjectConnectionsPanel />
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">My website projects</h3><button onClick={() => void refresh()} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5">{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}</button></div><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{builds.map((b) => <button key={String(b.id)} onClick={() => openBuild(b)} className="rounded-xl border border-white/10 bg-black/20 p-4 text-left hover:border-fuchsia-400/25"><div className="truncate text-sm font-medium">{String(b.name)}</div><div className="mt-1 text-[11px] text-white/35">{String(b.slug)}.eager.app · {b.published ? "published" : "draft"}</div></button>)}{!builds.length ? <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-white/35 sm:col-span-2 lg:col-span-3">No AI websites yet. Build your first project above.</div> : null}</div></section>
    </div>
  );
}
