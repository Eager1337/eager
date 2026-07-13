// Guarded service worker registration. No-op in dev / Lovable preview / iframe.
export function registerPortfolioOsSw() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const host = window.location.hostname;
  const inIframe = window.self !== window.top;
  const isPreview =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host.endsWith(".lovableproject.com") ||
    host.endsWith(".lovableproject-dev.com") ||
    host.endsWith(".beta.lovable.dev") ||
    host === "beta.lovable.dev";
  const off = new URLSearchParams(window.location.search).get("sw") === "off";

  const isDev = !!(import.meta as unknown as { env?: { PROD?: boolean } }).env && !(import.meta as unknown as { env: { PROD: boolean } }).env.PROD;

  if (isDev || inIframe || isPreview || off) {
    navigator.serviceWorker.getRegistrations?.().then((regs) => {
      regs.forEach((r) => {
        if (r.active?.scriptURL.endsWith("/sw.js")) r.unregister();
      });
    });
    return;
  }
  navigator.serviceWorker
    .register("/sw.js")
    .then((reg) => {
      // Force an immediate update check so returning visitors pick up the
      // latest Portfolio OS build without a hard refresh.
      reg.update().catch(() => undefined);
      if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) {
            nw.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    })
    .catch(() => undefined);

  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });
}