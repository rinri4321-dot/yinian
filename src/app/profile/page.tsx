"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Clock, Target, TrendingUp, Sparkles, LogOut } from "lucide-react"
import { formatDate, formatMinutes } from "@/lib/utils"

interface UserData {
  id: string
  email: string
  name: string
  avatar: string | null
  createdAt: string
}

interface Stats {
  totalDays: number
  totalFocus: number
  totalSessions: number
  doneDays: number
  avgClarity: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/profile/stats").then((r) => r.json()),
    ]).then(([authData, statsData]) => {
      setUser(authData.user)
      setStats(statsData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.push("/")
  }

  if (loading) {
    return (
      <div className="page-transition mx-auto max-w-lg px-5 py-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="skeleton h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton h-5 w-24 rounded" />
            <div className="skeleton h-4 w-32 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const initial = user?.name?.charAt(0) || "?"

  return (
    <div className="page-transition mx-auto max-w-lg px-5 py-10">
      {/* 未登录 */}
      {!user && (
        <div className="space-y-5 py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-card)]">
            <User className="h-7 w-7 text-[var(--fg-subtle)]" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-[var(--fg)]">登录后查看个人数据</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--fg-muted)]">
              记录你的专注历程，追踪成长轨迹
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push("/login")}
              className="btn-press rounded-xl bg-[var(--fg)] px-6 py-3 text-sm font-medium text-[var(--bg)] hover:opacity-80"
            >
              登录
            </button>
            <button
              onClick={() => router.push("/register")}
              className="btn-press rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-3 text-sm font-medium text-[var(--fg-secondary)] hover:bg-[var(--bg)]"
            >
              注册
            </button>
          </div>
        </div>
      )}

      {/* 已登录 */}
      {user && (
        <>
          {/* 头像 + 信息 */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--accent-bg)] text-xl font-bold text-[#eb9a4a]">
              {initial}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-[var(--fg)] truncate">{user.name}</h1>
              <p className="text-[13px] text-[var(--fg-muted)]">{user.email}</p>
              <p className="mt-0.5 text-[12px] text-[var(--fg-subtle)]">
                {formatDate(new Date(user.createdAt))} 加入
              </p>
            </div>
          </div>

          {/* 统计 */}
          {stats && (
            <div className="mb-8 grid grid-cols-2 gap-3">
              {[
                { icon: Target, label: "完成要事", value: `${stats.doneDays} 天`, color: "text-[#2d8a6e]" },
                { icon: Clock, label: "累计专注", value: formatMinutes(stats.totalFocus), color: "text-[var(--fg-secondary)]" },
                { icon: TrendingUp, label: "番茄钟", value: `${stats.totalSessions} 个`, color: "text-[var(--fg-secondary)]" },
                { icon: Sparkles, label: "壹指数均值", value: `${stats.avgClarity}`, color: "text-[#eb9a4a]" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                    <span className="text-[11px] text-[var(--fg-subtle)]">{s.label}</span>
                  </div>
                  <p className={`text-[1.25rem] font-semibold tracking-tight ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* 成就条 */}
          {stats && stats.doneDays >= 3 && (
            <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">成就</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {stats.doneDays >= 3 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--done-bg)] px-3 py-1.5 text-xs font-medium text-[#2d8a6e]">
                    连续 3 天完成要事
                  </span>
                )}
                {stats.totalFocus >= 600 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-bg)] px-3 py-1.5 text-xs font-medium text-[#eb9a4a]">
                    累计专注 10 小时
                  </span>
                )}
                {stats.totalSessions >= 20 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--tech-blue-bg)] px-3 py-1.5 text-xs font-medium text-[var(--tech-blue)]">
                    完成 20 个番茄钟
                  </span>
                )}
                {stats.avgClarity >= 70 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--tech-purple-bg)] px-3 py-1.5 text-xs font-medium text-[var(--tech-purple)]">
                    壹指数 70+ 俱乐部
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 退出 */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-3.5 text-sm text-[var(--fg-muted)] hover:text-[#e85d5d] transition-colors"
          >
            <LogOut className="h-4 w-4" />退出登录
          </button>
        </>
      )}
    </div>
  )
}
