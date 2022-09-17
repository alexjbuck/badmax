importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js"
);

const cacheName = 'BadMaxCache_v2'

workbox.recipes.pageCache({cacheName})
workbox.recipes.imageCache({cacheName})
workbox.recipes.staticResourceCache({cacheName})