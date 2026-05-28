"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import BottomNav from "@/components/BottomNav"

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideNav = pathname === "/login" || pathname === "/register"

  return (
    <>
      <main className={`flex-1 ${hideNav ? "" : "pb-16"} bg-[var(--bg)]`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </>
  )
}
