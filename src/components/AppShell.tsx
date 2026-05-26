"use client"

import type { ReactNode } from "react"
import BottomNav from "@/components/BottomNav"

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="flex-1 pb-16 bg-[var(--bg)]">
        {children}
      </main>
      <BottomNav />
    </>
  )
}
