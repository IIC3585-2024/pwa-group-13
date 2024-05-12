import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getMessaging, onMessage } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging.js';

const firebaseConfig = {
  apiKey: "AIzaSyCO-NBLLqUwoaZvevPtEi9NDInVaZfuJjM",
  authDomain: "pwa-uc.firebaseapp.com",
  projectId: "pwa-uc",
  storageBucket: "pwa-uc.appspot.com",
  messagingSenderId: "230226191544",
  appId: "1:230226191544:web:95783b4e7c268e8c53804d"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onMessage(messaging, (payload) => {
  // const title = payload.notification.title;
  const title = 'Notificación firebase.js';
  const options = {
    body: payload.notification.body,
    icon: payload.notification.image
  };
  console.log('Mostrando notificación:', title, options);
  // new Notification(title, options);
});
