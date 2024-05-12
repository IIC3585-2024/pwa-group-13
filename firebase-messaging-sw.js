importScripts('https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCO-NBLLqUwoaZvevPtEi9NDInVaZfuJjM",
  authDomain: "pwa-uc.firebaseapp.com",
  projectId: "pwa-uc",
  storageBucket: "pwa-uc.appspot.com",
  messagingSenderId: "230226191544",
  appId: "1:230226191544:web:95783b4e7c268e8c53804d"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();


messaging.onBackgroundMessage(function(payload) {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
      body: payload.notification.body,
      icon: './images/pizza.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
