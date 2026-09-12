import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Copy,
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
  Save,
  Smartphone,
  Sparkles,
  Trash2,
} from "lucide-react";
import { ImageUploadField } from "./ImageUploadField";
import { AttachmentField, attachmentsPrompt, type Attachment } from "./AttachmentField";
import {
  buildAppFromPrompt,
  cloneSiteBuild,
  deleteSiteBuild,
  listSiteBuilds,
  updateSiteBuild,
} from "../../lib/site-builder.functions";

type Row = Record<string, any>;

const IDEAS = [
  "A habit tracker app with streaks, reminders and a weekly chart",
  "A delivery driver app with jobs list, route map and proof of delivery",
  "A gym workout logger with routines, timers and personal records",
  "A student planner app with timetable, assignments and grade tracking",
  "A field survey app that works offline and exports results",
];

/** Build installable phone/desktop apps, keep every build, edit and republish. */
export function AppBuilderPanel() {
  const build = useServerFn(buildAppFromPrompt);
  const load = useServerFn(listSiteBuilds);
  const patch = useServerFn(updateSiteBuild);
  const remove = useServerFn(deleteSiteBuild);
  const clone = useServerFn(cloneSiteBuild);

  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [style, setStyle] = useState("");
  const [screens, setScreens] = useState("");
  const [themeColor, setThemeColor] = useState("#0A0A0A");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [builds, setBuilds] = useState<Row[]>([]);
  const [active, setActive] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await load({ data: { kind: "app" } });
      setBuilds(res.builds as Row[]);
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load app builds.");
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const generate = async () => {
    setBusy(true);
    setErr("");
    try {
      const origin = typeof window === "undefined" ? "" : window.location.origin;
      const res = await build({
        data: { prompt, name, style, screens, themeColor, assets: attachmentsPrompt(files, origin) },
      });
      setActive(res.build as Row);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "App generation failed.");
    } finally {
      setBusy(false);
    }
  };

  const saveActive = async () => {
    if (!active) return;
    setSaving(true);
    setSaveErr("");
    try {
      const res = await patch({
        data: {
          id: String(active.id),
          name: String(active.name ?? ""),
          slug: String(active.slug ?? ""),
          summary: String(active.summary ?? ""),
          short_name: String(active.short_name ?? ""),
          theme_color: String(active.theme_color ?? "#0A0A0A"),
          app_icon: String(active.app_icon ?? ""),
          apk_url: String(active.apk_url ?? ""),
          html: String(active.html ?? ""),
        },
      });
      if (res?.slug) setActive((prev) => (prev ? { ...prev, slug: res.slug } : prev));
      await refresh();
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Could not save the changes.");
    } finally {
      setSaving(false);
    }
  };

  const download = (row: Row) => {
    const blob = new Blob([String(row.html ?? "")], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${row.slug ?? "app"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <header className="min-w-0">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Smartphone className="h-4 w-4 text-sky-300" /> AI app builder
        </h2>
        <p className="mt-1 max-w-2xl text-xs text-white/55">
          Describe an app and get a phone-first installable build. Every app you start is kept here so you
          can reopen, tweak and republish it later, and each published app gets an install page for Android
          and desktop plus a slot for a downloadable APK.
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
              What should the app do?
            </span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="A delivery tracking app for CargoX drivers with a jobs list, live status updates, photo proof of delivery and an offline mode"
              className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-sky-400"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
              App name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
              className="min-h-[40px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
              Visual direction
            </span>
            <input
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Dark, high contrast, big touch targets"
              className="min-h-[40px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
              Screens that must exist
            </span>
            <input
              value={screens}
              onChange={(e) => setScreens(e.target.value)}
              placeholder="Home, jobs, job detail, profile, settings"
              className="min-h-[40px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
              Theme colour
            </span>
            <input
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              placeholder="#0A0A0A"
              className="min-h-[40px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-sky-400"
            />
          </label>
          <div className="sm:col-span-2">
            <AttachmentField
              keyHint="appbuild"
              label="Attach files, images or videos for the app"
              value={files}
              onChange={setFiles}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {IDEAS.map((idea) => (
            <button
              key={idea}
              onClick={() => setPrompt(idea)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/60 hover:bg-white/10 hover:text-white"
            >
              {idea.slice(0, 44)}
            </button>
          ))}
        </div>

        {err ? (
          <p className="mt-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs text-red-200">
            {err}
          </p>
        ) : null}

        <button
          disabled={busy || prompt.trim().length < 8}
          onClick={() => void generate()}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-5 text-sm font-semibold disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {busy ? "Building the app" : "Build my app"}
        </button>
      </section>

      {active ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
                App name
              </span>
              <input
                value={String(active.name ?? "")}
                onChange={(e) => setActive({ ...active, name: e.target.value })}
                className="min-h-[40px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-sky-400"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
                Short address
              </span>
              <input
                value={String(active.slug ?? "")}
                onChange={(e) => setActive({ ...active, slug: e.target.value })}
                className="min-h-[40px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-sky-400"
              />
              <span className="mt-1 block text-[10px] text-white/40">
                Install page at /app/{String(active.slug ?? "")} and short link /s/{String(active.slug ?? "")}
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
                Home screen name
              </span>
              <input
                value={String(active.short_name ?? "")}
                onChange={(e) => setActive({ ...active, short_name: e.target.value })}
                className="min-h-[40px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-sky-400"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
                Theme colour
              </span>
              <input
                value={String(active.theme_color ?? "#0A0A0A")}
                onChange={(e) => setActive({ ...active, theme_color: e.target.value })}
                className="min-h-[40px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-sky-400"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
                Short description
              </span>
              <input
                value={String(active.summary ?? "")}
                onChange={(e) => setActive({ ...active, summary: e.target.value })}
                className="min-h-[40px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-sky-400"
              />
            </label>
            <div className="sm:col-span-2">
              <ImageUploadField
                label="App icon"
                keyHint={`appicon-${String(active.slug ?? "app")}`}
                value={String(active.app_icon ?? "")}
                onChange={(url) => setActive({ ...active, app_icon: url })}
              />
            </div>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
                APK download link
              </span>
              <input
                value={String(active.apk_url ?? "")}
                onChange={(e) => setActive({ ...active, apk_url: e.target.value })}
                placeholder="Paste the APK link produced by the APK build workflow"
                className="min-h-[40px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-sky-400"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
                Edit the app code
              </span>
              <textarea
                value={String(active.html ?? "")}
                onChange={(e) => setActive({ ...active, html: e.target.value })}
                rows={10}
                spellCheck={false}
                className="w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 font-mono text-[11px] outline-none focus:border-sky-400"
              />
            </label>
          </div>

          {saveErr ? (
            <p className="mt-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs text-red-200">
              {saveErr}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => void saveActive()}
              disabled={saving}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 text-xs font-semibold disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save changes
            </button>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => download(active)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs hover:bg-white/10"
              >
                <Download className="h-3.5 w-3.5" /> Download HTML
              </button>
              <button
                onClick={() =>
                  void (async () => {
                    const res = await clone({ data: { id: String(active.id) } });
                    setActive(res.build as Row);
                    await refresh();
                  })()
                }
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs hover:bg-white/10"
              >
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </button>
              <button
                onClick={() =>
                  void (async () => {
                    await patch({ data: { id: String(active.id), published: !active.published } });
                    setActive({ ...active, published: !active.published });
                    await refresh();
                  })()
                }
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-black hover:bg-white/90"
              >
                {active.published ? "Unpublish" : "Publish live"}
              </button>
              {active.published ? (
                <a
                  href={`/app/${String(active.slug)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs hover:bg-white/10"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open install page
                </a>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="w-[380px] max-w-full overflow-hidden rounded-[2rem] border-4 border-white/15 bg-black p-1.5">
              <iframe
                title="Generated app preview"
                srcDoc={String(active.html ?? "")}
                className="h-[620px] w-full rounded-[1.6rem] bg-white"
                sandbox="allow-scripts allow-popups"
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">App build history</h3>
          <button
            onClick={() => void refresh()}
            aria-label="Refresh app builds"
            className="grid h-[34px] w-[34px] place-items-center rounded-lg border border-white/15 bg-white/5 hover:bg-white/10"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {builds.map((b) => (
            <li
              key={String(b.id)}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3"
            >
              <button onClick={() => setActive(b)} className="min-w-0 text-left">
                <div className="truncate text-sm">{String(b.name)}</div>
                <div className="text-[11px] text-white/45">
                  /app/{String(b.slug)} · {new Date(String(b.created_at)).toLocaleString()} ·{" "}
                  {b.published ? "published" : "draft"}
                  {b.cloned_from ? " · copy" : ""}
                </div>
              </button>
              <div className="flex gap-1.5">
                <button
                  onClick={() =>
                    void (async () => {
                      const res = await clone({ data: { id: String(b.id) } });
                      setActive(res.build as Row);
                      await refresh();
                    })()
                  }
                  aria-label="Duplicate app"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => download(b)}
                  aria-label="Download HTML"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() =>
                    void (async () => {
                      if (!window.confirm("Delete this app build?")) return;
                      await remove({ data: { id: String(b.id) } });
                      if (active?.id === b.id) setActive(null);
                      await refresh();
                    })()
                  }
                  aria-label="Delete app build"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-red-400/25 bg-red-400/10 text-red-200 hover:bg-red-400/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
          {!loading && !builds.length ? (
            <li className="rounded-xl border border-white/10 bg-black/20 px-4 py-6 text-center text-xs text-white/45">
              No apps built yet. Describe one above.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
