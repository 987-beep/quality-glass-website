/* Owner Studio service worker — v1
   Strategy: network-first (always fresh data), falling back to cache when offline.
   Asset files cache-first. Auth/data API calls are NEVER cached. */
const CACHE = "owner-studio-v1";
const ASSET_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];
const NO_CACHE = ["/api/", "insforge", "auth"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/icons/icon-192.png"])));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (NO_CACHE.some((p) => url.href.includes(p))) return; // auth/api passthrough

  // static assets: cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/images/") ||
    ASSET_HOSTS.includes(url.host) ||
    /\.(png|jpe?g|webp|svg|woff2?)$/.test(url.pathname)
  ) {
    e.respondWith(
      caches.match(e.request).then((hit) =>
        hit ||
        fetch(e.request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        }).catch(() => caches.match("/icons/icon-192.png"))
      )
    );
    return;
  }

  // pages: network-first, cache fallback for offline
  if (e.request.mode === "navigate" || e.request.destination === "document") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
