// Portfolio OS offline cache — Explore, Legends, Landing pages, and their media.
const CACHE = "portfolio-os-cache-v5";
const OFFLINE_URLS = ["/", "/explore", "/legends", "/landing/portfolio-os", "/portfolio", "/portfolio-os", "/portfolio-os/suite"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(OFFLINE_URLS).catch(() => undefined)),
  );
  self.skipWaiting();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const p = url.pathname;
  const isCovered =
    p === "/" ||
    p.startsWith("/explore") ||
    p.startsWith("/legends") ||
    p.startsWith("/landing") ||
    p.startsWith("/portfolio");
  const isMedia = /\.(png|jpg|jpeg|webp|gif|svg|mp4|woff2?)$/i.test(url.pathname);
  if (!isCovered && !isMedia) return;

  event.respondWith(
    (async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, net.clone()).catch(() => undefined);
        return net;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        // navigation fallbacks
        if (p.startsWith("/explore")) { const f = await caches.match("/explore"); if (f) return f; }
        if (p.startsWith("/legends")) { const f = await caches.match("/legends"); if (f) return f; }
        if (p.startsWith("/landing")) { const f = await caches.match(req) || await caches.match("/"); if (f) return f; }
        if (p.startsWith("/portfolio")) { const f = await caches.match("/portfolio"); if (f) return f; }
        if (p === "/") { const f = await caches.match("/"); if (f) return f; }
        return new Response("Offline", { status: 503 });
      }
    })(),
  );
});