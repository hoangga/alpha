/* Nhật ký giao dịch — service worker: chạy được cả khi mất mạng */
var CACHE = 'nkgd-v4';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function fromNetwork(req) {
  return fetch(req).then(function (res) {
    if (res && res.ok) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
    }
    return res;
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  // Trang HTML: ưu tiên mạng để luôn có bản mới, mất mạng thì dùng bản đã lưu.
  var isPage = req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') > -1;
  if (isPage) {
    e.respondWith(
      fromNetwork(req).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match('./index.html'); });
      })
    );
    return;
  }

  // Icon, manifest…: dùng bản đã lưu cho nhanh, đồng thời cập nhật ngầm.
  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fromNetwork(req).catch(function () { return hit; });
      return hit || net;
    })
  );
});
