import { useState, useEffect } from 'react';
import { messaging } from '../firebaseInit';
import { getToken, onMessage } from "firebase/messaging";

const VAPID_KEY = 'BD2CEK6KUtnMxUtHGGi9S4tzOWY_c-s74AdmEUdkZyXF986JtsUXpTuZTLe7rTAVPnsh3jYvBe9zYNIbRi1Wwn8'; // Replace with your actual VAPID key

export function usePushNotifications(username) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (currentToken) {
              setToken(currentToken);
              setIsSubscribed(true);
              console.log(`Push notification token obtained for user: ${username}`);
              // Send the token to your server
              await sendTokenToServer(currentToken, username);
            } else {
              console.log('No registration token available. Request permission to generate one.');
            }
          } else {
            console.log('Notification permission denied');
          }
        }
      } catch (error) {
        console.error('An error occurred while initializing messaging', error);
      }
    };

    initializeMessaging();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      // Handle foreground messages here
    });

    return () => {
      unsubscribe();
    };
  }, [username]);

  const sendTokenToServer = async (token, username) => {
    try {
      // Replace this URL with your actual server endpoint
      const response = await fetch('http://localhost:4000/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, username }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Token sent to server successfully', data);
    } catch (error) {
      console.error('Error sending token to server:', error);
      throw new Error('Failed to send token to server');
    }
  };

  const unsubscribeUser = async () => {
    if (!token) return;

    try {
      await messaging.deleteToken(token);
      setIsSubscribed(false);
      setToken(null);

      console.log(`Attempting to unsubscribe user: ${username} from push notifications`);

      // Replace this URL with your actual server endpoint
      const response = await fetch('http://localhost:4000/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, username }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`User: ${username} successfully unsubscribed from push notifications`);
    } catch (error) {
      console.error('Error unsubscribing', error);
    }
  };

  return {
    isSubscribed,
    unsubscribeUser
  };
}

