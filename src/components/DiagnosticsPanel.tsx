import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Activity, CheckCircle2, RefreshCcw, XCircle, AlertTriangle, X } from "lucide-react";

type Check = { id: string; label: string; status: "ok" | "warn" | "fail"; detail: string };

const ROUTES_TO_TEST = [
  "/portfolio-os",
  "/portfolio-os/suite",
  "/explore",
  "/legends",
  "/portfolio",
  "/admin",
];

const ASSETS_TO_TEST = [
  "/manifest.webmanifest",
  "/favicon.ico",
];

export function DiagnosticsPanel() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [checks, setChecks] = useState<Check[]>([]);
  const [swVersion, setSwVersion] = useState<string>("unknown");

  const run = async () => {
    setRunning(true);
    const results: Check[] = [];

    // Route probes
    for (const path of ROUTES_TO_TEST) {
      try {
        const res = await fetch(path, { method: "GET", cache: "no-store" });
        results.push({
          id: `route:${path}`,
          label: `Route ${path}`,
          status: res.ok ? "ok" : "fail",
          detail: `HTTP ${res.status}`,
        });
      } catch (e) {
        results.push({ id: `route:${path}`, label: `Route ${path}`, status: "fail", detail: String((e as Error).message) });
      }
    }

    // Asset probes
    for (const asset of ASSETS_TO_TEST) {
      try {
        const res = await fetch(asset, { method: "HEAD", cache: "no-store" });
        results.push({
          id: `asset:${asset}`,
          label: `Asset ${asset}`,
          status: res.ok ? "ok" : "warn",
          detail: `HTTP ${res.status}`,
        });
      } catch (e) {
        results.push({ id: `asset:${asset}`, label: `Asset ${asset}`, status: "warn", detail: String((e as Error).message) });
      }
    }

    // Service worker / cache
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      const active = regs.find((r) => r.active?.scriptURL.endsWith("/sw.js"));
      results.push({
        id: "sw:reg",
        label: "Service worker registered",
        status: active ? "ok" : "warn",
        detail: active ? active.active!.scriptURL : "No /sw.js registration (fine in preview)",
      });
      if ("caches" in window) {
        try {
          const keys = await caches.keys();
          const portfolio = keys.filter((k) => k.startsWith("portfolio-os-cache"));
          setSwVersion(portfolio[0] ?? "none");
          const stale = portfolio.filter((k) => k !== "portfolio-os-cache-v5");
          results.push({
            id: "cache:version",
            label: "Cache version",
            status: stale.length === 0 ? "ok" : "warn",
            detail: portfolio.length ? portfolio.join(", ") : "no cache yet",
          });
        } catch {
          results.push({ id: "cache:version", label: "Cache version", status: "warn", detail: "unavailable" });
        }
      }
    } else {
      results.push({ id: "sw:reg", label: "Service worker registered", status: "warn", detail: "unsupported" });
    }

    setChecks(results);
    setRunning(false);
  };

  useEffect(() => {
    if (open && checks.length === 0) void run();
  }, [open]);

  // Auto-probe /portfolio-os on page load. If it fails, open the panel and run
  // the full diagnostics automatically with a clear reason.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/portfolio-os", { method: "GET", cache: "no-store" });
        if (!res.ok && !cancelled) {
          setOpen(true);
          void run();
        }
      } catch {
        if (!cancelled) {
          setOpen(true);
          void run();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const failing = checks.filter((c) => c.status === "fail");


  const forceUpdate = async () => {
    if (!("serviceWorker" in navigator)) return;
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.update().catch(() => undefined)));
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith("portfolio-os-cache")).map((k) => caches.delete(k)));
    }
    window.location.reload();
  };

  return (
    <>
      <button
        aria-label="Open diagnostics"
        onClick={() => setOpen(true)}
        className="fixed bottom-3 left-1/2 z-[110] hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/75 px-4 py-2 text-[11px] font-semibold text-white shadow-2xl backdrop-blur-xl hover:bg-black sm:inline-flex"
      >
        <Activity className="h-3.5 w-3.5" /> Diagnostics
      </button>

      {open && (
        <div className="fixed inset-0 z-[400] flex items-end justify-center bg-black/70 p-3 backdrop-blur-xl sm:items-center" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="h-4 w-4 text-emerald-400" /> Portfolio OS diagnostics
              </div>
              <button aria-label="Close" onClick={() => setOpen(false)} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-widest text-white/50">
                <span>Active cache: {swVersion}</span>
                <span>Last SW: {swVersion}</span>
              </div>
              {failing.length > 0 && (
                <div className="mb-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-3 text-xs text-red-200">
                  <div className="flex items-center gap-2 font-bold">
                    <XCircle className="h-4 w-4" /> {failing.length} problem
                    {failing.length > 1 ? "s" : ""} detected
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {failing.map((c) => (
                      <li key={`fail-${c.id}`}>
                        <span className="font-semibold">{c.label}</span>, {c.detail}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 text-red-200/80">
                    Fix: tap “Force update &amp; reload” below to clear stale caches and reload the
                    latest build.
                  </div>
                </div>
              )}

              <ul className="space-y-2">
                {checks.map((c) => (
                  <li key={c.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
                    {c.status === "ok" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                    ) : c.status === "warn" ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-400" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 text-red-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{c.label}</div>
                      <div className="truncate text-white/50">{c.detail}</div>
                    </div>
                  </li>
                ))}
                {checks.length === 0 && <li className="py-6 text-center text-xs text-white/50">Running checks…</li>}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-5 py-4">
              <button onClick={run} disabled={running} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold hover:bg-white/10 disabled:opacity-50">
                <RefreshCcw className={`h-3.5 w-3.5 ${running ? "animate-spin" : ""}`} /> Re-run
              </button>
              <button onClick={forceUpdate} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-90">
                Force update & reload
              </button>
              <Link to="/portfolio-os" onClick={() => setOpen(false)} className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold hover:bg-white/10">
                Open Portfolio OS →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}