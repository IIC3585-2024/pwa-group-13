// // Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
// import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging.js';

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCO-NBLLqUwoaZvevPtEi9NDInVaZfuJjM",
//   authDomain: "pwa-uc.firebaseapp.com",
//   projectId: "pwa-uc",
//   storageBucket: "pwa-uc.appspot.com",
//   messagingSenderId: "230226191544",
//   appId: "1:230226191544:web:95783b4e7c268e8c53804d"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// // Solicitar permiso para recibir notificaciones
// const requestPermission = async () => {
//   console.log('Solicitando permiso para notificaciones')
//   try {
//     const status = await Notification.requestPermission();
//     if (status === 'granted') {
//       const token = await getToken(messaging);
//       console.log('Token de notificación:', token);
//     } else {
//       console.log('Permiso no concedido para notificaciones');
//     }
//   } catch (error) {
//     console.error('Error al obtener permiso', error);
//   }
// };

window.addEventListener('load', async e => {

  if ('serviceWorker' in navigator) {
    // try {
    //   navigator.serviceWorker.register('serviceworker.js', { scope: '/' });
    //   console.log('SW registered');
    // } catch (error) {
    //   console.log('SW failed');

    // }
    navigator.serviceWorker.register('./firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service Worker registrado correctamente:', registration);
        return navigator.serviceWorker.ready;
      })
      .catch((error) => {
        console.error('Service Worker no pudo registrarse:', error);
      });
  }
});