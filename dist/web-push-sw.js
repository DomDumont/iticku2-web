self.addEventListener("push", (event) => {
  const defaultPayload = {
    title: "Habit reminder",
    body: "Time for your habit.",
    url: self.registration.scope,
    tag: "habit-reminder",
  };

  let payload = defaultPayload;
  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...defaultPayload, ...parsed };
    } catch {
      const text = event.data.text();
      if (text) payload = { ...defaultPayload, body: text };
    }
  }

  const targetUrl = new URL(payload.url || self.registration.scope, self.registration.scope).href;

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      data: { url: targetUrl },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const rawUrl = event.notification && event.notification.data && event.notification.data.url;
  const targetUrl = new URL(rawUrl || self.registration.scope, self.registration.scope).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    }),
  );
});
