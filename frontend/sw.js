const CACHE_PREFIX = `academie-${self.registration.scope}-`;
const CACHE = `${CACHE_PREFIX}content-v7`;
const scopedUrl = (path) => new URL(path.replace(/^\//, ""), self.registration.scope).href;
const FILES = [
  "/",
  "/index.html",
  "/css/app.css",
  "/css/adventure.css",
  "/css/rpg.css",
  "/css/market.css",
  "/css/discovery.css",
  "/js/market.js",
  "/js/discovery.js",
  "/js/discovery-bank.js",
  "/js/discovery-model.js",
  "/js/discovery-ui.js",
  "/js/rpg.js",
  "/js/rpg-ui.js",
  "/js/lessons.js",
  "/js/expansion.js",
  "/js/exercises-v03.js",
  "/js/adventure.js",
  "/assets/kingdom-bridge-0.svg",
  "/assets/kingdom-bridge-1.svg",
  "/assets/kingdom-bridge-2.svg",
  "/assets/kingdom-bridge-3.svg",
  "/js/app.js",
  "/js/core.js",
  "/js/content.js",
  "/js/exercises.js",
  "/assets/icon.svg",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
  "/assets/kingdom.svg",
  "/manifest.webmanifest",
];
self.addEventListener("install", (e) =>
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map(scopedUrl)))),
);
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      ),
  ),
);
self.addEventListener("fetch", (e) => {
  if (
    e.request.method !== "GET" ||
    !e.request.url.startsWith(self.registration.scope)
  )
    return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() =>
        caches
          .match(e.request)
          .then(
            (r) =>
              r ||
              (e.request.mode === "navigate"
                ? caches.match(scopedUrl("/index.html"))
                : Response.error()),
          ),
      ),
  );
});
