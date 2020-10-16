self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (!event.request.url.startsWith("https://www.googleapis.com/fitness")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      // TODO check age?
      if (cacheRes) {
        return cacheRes;
      }

      return fetch(event.request).then((res) => {
        return caches.open("v1").then((cache) => {
          cache.put(event.request, res.clone());
          return res;
        });
      });
    })
  );
});
