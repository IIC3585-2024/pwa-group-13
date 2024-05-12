const staticAssets = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './spliti.js',
  './db.js',
  './firebase-messaging-sw.js',
  './serviceworker.js',
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
    console.log('Request not handled because it is not HTTP:', event.request.url);
    return; // No manejar solicitudes de otros esquemas
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          console.log('Found response in cache:', response);
          return response;
        }

        console.log('No response found in cache. About to fetch from network...');
        return fetch(event.request).then(
          function(response) {
            console.log('Response from network is:', response);

            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            console.log('Caching the response to', event.request.url);
            var responseToCache = response.clone();

            caches.open('static-pizza')
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// self.addEventListener('fetch', event => {
//   const {request} = event;
//   const url = new URL(request.url);
//   if(url.origin === location.origin) {
//       event.respondWith(cacheData(request));
//   } else {
//       event.respondWith(networkFirst(request));
//   }

// });

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


importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SplitDB", 1);
    request.onupgradeneeded = function() {
      const db = request.result;
      if (!db.objectStoreNames.contains("tokens")) {
        db.createObjectStore("tokens", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToken(token) {
  const db = await openDB();
  const tx = db.transaction("tokens", "readwrite");
  const store = tx.objectStore("tokens");
  await store.put({ id: "userToken", token: token });
  return tx.complete;
}


const firebaseConfig = {
  apiKey: "AIzaSyCO-NBLLqUwoaZvevPtEi9NDInVaZfuJjM",
  authDomain: "pwa-uc.firebaseapp.com",
  projectId: "pwa-uc",
  storageBucket: "pwa-uc.appspot.com",
  messagingSenderId: "230226191544",
  appId: "1:230226191544:web:95783b4e7c268e8c53804d"
};
firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging();

//console.log(messaging.getToken())
messaging.getToken().then(async (token)=> {
  console.log(token);
  await saveToken(token);
})

messaging.setBackgroundMessageHandler(function(payload) {
  // const title = payload.notification.title;
  const title = 'Notificación firebase-messaging-sw.js';
  const options = {
    body: payload.notification.body,
    icon: payload.notification.image
  };
  console.log('Mostrando notificación:', title, options);
  // new Notification(title, options);
});

