const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = [
  "./index.html",          // Página principal
  "./style.css",           // Estilos CSS
  "./app.js",              // Archivo JavaScript
  "./manifest.json",       // Archivo de manifiesto
  "./clima.png"     // Ruta de la imagen que quieres guardar en caché
];

// Instalación del Service Worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Agrega los archivos a caché
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación del Service Worker
self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Elimina los caches antiguos
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar solicitudes de red y devolver contenido desde el caché
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si el archivo está en caché, lo devuelve, si no, lo solicita a la red
      return response || fetch(event.request);
    })
  );
});
