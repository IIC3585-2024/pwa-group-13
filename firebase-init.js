// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
// import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCO-NBLLqUwoaZvevPtEi9NDInVaZfuJjM",
  authDomain: "pwa-uc.firebaseapp.com",
  projectId: "pwa-uc",
  storageBucket: "pwa-uc.appspot.com",
  messagingSenderId: "230226191544",
  appId: "1:230226191544:web:95783b4e7c268e8c53804d"
};

export const vapidKey = 'BIvxT8xTdNMuSTTXaEaDge17n891puqIKwmW580BoIeUJNpkPrlWaFa7DFuejeV3r_6GAhy7JeaaQDMGYAYCRWg';

// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);
// En otro archivo o en el mismo archivo después de la exportación
// if (Notification.permission === 'default') {
//   Notification.requestPermission().then(permission => {
//     if (permission === 'granted') {
//       console.log('Permiso concedido para notificaciones');
//       getToken(messaging, { vapidKey: 'BIvxT8xTdNMuSTTXaEaDge17n891puqIKwmW580BoIeUJNpkPrlWaFa7DFuejeV3r_6GAhy7JeaaQDMGYAYCRWg' }).then((token) => {
//         console.log('Token de dispositivo:', token);
//         // Aquí podrías enviar el token a tu servidor si lo necesitas
//       }).catch((err) => {
//         console.error('No se pudo obtener el token', err);
//       });
//     } else {
//       console.log('Permiso de notificación denegado');
//     }
//   }).catch((err) => {
//     console.error('No se pudo obtener el permiso para notificaciones', err);
//   });
// } else if (Notification.permission === 'granted') {
//   getToken(messaging, { vapidKey: 'BIvxT8xTdNMuSTTXaEaDge17n891puqIKwmW580BoIeUJNpkPrlWaFa7DFuejeV3r_6GAhy7JeaaQDMGYAYCRWg' }).then((token) => {
//     console.log('Token de dispositivo:', token);
//     // Aquí podrías enviar el token a tu servidor si lo necesitas
//   }).catch((err) => {
//     console.error('No se pudo obtener el token', err);
//   });
// } else {
//   console.log('Permiso de notificación denegado previamente');
// }

// function getTokenReady() {
//   return getToken(messaging, { vapidKey: 'BIvxT8xTdNMuSTTXaEaDge17n891puqIKwmW580BoIeUJNpkPrlWaFa7DFuejeV3r_6GAhy7JeaaQDMGYAYCRWg' });
// }

// export { getTokenReady };
