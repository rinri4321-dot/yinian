"use client"

import { useEffect } from "react"

export default function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // 静默失败——离线缓存不是核心功能
      })
    }
  }, [])

  return null
}
