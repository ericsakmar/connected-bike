const SESSIONS_URL = "https://www.googleapis.com/fitness/v1/users/me/sessions";

self.addEventListener("fetch", (event) => {
  if (
    // only cache gets
    event.request.method !== "GET" ||
    // ...for google fit
    !event.request.url.startsWith("https://www.googleapis.com/fitness") ||
    // ...but not the sessions.
    // TODO if you're feeling fancy some day, do network-first requets for sessions
    event.request.url.startsWith(SESSIONS_URL)
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      if (cacheRes) {
        return cacheRes;
      }

      return fetch(event.request).then((res) => {
        // don't cache unsuccessful requests
        if (res.code !== 200) {
          return res;
        }

        return caches.open("v1").then((cache) => {
          cache.put(event.request, res.clone());
          return res;
        });
      });
    })
  );
});
