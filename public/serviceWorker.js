let isOnline = true;
const cacheName = `kudos-list`;

let urlsToCache = [
  "/",
  "/style.css",
  "/home.js"
]

const cacheFiles = async (forceFetch = false) => {
  var cache = await caches.open(cacheName);

  return Promise.all(
    urlsToCache.map(async (url) => {
      let res;

      if (!forceFetch) {
        res = await cache.match(url);
        if (res) {
          return;
        }
      }

      let options = {
        method: "GET",
        cache: "no-store",
        credentials: "omit"
      };
      res = await fetch(url, options);
      if (res.ok) {
        console.log(`Service worker speaking: we are ${isOnline ? 'online' : 'offline'}`)
        return cache.put(url,res);
      }
    })
  );
}

const router = async (req) => {
  let url = new URL(req.url);
  let reqURL = url.pathname;
  let cache = await caches.open(cacheName);
  let res;

  // 1. check online first
  if (isOnline) {
    try {
      let options = {
        method: req.method,
        headers: req.headers,
        cache: "no-store"
      };
      res = await fetch(req, options);

      if (res && res.ok) {
        await cache.put(reqURL, res.clone());
        return res;
      }
    }
    catch (err) {}
  } else {
    // 2. else check cache
    res = await cache.match(reqURL);
    if (res) {
      return res;
    } else {
      // 3. otherwise, return an offline-friendly page
      return cache.match("/offline");
    }
  }
}

const onFetch = (evt) => {
  evt.respondWith(router(evt. request));
}

const onInstall = (evt) => {
  self.skipWaiting();
}

const handleActivation = async () => {
  await cacheFiles(true);
  await clients.claim();
}

const onActivate = (evt) => {
  evt.waitUntil(handleActivation());
}

const onMessage = ({ data }) => {
  if ("isOnline" in data) {
    isOnline = data.isOnline;
    console.log(`Service worker speaking: we are ${isOnline ? 'online' : 'offline'}`)
  }
}

self.addEventListener("install",onInstall);
self.addEventListener("activate",onActivate);
self.addEventListener("fetch", onFetch);
self.addEventListener("message",onMessage);

const main = async () => {
  await cacheFiles();
}
main();
