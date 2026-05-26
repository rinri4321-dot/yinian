"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "登录失败")
      setLoading(false)
      return
    }

    router.push("/profile")
  }

  return (
    <div className="page-transition mx-auto max-w-lg px-5 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-bg)]">
          <Sparkles className="h-7 w-7 text-[#eb9a4a]" />
        </div>
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-[var(--fg)]">欢迎回来</h1>
        <p className="mt-2 text-[15px] text-[var(--fg-muted)]">登录你的壹念账号</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--fg-secondary)]">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 text-sm shadow-sm placeholder:text-[var(--fg-subtle)] focus:border-[var(--fg-muted)] focus:outline-none"
            placeholder="your@email.com"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--fg-secondary)]">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 text-sm shadow-sm placeholder:text-[var(--fg-subtle)] focus:border-[var(--fg-muted)] focus:outline-none"
            placeholder="至少 6 位"
            required
            minLength={6}
          />
        </div>

        {error && (
          <p className="text-[13px] text-[#e85d5d]">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-press flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--fg)] py-3.5 text-sm font-medium text-[var(--bg)] hover:opacity-80 disabled:opacity-30"
        >
          {loading ? "登录中…" : "登录"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[var(--fg-subtle)]">
        还没有账号？{" "}
        <Link href="/register" className="font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)]">
          注册
        </Link>
      </p>
    </div>
  )
}
