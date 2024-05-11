const staticAssets = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './spliti.js',
  './db.js',
  // Íconos Android comunes
  './images/icons/android/android-launchericon-192-192.png',
  './images/icons/android/android-launchericon-512-512.png',
  // Íconos iOS comunes
  './images/icons/ios/144.png',
  './images/icons/ios/180.png',
  './images/icons/ios/152.png',
  './images/icons/ios/192.png',
  './images/icons/ios/512.png'
];

self.addEventListener('install', async event => {
  event.waitUntil(
    caches.open('static-pizza').then(cache => {
      return cache.addAll(staticAssets);
    })
  );
});

self.addEventListener('fetch', event => {
  const {request} = event;
  const url = new URL(request.url);
  if(url.origin === location.origin) {
      event.respondWith(cacheData(request));
  } else {
      event.respondWith(networkFirst(request));
  }

});

async function cacheData(request) {
  const cachedResponse = await caches.match(request);
  return cachedResponse || fetch(request);
}

async function networkFirst(request) {
  if (!['http:', 'https:', 'ftp:'].includes(new URL(request.url).protocol)) {
    return fetch(request);
  }
  const cache = await caches.open('dynamic-pizza');

  try {
      const response = await fetch(request);
      cache.put(request, response.clone());
      return response;
  } catch (error){
      return await cache.match(request);

  }



}
