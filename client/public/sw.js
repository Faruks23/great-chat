const CACHE_NAME = 'great-chat-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/chat',
  '/manifest.webmanifest',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())))).then(() => self.clients.claim())
  );
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Great Chat';
  const options = {
    body: data.body || 'You have a new message',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    data: data.data || { url: '/chat' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  // Network first for API calls
  if (request.url.includes('/api') || request.method !== 'GET') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache first for navigation and static assets
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
      const cloned = resp.clone();
      // Only cache http/https requests (not chrome-extension, etc)
      if (request.url.startsWith('http://') || request.url.startsWith('https://')) {
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
      }
      return resp;
    })).catch(() => caches.match('/'))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};
  const targetUrl = notificationData.url || '/chat';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/chat') && 'focus' in client) {
          return client.navigate(targetUrl).then(() => client.focus());
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
