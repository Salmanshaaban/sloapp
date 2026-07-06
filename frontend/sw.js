// Service Worker للتطبيق
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
});

self.addEventListener('fetch', (event) => {
  // تجاهل طلبات chrome-extension
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline', { status: 503 });
    })
  );
});