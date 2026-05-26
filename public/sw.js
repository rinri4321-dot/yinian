// 壹念 Service Worker — 轻量离线支持

const CACHE = "yinian-v3"

// 安装时只缓存静态资源，不缓存页面
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

// 网络优先：先请求网络，网络失败才用缓存
self.addEventListener("fetch", (event) => {
  // 只处理 GET 请求
  if (event.request.method !== "GET") return

  // API 请求不缓存
  if (event.request.url.includes("/api/")) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功：缓存静态资源（JS/CSS/图片/字体）
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
        // 网络失败：尝试缓存
        return caches.match(event.request)
      })
  )
})
