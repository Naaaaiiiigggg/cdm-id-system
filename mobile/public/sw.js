// CdM ID System: a small service worker.
// - Lets the browser treat the app as installable.
// - Keeps a copy of the app's own built files so repeat visits load faster.
// - If the internet is down, shows a friendly "You're offline" page instead of the browser error.
// It never touches Firebase or any other website: only files from this app's own address.

const VERSION = 'cdm-v1'; // change this number to force everyone onto a fresh cache
const SHELL = `shell-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const PRECACHE = ['/offline.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== ASSETS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Firebase, fonts, etc.: leave alone

  // Opening the app (a page navigation): always try the network first so people get the newest version.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/offline.html')));
    return;
  }

  // Built files have a hash in their name (it changes with every release), so a saved copy is always right.
  if (url.pathname.startsWith('/_expo/static/')) {
    event.respondWith(
      caches.open(ASSETS).then((cache) =>
        cache.match(req).then((hit) => hit || fetch(req).then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })),
      ),
    );
    return;
  }

  // Everything else from our own address (icons, manifest): network first, saved copy if offline.
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
