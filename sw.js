/* お買い物リスト PWA service worker
   アプリのデータ（localStorage）はここではなく端末のブラウザに保存されます。
   index.html などを更新したら、必ず下の CACHE の版を上げて sw.js も一緒に再アップロードすること。 */
const CACHE = "grocery-v13";   // ← 更新のたびに v2, v3… と上げる
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon/icon-192.png",
  "./icon/icon-512.png",
  "./icon/icon-512-maskable.png",
  "./icon/icon-180.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(hit => hit ||
    fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => { try { c.put(e.request, copy); } catch (_) {} });
      return resp;
    }).catch(() => caches.match("./index.html"))));
});
