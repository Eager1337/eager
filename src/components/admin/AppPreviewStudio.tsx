import { useMemo, useState } from "react";
import {
  Code2,
  ExternalLink,
  Maximize2,
  Monitor,
  Play,
  RotateCcw,
  Smartphone,
  Tablet,
} from "lucide-react";

type Device = "iphone" | "android" | "tablet" | "desktop";

const DEVICE_WIDTHS: Record<Device, number> = {
  iphone: 390,
  android: 412,
  tablet: 820,
  desktop: 1280,
};

const DEVICE_LABELS: Record<Device, string> = {
  iphone: "iPhone",
  android: "Android",
  tablet: "Tablet",
  desktop: "Desktop",
};

export function AppPreviewStudio({
  html,
  onChange,
  onSave,
}: {
  html: string;
  onChange: (value: string) => void;
  onSave?: () => void;
}) {
  const [device, setDevice] = useState<Device>("iphone");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [zoom, setZoom] = useState(0.78);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState<"code" | "preview">("preview");

  const frameWidth = useMemo(() => {
    const base = DEVICE_WIDTHS[device];
    return orientation === "portrait" ? base : Math.round(base * 0.58);
  }, [device, orientation]);

  const frameHeight = useMemo(() => {
    const base = device === "desktop" ? 760 : device === "tablet" ? 1180 : 844;
    return orientation === "portrait" ? base : Math.round(base * 0.58);
  }, [device, orientation]);

  const isPhone = device === "iphone" || device === "android";
  const previewHtml = html.trim() || `<!doctype html><html><body style="margin:0;font-family:system-ui;background:#0b0d12;color:white;display:grid;place-items:center;min-height:100vh"><div style="text-align:center;padding:24px"><strong>Your app preview is ready</strong><p style="opacity:.6">Generate or edit the app code to see it here.</p></div></body></html>`;

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#090b10] shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#0d1017] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          <span className="ml-2 hidden font-mono text-[10px] text-white/40 sm:inline">
            Eager App Studio
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 p-1">
          <button
            onClick={() => setTab("preview")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition ${tab === "preview" ? "bg-white text-black" : "text-white/55 hover:text-white"}`}
          >
            <Play className="h-3 w-3" /> Preview
          </button>
          <button
            onClick={() => setTab("code")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition ${tab === "code" ? "bg-white text-black" : "text-white/55 hover:text-white"}`}
          >
            <Code2 className="h-3 w-3" /> Code
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            title="Refresh preview"
            onClick={() => setRefreshKey((v) => v + 1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            title="Save app"
            onClick={onSave}
            className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-semibold text-black hover:bg-white/90"
          >
            Save
          </button>
        </div>
      </div>

      <div className="grid min-h-[720px] lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <div className={`relative min-h-[720px] border-b border-white/10 bg-[#05070b] lg:border-b-0 lg:border-r ${tab === "code" ? "hidden lg:block" : ""}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#0a0d13] px-3 py-2">
            <div className="flex items-center gap-1">
              {(["iphone", "android", "tablet", "desktop"] as Device[]).map((item) => {
                const Icon = item === "desktop" ? Monitor : item === "tablet" ? Tablet : Smartphone;
                return (
                  <button
                    key={item}
                    onClick={() => setDevice(item)}
                    title={DEVICE_LABELS[item]}
                    className={`grid h-8 w-8 place-items-center rounded-md ${device === item ? "bg-white text-black" : "text-white/45 hover:bg-white/5 hover:text-white"}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setOrientation((v) => (v === "portrait" ? "landscape" : "portrait"))}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] text-white/60 hover:text-white"
              >
                {orientation === "portrait" ? "Portrait" : "Landscape"}
              </button>
              <select
                value={String(zoom)}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="rounded-md border border-white/10 bg-[#11151d] px-2 py-1.5 text-[10px] text-white/70 outline-none"
              >
                <option value="0.55">55%</option>
                <option value="0.65">65%</option>
                <option value="0.78">78%</option>
                <option value="0.9">90%</option>
                <option value="1">100%</option>
              </select>
            </div>
          </div>

          <div className="flex min-h-[660px] items-center justify-center overflow-auto bg-[radial-gradient(circle_at_center,rgba(56,189,248,.08),transparent_55%)] p-6">
            <div
              className={`relative shrink-0 overflow-hidden border border-white/20 bg-black shadow-[0_35px_100px_rgba(0,0,0,.65)] ${isPhone ? "rounded-[2.8rem] p-2" : device === "tablet" ? "rounded-[1.8rem] p-2" : "rounded-xl p-1.5"}`}
              style={{
                width: frameWidth * zoom,
                height: frameHeight * zoom,
              }}
            >
              {isPhone ? (
                <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />
              ) : null}

              <iframe
                key={refreshKey}
                title="Live app simulator"
                srcDoc={previewHtml}
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                className="h-full w-full rounded-[2.2rem] border-0 bg-white"
              />
            </div>
          </div>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[9px] text-white/45 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live preview · {DEVICE_LABELS[device]} · {Math.round(zoom * 100)}%
          </div>
        </div>

        <div className={`min-h-[720px] bg-[#07090e] ${tab === "preview" ? "hidden lg:block" : ""}`}>
          <div className="flex h-10 items-center justify-between border-b border-white/10 bg-[#0a0d13] px-3">
            <div className="flex items-center gap-2 text-[10px] text-white/55">
              <Code2 className="h-3.5 w-3.5" />
              <span>index.html</span>
              <span className="text-white/20">•</span>
              <span>Live</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                title="Open preview in a new tab"
                onClick={() => {
                  const blob = new Blob([html], { type: "text/html" });
                  const url = URL.createObjectURL(blob);
                  window.open(url, "_blank", "noopener,noreferrer");
                  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
                }}
                className="grid h-7 w-7 place-items-center rounded-md text-white/40 hover:bg-white/5 hover:text-white"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
              <button
                title="Focus editor"
                onClick={() => document.getElementById("eager-app-code-editor")?.focus()}
                className="grid h-7 w-7 place-items-center rounded-md text-white/40 hover:bg-white/5 hover:text-white"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex h-[680px] overflow-hidden font-mono text-[11px] leading-5">
            <div className="hidden w-10 shrink-0 select-none overflow-hidden border-r border-white/5 bg-[#080a0f] py-3 text-right text-white/20 sm:block">
              {Array.from({ length: Math.max(1, html.split("\n").length) }, (_, i) => (
                <div key={i} className="px-2">{i + 1}</div>
              ))}
            </div>
            <textarea
              id="eager-app-code-editor"
              value={html}
              onChange={(e) => onChange(e.target.value)}
              spellCheck={false}
              className="min-w-0 flex-1 resize-none overflow-auto bg-[#07090e] px-3 py-3 text-[#d7e2ea] outline-none selection:bg-sky-500/25"
              style={{ tabSize: 2 }}
              aria-label="App source code editor"
            />
          </div>

          <div className="flex items-center justify-between border-t border-white/10 bg-[#0a0d13] px-3 py-2 text-[9px] text-white/35">
            <span>HTML / CSS / JavaScript</span>
            <span>Changes render live in the simulator</span>
          </div>
        </div>
      </div>
    </section>
  );
}
