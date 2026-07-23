const CACHE_NAME = "ghana-connect-v1";

const FILES = [
  "/Ghana-Connect-/",
  "/Ghana-Connect-/index.html",
  "/Ghana-Connect-/style.css",
  "/Ghana-Connect-/script.js",
  "/Ghana-Connect-/logo.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => response || fetch(event.request))
  );
});
