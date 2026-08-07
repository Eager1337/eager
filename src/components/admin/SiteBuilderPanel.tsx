import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, ExternalLink, Loader2, RefreshCw, Sparkles, Trash2, Wand2 } from "lucide-react";
import {
  buildSiteFromPrompt,
  deleteSiteBuild,
  listSiteBuilds,
  updateSiteBuild,
} from "../../lib/site-builder.functions";

type Row = Record<string, any>;

const IDEAS = [
  "A premium dental clinic site with online booking, team bios and insurance FAQs",
  "A university department site with courses, faculty, research and admissions",
  "A logistics company site with tracking, fleet stats and quote request form",
  "A fintech landing page with pricing, security section and investor metrics",
  "A restaurant site with menu, reservations, gallery and opening hours",
];

/** Prompt the AI, get a complete website back, preview it and publish it. */
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
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await load({});
      setBuilds(res.builds as Row[]);
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load builds.");
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
      const res = await build({ data: { prompt, name, style, pages } });
      setActive(res.build as Row);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setBusy(false);
    }
  };

  const download = (row: Row) => {
    const blob = new Blob([String(row.html ?? "")], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${row.slug ?? "site"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <header className="min-w-0">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Wand2 className="h-4 w-4 text-fuchsia-300" /> AI website builder
        </h2>
        <p className="mt-1 max-w-2xl text-xs text-white/55">
          Describe any website and the AI returns a complete, responsive, accessible single file site.
          Preview it here, download the HTML, or publish it to a live link on this domain.
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
              What should it build?
            </span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="A modern site for a private medical clinic in Freetown with appointment booking, doctor profiles, services and insurance details"
              className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-fuchsia-400"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
              Site name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
              className="min-h-[40px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-fuchsia-400"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
              Visual direction
            </span>
            <input
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Dark editorial, warm accents, big type"
              className="min-h-[40px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-fuchsia-400"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
              Sections that must exist
            </span>
            <input
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="Hero, services, team, pricing, testimonials, booking form, FAQ, footer"
              className="min-h-[40px] w-full rounded-lg border border-white/15 bg-black/50 px-3 text-sm outline-none focus:border-fuchsia-400"
            />
          </label>
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
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-sky-500 px-5 text-sm font-semibold disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {busy ? "Building the site" : "Build my website"}
        </button>
      </section>

      {active ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{String(active.name)}</div>
              <div className="text-[11px] text-white/45">/site/{String(active.slug)}</div>
            </div>
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
                  href={`/site/${String(active.slug)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 text-xs hover:bg-white/10"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open
                </a>
              ) : null}
            </div>
          </div>
          <iframe
            title="Generated site preview"
            srcDoc={String(active.html ?? "")}
            className="mt-4 h-[520px] w-full rounded-xl border border-white/10 bg-white"
            sandbox="allow-scripts allow-popups"
          />
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Generated sites</h3>
          <button
            onClick={() => void refresh()}
            aria-label="Refresh builds"
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
                  /site/{String(b.slug)} · {new Date(String(b.created_at)).toLocaleString()} ·{" "}
                  {b.published ? "published" : "draft"}
                </div>
              </button>
              <div className="flex gap-1.5">
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
                      if (!window.confirm("Delete this generated site?")) return;
                      await remove({ data: { id: String(b.id) } });
                      if (active?.id === b.id) setActive(null);
                      await refresh();
                    })()
                  }
                  aria-label="Delete build"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-red-400/25 bg-red-400/10 text-red-200 hover:bg-red-400/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
          {!loading && !builds.length ? (
            <li className="rounded-xl border border-white/10 bg-black/20 px-4 py-6 text-center text-xs text-white/45">
              No sites generated yet. Describe one above.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
