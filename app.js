import { getMessaging, onMessage, getToken } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { firebaseConfig, vapidKey } from "./firebase-init.js"; // Asegúrate de exportar firebaseConfig

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

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

// Manejo de mensajes mientras la app está abierta en primer plano
onMessage(messaging, function(payload) {
  console.log('Mensaje recibido en primer plano', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
      body: payload.notification.body,
      icon: './images/pizza.png'
  };
  new Notification(notificationTitle, notificationOptions);
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./serviceworker.js')
    .then((registration) => {
      console.log('Service Worker registrado correctamente:', registration);
      return navigator.serviceWorker.ready;
    })
    .then((registration) => {
      console.log('Service Worker activo:', registration);
      return Notification.requestPermission();
    })
    .then((permission) => {
      if (permission === 'granted') {
        console.log('Permiso concedido para notificaciones');
        getToken(messaging, { vapidKey: vapidKey })
          .catch((err) => {
            console.log(err.toString().includes('AbortError'));
            const error = "AbortError: Failed to execute 'subscribe' on 'PushManager': Subscription failed - no active Service Worker";
            if (err.toString() === error) {
              // wait for the service worker to be ready

              return new Promise((resolve, reject) => {
                const interval = setInterval(() => {
                  if (navigator.serviceWorker.controller) {
                    clearInterval(interval);
                    resolve();
                  }
                }, 1000);
              })
            } else {
              throw err;
            }
          })
          .then(() => {
            return getToken(messaging, { vapidKey: vapidKey });
          })
          .then((currentToken) => {
            if (currentToken) {
              console.log(currentToken);
              return saveToken(currentToken);
            } else {
              console.log(
                'No Instance ID token available. Request permission to generate one.'
              );
              return null;
            }
          })
          .catch((err) => {
            console.log("Error2")
            console.error(err);
          });
      } else {
        console.error('Permiso denegado para notificaciones');
        throw new Error('Permiso denegado por el usuario');
      }
    })
    .catch((error) => {
      console.error('Service Worker no pudo registrarse:', error);
    });
}