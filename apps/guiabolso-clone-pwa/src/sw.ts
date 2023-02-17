import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

cleanupOutdatedCaches()

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('message', (event) => {
  console.log('[sw] ', event)
    if (event.data && event.data.type === 'SKIP_WAITING')
      self.skipWaiting()
})