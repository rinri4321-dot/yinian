// 壹念 Service Worker — 轻量离线支持

const CACHE = "yinian-v3"

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return

  // 导航请求（页面跳转）— 网络优先，离线时回退缓存
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((cache) => cache.put(event.request, clone))
        return res
      }).catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match("/")
        })
      })
    )
    return
  }

  // API 请求不缓存
  if (event.request.url.includes("/api/")) return

  // 静态资源 — 网络优先，缓存兜底
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const url = event.request.url
        if (
          response.status === 200 &&
          (url.includes("/_next/") ||
            url.endsWith(".js") ||
            url.endsWith(".css") ||
            url.endsWith(".svg") ||
            url.endsWith(".png") ||
            url.endsWith(".ico"))
        ) {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => {
            cache.put(event.request, clone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(event.request)
      })
  )
})
