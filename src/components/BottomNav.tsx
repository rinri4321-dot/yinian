"use client"

import { useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Home, PenLine, TrendingUp, User } from "lucide-react"
import { playTick } from "@/lib/sounds"

const tabs = [
  { path: "/", label: "首页", icon: Home },
  { path: "/today", label: "今日", icon: PenLine },
  { path: "/insights", label: "洞察", icon: TrendingUp },
  { path: "/profile", label: "我的", icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const navigate = (path: string) => {
    if (pathname === path) return
    playTick()
    startTransition(() => {
      router.push(path)
    })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg-card)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || (tab.path === "/today" && pathname === "/today")
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`btn-press relative flex flex-col items-center gap-0.5 py-2.5 px-5 transition-all duration-200 ${
                isActive ? "text-[var(--fg)]" : "text-[var(--fg-subtle)] hover:text-[var(--fg-secondary)]"
              }`}
            >
              <Icon className="h-5 w-5 transition-all duration-200" strokeWidth={isActive ? 2.25 : 1.75} />
              <span className={`text-[11px] font-medium transition-all duration-200 ${isActive ? "scale-100" : "scale-95"}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 h-0.5 w-5 rounded-full bg-[var(--fg)] transition-all duration-200" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
