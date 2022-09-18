importScripts("src/libraries/workbox-v6.5.4/workbox-sw.js");

workbox.setConfig({
    modulePathPrefix: "sites/badmax/src/libraries/workbox-v6.5.4/",
})

const cacheName = 'BadMaxCache_v2'

workbox.recipes.pageCache({cacheName})
workbox.recipes.imageCache({cacheName})
workbox.recipes.staticResourceCache({cacheName})