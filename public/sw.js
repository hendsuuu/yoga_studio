const CACHE_NAME = "yoga-studio-v2";
const STATIC_ASSETS = [
  "/images/yoga.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || "",
      icon: data.icon || "/images/yoga.png",
      badge: data.badge || "/images/yoga.png",
      tag: data.tag || "yoga-notification",
      data: { url: data.url || "/dashboard" },
      vibrate: [100, 50, 100],
      actions: [
        { action: "open", title: "Buka Aplikasi" },
        { action: "dismiss", title: "Tutup" },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "Virtual Studio", options)
    );
  } catch {
    // Fallback for plain text payload
    event.waitUntil(
      self.registration.showNotification("Virtual Studio", {
        body: event.data.text(),
        icon: "/images/yoga.png",
      })
    );
  }
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});
