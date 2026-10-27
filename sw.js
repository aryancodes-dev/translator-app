// Translator App v20 — cache with skipWaiting + old-cache delete.
const CACHE = "translator-v20";
const FILES = ["./", "./index.html", "./style.css", "./app.js", "./favicon.svg", "./manifest.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); });
self.addEventListener("fetch", e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match("./index.html")))); });
