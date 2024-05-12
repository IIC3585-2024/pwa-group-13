const staticAssets = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './spliti.js',
  './db.js',
  './firebase-messaging-sw.js',
  './firebase-init.js',
  './images/pizza.png',
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
  console.log('Handling fetch event for', event.request.url);

  if (!event.request.url.startsWith('http')) {
    // console.log('Request not handled because it is not HTTP:', event.request.url);
    return; // No manejar solicitudes de otros esquemas
  }
  
  event.respondWith(
    // Primero intentar por la red, si falla, intentar desde la caché
    fetch(event.request)
      .catch(() => {
        console.log('Not found in network. Trying cache...')
        return caches.match(event.request)
      })
    );
  //   caches.match(event.request)
  //     .then(function(response) {
  //       if (response) {
  //         console.log('Found response in cache:', response);
  //         return response;
  //       }

  //       console.log('No response found in cache. About to fetch from network...');
  //       return fetch(event.request).then(
  //         function(response) {
  //           console.log('Response from network is:', response);

  //           if(!response || response.status !== 200 || response.type !== 'basic') {
  //             return response;
  //           }

  //           console.log('Caching the response to', event.request.url);
  //           var responseToCache = response.clone();

  //           caches.open('static-pizza')
  //             .then(function(cache) {
  //               cache.put(event.request, responseToCache);
  //             });

  //           return response;
  //         }
  //       );
  //     })
  // );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// self.addEventListener('install', async event => {
//   event.waitUntil(
//     caches.open('static-pizza').then(cache => {
//       return cache.addAll(staticAssets);
//     })
//   );
// });

// self.addEventListener('fetch', event => {
//   const {request} = event;
//   const url = new URL(request.url);
//   if(url.origin === location.origin) {
//       event.respondWith(cacheData(request));
//   } else {
//       event.respondWith(networkFirst(request));
//   }

// });

// async function cacheData(request) {
//   const cachedResponse = await caches.match(request);
//   return cachedResponse || fetch(request);
// }

// async function networkFirst(request) {
//   if (!['http:', 'https:', 'ftp:'].includes(new URL(request.url).protocol)) {
//     return fetch(request);
//   }
//   const cache = await caches.open('dynamic-pizza');

//   try {
//       const response = await fetch(request);
//       cache.put(request, response.clone());
//       return response;
//   } catch (error){
//       return await cache.match(request);

//   }



// }
