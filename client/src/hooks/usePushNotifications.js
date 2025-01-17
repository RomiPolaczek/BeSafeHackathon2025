import { useState, useEffect } from 'react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(username) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(async (registration) => {
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          console.log(`Existing push subscription found for user: ${username}`);
          setIsSubscribed(true);
          setSubscription(existingSubscription);
        } else {
          console.log(`No existing push subscription found for user: ${username}`);
        }
      });
    }
  }, [username]);

  const subscribeUser = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'YOUR_PUBLIC_VAPID_KEY_HERE'
          )
        };

        const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
        setIsSubscribed(true);
        setSubscription(pushSubscription);

        console.log(`Attempting to subscribe user: ${username} to push notifications`);

        // Send the subscription to your server
        await fetch(`/subscribe?username=${encodeURIComponent(username)}`, {
          method: 'POST',
          body: JSON.stringify(pushSubscription),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log(`User: ${username} successfully subscribed to push notifications`);
        console.log('User is subscribed:', pushSubscription);
      } catch (error) {
        console.error('Failed to subscribe the user: ', error);
      }
    }
  };

  const unsubscribeUser = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setIsSubscribed(false);
      setSubscription(null);

      console.log(`Attempting to unsubscribe user: ${username} from push notifications`);

      // Inform your server about the unsubscription
      await fetch(`/unsubscribe?username=${encodeURIComponent(username)}`, {
        method: 'POST'
      });

      console.log(`User: ${username} successfully unsubscribed from push notifications`);
      console.log('User is unsubscribed');
    } catch (error) {
      console.error('Error unsubscribing', error);
    }
  };

  return {
    isSubscribed,
    subscribeUser,
    unsubscribeUser
  };
}

