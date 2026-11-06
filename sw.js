/* Burbujas de Lau · service worker
   Pensado para conexiones lentas e intermitentes (Cuba):
   - El catálogo y las fotos se sirven desde el caché tras la primera visita.
   - El HTML y catalog.js se piden a la red primero (para ver precios nuevos),
     con reserva en caché si no hay datos o la red tarda más de 5 s. */
const VERSION = 'bdl-v1';
const CORE = [
  './', 'index.html', 'catalog.js', 'site.webmanifest',
  'fonts/inter-var.woff2', 'fonts/fugaz-one-400.woff2',
  'fonts/jetbrains-mono-400.woff2', 'fonts/playfair-display-500-italic.woff2', 'fonts/caveat-600.woff2',
  'img/hero-800.webp', 'img/hero-1200.webp', 'img/hero.webp', 'img/hero.jpg',
  'img/p1-480.webp', 'img/p2-480.webp', 'img/p3-480.webp', 'img/p4-480.webp', 'img/p5-480.webp',
  'img/atelier-600.webp'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // addAll falla entero si un archivo falla: los guardamos uno a uno
    await Promise.all(CORE.map((u) => cache.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

function redPrimero(req, timeout = 5000) {
  return new Promise((resolve) => {
    const timer = setTimeout(async () => {
      const hit = await caches.match(req, { ignoreSearch: true });
      resolve(hit || fetch(req));
    }, timeout);
    fetch(req).then((res) => { clearTimeout(timer); resolve(res); })
              .catch(async () => { clearTimeout(timer); resolve((await caches.match(req, { ignoreSearch: true })) || Response.error()); });
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.includes('admin')) return;           // el panel nunca se cachea

  if (req.mode === 'navigate' || /catalog\.js$/.test(url.pathname)) {
    e.respondWith((async () => {
      const res = await redPrimero(req);
      if (res && res.ok && res.type !== 'error') {
        const cache = await caches.open(VERSION);
        cache.put(req, res.clone());
      }
      return res;
    })());
    return;
  }

  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && res.ok) (await caches.open(VERSION)).put(req, res.clone());
      return res;
    } catch (err) {
      return new Response('', { status: 504, statusText: 'Sin conexión' });
    }
  })());
});
