importScripts("src/libraries/workbox-sw.js");
// importScripts("src/libraries/workbox-cacheable-response.prod.js")
// importScripts("src/libraries/workbox-recipes.prod.js")

const cacheName = 'BadMaxCache_v2'

workbox.recipes.pageCache({cacheName})
workbox.recipes.imageCache({cacheName})
workbox.recipes.staticResourceCache({cacheName})