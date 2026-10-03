import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Bot,
  ChevronRight,
  Code2,
  Download,
  Folder,
  Loader2,
  Monitor,
  Play,
  RefreshCw,
  Save,
  Send,
  Smartphone,
  Tablet,
  Wand2,
} from "lucide-react";
import {
  buildRealAppFromPrompt,
  editRealAppWithAI,
  listSiteBuilds,
  updateSiteBuild,
} from "../../lib/site-builder.functions";

type Files = Record<string, string>;
type Build = Record<string, any>;
type Device = "phone" | "tablet" | "desktop";

function previewDocument(files: Files) {
  const app = files["src/App.jsx"] || "";
  const css = files["src/styles.css"] || "";
  const cleaned = app
    .replace(/import\s+React[^;]*;?/g, "")
    .replace(/import\s+\{[^}]+\}\s+from\s+["']react["'];?/g, "")
    .replace(/import\s+[^;]+\s+from\s+["'][^"']+["'];?/g, "")
    .replace(/export\s+default\s+/g, "")
    .replace(/export\s+\{[^}]+\};?/g, "");
  const main = `
const root = document.getElementById("root");
try {
  ReactDOM.createRoot(root).render(React.createElement(App));
} catch (error) {
  root.innerHTML = '<div style="font-family:system-ui;padding:32px"><h2>Preview error</h2><pre style="white-space:pre-wrap;color:#b91c1c"></pre></div>';
  root.querySelector('pre').textContent = error?.stack || error?.message || String(error);
}
`;
  return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
html,body,#root{margin:0;min-height:100%;width:100%;}body{background:#fff;}*{box-sizing:border-box}
${css}
</style></head><body><div id="root"></div>
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone@7.26.9/babel.min.js"><\/script>
<script type="text/babel" data-presets="react">
${cleaned}
${main}
<\/script></body></html>`;
}

export function RealAppBuilderPanel() {
  const buildFn = useServerFn(buildRealAppFromPrompt);
  const editFn = useServerFn(editRealAppWithAI);
  const loadFn = useServerFn(listSiteBuilds);
  const saveFn = useServerFn(updateSiteBuild);

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Premium, modern, native-feeling, mobile-first");
  const [screens, setScreens] = useState("");
  const [builds, setBuilds] = useState<Build[]>([]);
  const [active, setActive] = useState<Build | null>(null);
  const [file, setFile] = useState("src/App.jsx");
  const [device, setDevice] = useState<Device>("phone");
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await loadFn({ data: { kind: "app" } });
      setBuilds((res.builds as Build[]).filter((b) => b.framework === "vite-react"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load projects.");
    }
  }, [loadFn]);

  useEffect(() => { void load(); }, [load]);

  const files: Files = active?.project_files && typeof active.project_files === "object"
    ? active.project_files as Files
    : {};

  const document = useMemo(() => previewDocument(files), [files, refresh]);
  const deviceClass = device === "phone"
    ? "h-[700px] w-[390px] rounded-[42px] p-2"
    : device === "tablet"
      ? "h-[760px] w-[560px] rounded-[28px] p-2"
      : "h-[760px] w-[min(1100px,90vw)] rounded-2xl p-1.5";

  async function generate() {
    setBusy(true); setError("");
    try {
      const res = await buildFn({ data: { prompt, style, screens, themeColor: "#0A0A0A", name: "" } });
      setActive(res.build as Build);
      setFile("src/App.jsx");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "App generation failed.");
    } finally { setBusy(false); }
  }

  async function aiEdit() {
    if (!active || !instruction.trim()) return;
    setAiBusy(true); setError("");
    try {
      const res = await editFn({ data: { id: String(active.id), instruction } });
      setActive(res.build as Build);
      setInstruction("");
      setFile("src/App.jsx");
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI edit failed.");
    } finally { setAiBusy(false); }
  }

  async function save() {
    if (!active) return;
    setSaving(true); setError("");
    try {
      const res = await saveFn({
        data: {
          id: String(active.id),
          project_files: files,
          html: String(files["index.html"] || ""),
          entry_file: String(active.entry_file || "src/main.jsx"),
          framework: "vite-react",
          build_version: Number(active.build_version || 1) + 1,
        } as any,
      });
      if (res) setActive({ ...active, build_version: Number(active.build_version || 1) + 1 });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save project.");
    } finally { setSaving(false); }
  }

  function updateFile(value: string) {
    if (!active) return;
    setActive({ ...active, project_files: { ...files, [file]: value } });
    setRefresh((v) => v + 1);
  }

  function exportProject() {
    if (!active) return;
    const bundle = JSON.stringify({
      name: active.name,
      framework: active.framework,
      dependencies: active.dependencies || {},
      files,
    }, null, 2);
    const url = URL.createObjectURL(new Blob([bundle], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = `${active.slug}-eager-project.json`; a.click();
    URL.revokeObjectURL(url);
  }

  return <div className="space-y-5">
    <header>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold"><Wand2 className="h-4 w-4 text-sky-300" /> Real AI App Builder</h2>
          <p className="mt-1 max-w-3xl text-xs text-white/50">
            Eager generates a real Vite + React project with package.json, source files, components, styles and working application state. Edit the source yourself or tell the AI what to change.
          </p>
        </div>
        {active ? <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-200">Vite + React project</span> : null}
      </div>
    </header>

    {!active ? <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <label className="block">
        <span className="mb-1.5 block text-[10px] uppercase tracking-[.2em] text-white/45">Describe the app</span>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5}
          placeholder="Build a Sierra Leone ride-hailing app with customer and driver flows, live ride status, trip cards, driver profile, booking form and mobile navigation."
          className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-sky-400" />
      </label>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label><span className="mb-1 block text-[10px] text-white/45">Visual direction</span>
          <input value={style} onChange={(e) => setStyle(e.target.value)} className="min-h-10 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-xs outline-none" /></label>
        <label><span className="mb-1 block text-[10px] text-white/45">Required screens</span>
          <input value={screens} onChange={(e) => setScreens(e.target.value)} placeholder="Home, booking, trip, profile, settings" className="min-h-10 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-xs outline-none" /></label>
      </div>
      {error ? <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-200">{error}</p> : null}
      <button disabled={busy || prompt.trim().length < 8} onClick={() => void generate()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-black disabled:opacity-40">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />} {busy ? "Generating real project..." : "Generate real app"}
      </button>
    </section> : null}

    {active ? <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#080a0f]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#0d1017] px-3 py-2">
        <div className="flex items-center gap-2 text-xs"><Folder className="h-3.5 w-3.5 text-sky-300" /> {String(active.name)}</div>
        <div className="flex flex-wrap items-center gap-1">
          {(["phone","tablet","desktop"] as Device[]).map((d) => <button key={d} onClick={() => setDevice(d)} className={`rounded-md px-2.5 py-1.5 text-[10px] ${device === d ? "bg-white text-black" : "text-white/50 hover:bg-white/5"}`}>
            {d === "phone" ? <Smartphone className="mr-1 inline h-3 w-3" /> : d === "tablet" ? <Tablet className="mr-1 inline h-3 w-3" /> : <Monitor className="mr-1 inline h-3 w-3" />}{d}
          </button>)}
          <button onClick={() => setRefresh((v) => v + 1)} className="ml-1 grid h-8 w-8 place-items-center rounded-md border border-white/10"><RefreshCw className="h-3.5 w-3.5" /></button>
          <button onClick={() => void save()} disabled={saving} className="inline-flex min-h-8 items-center gap-1 rounded-md bg-white px-3 text-[10px] font-semibold text-black"><Save className="h-3 w-3" /> Save</button>
          <button onClick={exportProject} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-white/10 px-3 text-[10px]"><Download className="h-3 w-3" /> Export project</button>
        </div>
      </div>

      <div className="grid min-h-[760px] lg:grid-cols-[190px_minmax(0,1fr)_minmax(400px,.9fr)]">
        <aside className="border-b border-white/10 bg-[#090c12] lg:border-b-0 lg:border-r">
          <div className="border-b border-white/10 px-3 py-2 text-[9px] uppercase tracking-[.2em] text-white/30">Project files</div>
          <div className="p-2">
            {Object.keys(files).map((path) => <button key={path} onClick={() => setFile(path)} className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[10px] ${file === path ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5"}`}>
              <Code2 className="h-3 w-3 shrink-0" /> <span className="truncate">{path}</span>
            </button>)}
          </div>
          <div className="border-t border-white/10 p-3 text-[9px] leading-4 text-white/30">package.json defines the real dependencies and scripts. The project can be opened in VS Code and run with Vite.</div>
        </aside>

        <section className="min-w-0 border-b border-white/10 lg:border-b-0 lg:border-r">
          <div className="flex h-10 items-center justify-between border-b border-white/10 px-3 text-[10px] text-white/45"><span>{file}</span><span>Editable source</span></div>
          <div className="flex h-[710px] overflow-hidden font-mono text-[10px] leading-5">
            <div className="hidden w-9 shrink-0 select-none overflow-hidden border-r border-white/5 bg-black/20 py-3 text-right text-white/20 sm:block">{String(files[file] || "").split("\n").map((_, i) => <div key={i} className="px-1">{i + 1}</div>)}</div>
            <textarea value={String(files[file] || "")} onChange={(e) => updateFile(e.target.value)} spellCheck={false} className="min-w-0 flex-1 resize-none bg-[#07090e] px-3 py-3 text-[#d7e2ea] outline-none" />
          </div>
        </section>

        <section className="relative min-w-0 bg-[#05070b]">
          <div className="flex h-10 items-center justify-between border-b border-white/10 px-3 text-[10px] text-white/45"><span className="flex items-center gap-1.5"><Play className="h-3 w-3 text-emerald-300" /> Live simulator</span><span>Browser runtime</span></div>
          <div className="flex min-h-[710px] items-center justify-center overflow-auto p-5">
            <div className={`overflow-hidden border border-white/20 bg-black shadow-2xl ${deviceClass}`}>
              <iframe key={refresh} title="Real app simulator" srcDoc={document} sandbox="allow-scripts allow-forms allow-modals" className="h-full w-full bg-white" />
            </div>
          </div>
        </section>
      </div>

      <div className="border-t border-white/10 bg-[#0a0d13] p-3">
        <div className="mb-2 flex items-center gap-2 text-[10px] text-white/45"><Bot className="h-3.5 w-3.5 text-sky-300" /> Ask Eager AI to change the project</div>
        <div className="flex gap-2">
          <input value={instruction} onChange={(e) => setInstruction(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void aiEdit(); }} placeholder="Add a dark driver dashboard, then add a ride request modal..." className="min-h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-sky-400" />
          <button disabled={aiBusy || !instruction.trim()} onClick={() => void aiEdit()} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-sky-500 px-4 text-xs font-semibold text-black disabled:opacity-40">{aiBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Ask AI</button>
        </div>
        {error ? <p className="mt-2 text-[10px] text-red-200">{error}</p> : null}
      </div>
    </section> : null}

    <section className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Real app projects</h3><button onClick={() => void load()} className="grid h-8 w-8 place-items-center rounded-md border border-white/10"><RefreshCw className="h-3.5 w-3.5" /></button></div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {builds.map((b) => <button key={String(b.id)} onClick={() => { setActive(b); setFile("src/App.jsx"); }} className="rounded-xl border border-white/10 bg-black/20 p-3 text-left hover:bg-white/5">
          <div className="flex items-center justify-between gap-2"><span className="truncate text-xs">{String(b.name)}</span><ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/30" /></div>
          <div className="mt-1 text-[9px] text-white/35">{String(b.framework)} · v{String(b.build_version || 1)} · {new Date(String(b.updated_at || b.created_at)).toLocaleString()}</div>
        </button>)}
        {!builds.length ? <div className="p-4 text-center text-xs text-white/35">No real app projects yet.</div> : null}
      </div>
    </section>
  </div>;
}
