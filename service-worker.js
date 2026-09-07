const CACHE='santi-arcade-v0.2.0';
const FILES=['./','./index.html','./css/styles.css','./js/app.js','./manifest.json','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./assets/city-panorama.webp','./assets/hero-0.webp','./assets/hero-1.webp','./assets/hero-2.webp','./assets/hero-3.webp','./assets/hero-4.webp','./assets/hero-5.webp','./assets/hero-6.webp','./assets/hero-7.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match('./index.html'))));});
