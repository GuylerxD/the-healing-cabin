// Service Worker for The Healing Cabin PWA & Web Push Notifications
const CACHE_NAME = "healing-cabin-v5";
const APP_URL = "/the-healing-cabin/";
const SNOOZE_MS = 10 * 60 * 1000;
const DEFAULT_PILL_TITLE = "תזכורת גלולת זואלי 💊";
const DEFAULT_PILL_BODY =
  "הזמן היומי שלך לקחת גלולת זואלי (Zoely) לאיזון הורמונלי ובריאות ✨";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Cache & network strategy
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request)),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const copy = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
      );
    }),
  );
});

// Push notification received from Web Push server
self.addEventListener("push", (event) => {
  let data = {
    title: DEFAULT_PILL_TITLE,
    body: DEFAULT_PILL_BODY,
    icon: "/the-healing-cabin/icon-192.png",
    badge: "/the-healing-cabin/icon-192.png",
    tag: "qlaira-reminder",
    data: { url: "/the-healing-cabin/" },
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text() || DEFAULT_PILL_BODY;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/the-healing-cabin/icon-192.png",
    badge: data.badge || "/the-healing-cabin/icon-192.png",
    dir: "rtl",
    lang: "he",
    tag: data.tag || "qlaira-reminder",
    renotify: true,
    vibrate: [200, 100, 200],
    data: data.data || { url: "/the-healing-cabin/" },
    actions: [
      { action: "taken", title: "לקחתי! ✨" },
      { action: "snooze", title: "הזכר לי בעוד 10 דק'" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click behavior
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    (event.notification.data && event.notification.data.url) ||
    "/the-healing-cabin/";

  if (event.action === "taken") {
    // Tell open app windows; if none is open, open the app so it records the pill on load.
    event.waitUntil(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          if (clientList.length) {
            for (const client of clientList) {
              client.postMessage({ type: "QLAIRA_PILL_TAKEN" });
            }
            return;
          }
          if (self.clients.openWindow) {
            return self.clients.openWindow(`${APP_URL}?pillTaken=1`);
          }
        }),
    );
    return;
  }

  if (event.action === "snooze") {
    // Open app windows schedule the re-reminder themselves. With no window open, the browser may
    // stop this worker before 10 minutes pass, so this fallback is best effort only.
    event.waitUntil(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          if (clientList.length) {
            for (const client of clientList) {
              client.postMessage({ type: "QLAIRA_PILL_SNOOZE" });
            }
            return;
          }
          return new Promise((resolve) => setTimeout(resolve, SNOOZE_MS)).then(
            () =>
              self.registration.showNotification(DEFAULT_PILL_TITLE, {
                body: DEFAULT_PILL_BODY,
                icon: `${APP_URL}icon-192.png`,
                badge: `${APP_URL}icon-192.png`,
                dir: "rtl",
                lang: "he",
                tag: "qlaira-reminder",
                renotify: true,
                data: { url: APP_URL },
                actions: [
                  { action: "taken", title: "לקחתי! ✨" },
                  { action: "snooze", title: "הזכר לי בעוד 10 דק'" },
                ],
              }),
          );
        }),
    );
    return;
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes("the-healing-cabin") && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});

// Communication with client App (e.g. Test push trigger or manual dispatch)
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "TRIGGER_QLAIRA_NOTIFICATION") {
    const title = event.data.title || DEFAULT_PILL_TITLE;
    const options = {
      body: event.data.body || DEFAULT_PILL_BODY,
      icon: "/the-healing-cabin/icon-192.png",
      badge: "/the-healing-cabin/icon-192.png",
      dir: "rtl",
      lang: "he",
      tag: "qlaira-reminder",
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: "/the-healing-cabin/" },
      actions: [
        { action: "taken", title: "לקחתי! ✨" },
        { action: "snooze", title: "הזכר לי בעוד 10 דק'" },
      ],
    };

    self.registration.showNotification(title, options);
  }
});
