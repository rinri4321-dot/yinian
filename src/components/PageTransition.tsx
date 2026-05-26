"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState, useRef, type ReactNode } from "react"

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const prevPathname = useRef(pathname)

  useEffect(() => {
    // 首次挂载：直接显示
    if (!mounted) {
      setMounted(true)
      prevPathname.current = pathname
      return
    }

    // 路由未变：不做任何事
    if (prevPathname.current === pathname) return

    // 路由变化：已由 AppShell 的 key 触发 React 重新挂载
    // 这里不需要额外处理
    prevPathname.current = pathname
  }, [pathname, mounted])

  return (
    <div className="page-transition min-h-full">
      {children}
    </div>
  )
}
