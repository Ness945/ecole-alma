const CACHE = "academie-content-v4";
const FILES = [
  "/",
  "/index.html",
  "/css/app.css",
  "/css/adventure.css",
  "/css/rpg.css",
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
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))),
);
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("academie-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      ),
  ),
);
self.addEventListener("fetch", (e) => {
  if (
    e.request.method !== "GET" ||
    new URL(e.request.url).origin !== self.location.origin
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
                ? caches.match("/index.html")
                : Response.error()),
          ),
      ),
  );
});
