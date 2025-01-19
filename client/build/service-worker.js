self.addEventListener('push', function(event) {
    const data = event.data.json();
    const title = 'New message from ' + data.sender;
    const options = {
      body: data.message,
      icon: '/icon.png',
      badge: '/badge.png'
    };
    event.waitUntil(self.registration.showNotification(title, options));
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('/')
    );
  });
  
  