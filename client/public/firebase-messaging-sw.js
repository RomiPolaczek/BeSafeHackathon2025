importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBb8RS48vrnAZuGsCL6K--OoGPhVb2vi9c",
  authDomain: "safe-chat-8e668.firebaseapp.com",
  projectId: "safe-chat-8e668",
  storageBucket: "safe-chat-8e668.appspot.com",
  messagingSenderId: "791225327847",
  appId: "1:791225327847:web:35989d107c0f0397644242",
  measurementId: "G-WVHH26QC13"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});

