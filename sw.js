// Service Worker بسيط بدون أخطاء
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // تجاهل كل طلبات chrome-extension نهائياً
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // تجاهل طلبات الـ API (حتى لا تتعارض مع تسجيل الدخول)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline', { status: 503 });
    })
  );
});