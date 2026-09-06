// Service worker — push notifications only.
//
// Deliberately does NOT cache anything. A caching service worker is a separate
// decision with a much worse failure mode: a bug there pins every visitor to a
// stale build until the worker updates, and they cannot clear it themselves.
// Push needs a service worker to exist; it does not need one that intercepts
// fetches, so this one doesn't.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  // Payloads are sent as JSON, but a push with no body or a malformed one must
  // still produce a notification: iOS revokes push permission from a site that
  // receives a push and shows nothing.
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'RecruitGrid', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      // Collapses repeats: a second reminder about the same camp replaces the
      // first rather than stacking a second banner on someone's lock screen.
      tag: data.tag || undefined,
      data: { url: data.url || '/app' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/app';

  event.waitUntil(
    (async () => {
      // Focus an already-open tab rather than opening a second one. Someone who
      // taps a reminder while the app is open should land in the app they have,
      // not a duplicate.
      const open = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of open) {
        if (client.url.includes(target) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })()
  );
});
