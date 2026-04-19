const CACHE_NAME = 'gestionale-lavori-v5.4'; // <--- CAMBIATO A V5.4
const assets = [
  './',
  './index.html',
  './manifest.json',
  './icona.png', 
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-database-compat.js'
];

// 1. INSTALLAZIONE: Forza l'attivazione immediata
self.addEventListener('install', evt => {
  self.skipWaiting(); // <--- IMPORTANTE: Forza il nuovo SW a prendere il comando
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching assets nuovi...');
      return cache.addAll(assets);
    })
  );
});

// 2. ATTIVAZIONE: Elimina TUTTE le vecchie cache (v1, v2, ecc.)
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim()) // Prende il controllo delle schede aperte
  );
});

// 3. FETCH: Strategia "Network First" per Firebase (Prendi dal web, se fallisce usa cache)
self.addEventListener('fetch', evt => {
  // Non cachiamo le chiamate al database Firebase, solo i file statici
  if (evt.request.url.includes('firebaseio.com') || evt.request.url.includes('googleapis')) {
    return; 
  }

  evt.respondWith(
    fetch(evt.request).catch(() => {
      return caches.match(evt.request);
    })
  );
});