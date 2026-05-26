"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { formatDate, formatMinutes } from "@/lib/utils"
import ReviewModal from "@/components/ReviewModal"
import Toast from "@/components/Toast"
import ClarityGauge from "@/components/ClarityGauge"
import ShareModal from "@/components/ShareModal"
import Celebration from "@/components/Celebration"
import ThemeToggle from "@/components/ThemeToggle"
import { Sparkles, ArrowRight, CheckCircle2, Sunrise, Sun, Moon, Lightbulb, ArrowUpRight, User } from "lucide-react"

const QUOTES = [
  { text: "完成比完美重要。", author: null },
  { text: "你不需要看到整个楼梯，只需要迈出第一步。", author: "马丁·路德·金" },
  { text: "焦虑的反面不是平静，是行动。", author: null },
  { text: "做最少的事，得到最多的结果。", author: "加里·凯勒" },
  { text: "大脑是用来产生想法的，不是用来储存想法的。", author: "大卫·艾伦" },
  { text: "如果你只有 5 分钟，那就做 5 分钟。开始就赢了。", author: null },
  { text: "同时追两只兔子，一只也抓不到。", author: "俄罗斯谚语" },
  { text: "每天只做一件事，一年就是 365 件事。", author: null },
]

interface TodayData {
  date: string
  oneThing: string | null
  oneThingWhy: string | null
  intentFull: string | null
  focusMinutes: number
  focusSessions: number
  oneThingDone: string | null
  reviewDone1: string | null
  suggestedFromYesterday: string | null
  weeklySnapshot: { doneDays: number; totalFocus: number; totalDays: number }
  clarity?: { score: number; label: string }
}

export default function HomePage() {
  const router = useRouter()
  const [data, setData] = useState<TodayData | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState("")
  const [showShare, setShowShare] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem("celebrate") === "true") {
      sessionStorage.removeItem("celebrate")
      setShowCelebration(true)
    }
  }, [])

  const quote = useMemo(() => {
    const d = new Date()
    const idx = (d.getFullYear() * 100 + d.getMonth() * 31 + d.getDate()) % QUOTES.length
    return QUOTES[idx]
  }, [])

  useEffect(() => {
    fetch("/api/focus")
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleReviewSubmit = async (review: {
    done1: string; better: string; nextOne: string; mood: number
  }) => {
    await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    })
    setData((prev) => (prev ? { ...prev, reviewDone1: review.done1 } : prev))
    setToast("回顾已保存")
  }

  const hasPlan = !!data?.oneThing
  const hasDone = !!data?.oneThingDone
  const hasReviewed = !!data?.reviewDone1
  const hasSuggestion = !hasPlan && !!data?.suggestedFromYesterday

  const hour = new Date().getHours()
  const GreetingIcon = hour < 12 ? Sunrise : hour < 18 ? Sun : Moon
  const greetingText =
    hour < 9 ? "早上好" : hour < 12 ? "上午好" : hour < 14 ? "中午好" : hour < 18 ? "下午好" : "晚上好"

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-5 py-12">
        <div className="mb-2 flex items-center justify-between">
          <div className="skeleton h-5 w-20 rounded" />
          <div className="skeleton h-4 w-24 rounded" />
        </div>
        <div className="mb-8 skeleton h-16 w-full rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-20 w-full rounded-2xl" />
          <div className="skeleton h-14 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-12">
      {/* 顶部 */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-bg)]">
            <GreetingIcon className="h-5 w-5 text-[#eb9a4a]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[15px] font-medium text-[var(--fg-secondary)]">{greetingText}</p>
            {data?.clarity && (
              <p className="text-[11px] text-[var(--fg-subtle)]">壹指数 {data.clarity.score} · {data.clarity.label}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data?.clarity && (
            <div className="flex flex-col items-center">
              <ClarityGauge score={data.clarity.score} label="" />
              <span className="mt-0.5 text-[10px] font-medium text-[var(--fg-subtle)]">壹指数</span>
            </div>
          )}
          <ThemeToggle />
          <button onClick={() => router.push("/profile")} className="rounded-full p-1 text-[var(--fg-subtle)] hover:text-[var(--fg-secondary)] transition-colors" title="个人中心">
            <User className="h-4 w-4" />
          </button>
          <p className="text-[13px] text-[var(--fg-subtle)]">{formatDate(new Date())}</p>
        </div>
      </div>

      {/* 每日格言 */}
      <div className="mb-8 flex items-start gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3.5 shadow-sm card-hover">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#eb9a4a]" />
        <div>
          <p className="text-[14px] leading-relaxed text-[var(--fg-secondary)]">{quote.text}</p>
          {quote.author && <p className="mt-1 text-[11px] text-[var(--fg-subtle)]">—— {quote.author}</p>}
        </div>
      </div>

      {/* ─── 状态 A：无计划 ─── */}
      {!hasPlan && (
        <div className="space-y-5">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--fg)]">
              准备好开始新的一天
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--fg-secondary)]">
              花 2 分钟清空大脑，找到今天<span className="font-medium text-[var(--fg)]">唯一</span>重要的一件事。
            </p>
          </div>

          {hasSuggestion && data?.suggestedFromYesterday && (
            <button
              onClick={() => router.push(`/today?suggest=${encodeURIComponent(data!.suggestedFromYesterday!)}`)}
              className="card-hover btn-press w-full rounded-2xl border border-[var(--accent-bg)] bg-[var(--accent-bg)]/60 p-4 text-left hover:border-[#eb9a4a] hover:bg-[var(--accent-bg)]"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#eb9a4a]" />
                <span className="text-[11px] font-medium text-[var(--fg-subtle)]">昨晚你定下的</span>
              </div>
              <p className="mt-1.5 text-[15px] font-medium text-[var(--fg)]">{data.suggestedFromYesterday}</p>
              <div className="mt-2 flex items-center gap-1 text-[13px] text-[#eb9a4a]">
                就用这个 → <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </button>
          )}

          <div className="rounded-2xl bg-[var(--bg-card)] p-5 shadow-sm geo-texture">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg)]">
                <Sparkles className="h-5 w-5 text-[#eb9a4a]" />
              </div>
              <div className="text-[13px] leading-relaxed text-[var(--fg-muted)]">
                大脑同时装太多事会触发焦虑。
                <br />写出来，挑一件，你会发现轻松很多。
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/today")}
            className="btn-press flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--fg)] py-3.5 text-sm font-medium text-[var(--bg)] hover:opacity-80"
          >
            <Sparkles className="h-4 w-4" /> 开始清空大脑
          </button>

          {data?.weeklySnapshot && data.weeklySnapshot.totalDays > 0 && (
            <div className="flex items-center justify-center gap-1 text-[12px] text-[var(--fg-subtle)]">
              <span>本周已完成 {data.weeklySnapshot.doneDays}/{data.weeklySnapshot.totalDays} 天</span>
              <span>·</span><span>{formatMinutes(data.weeklySnapshot.totalFocus)}</span>
            </div>
          )}

        </div>
      )}

      {/* ─── 状态 B：有计划未完成 ─── */}
      {hasPlan && !hasDone && (
        <div className="space-y-5">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--fg)]">
              今天的唯一要事
            </h1>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm card-hover">
            <p className="text-lg font-medium text-[var(--fg)]">{data.oneThing}</p>
            {data.oneThingWhy && <p className="mt-1.5 text-[14px] text-[var(--fg-muted)]">{data.oneThingWhy}</p>}
            {data.intentFull && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-[var(--accent-bg)] px-3.5 py-3">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#eb9a4a]" />
                <p className="text-[13px] leading-relaxed text-[var(--accent-text)]">{data.intentFull}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => router.push("/today")}
            className="btn-press flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--fg)] py-3.5 text-sm font-medium text-[var(--bg)] hover:opacity-80"
          >
            开始执行 <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push("/today")}
            className="w-full text-center text-[13px] text-[var(--fg-subtle)] transition-colors hover:text-[var(--fg-secondary)]"
          >
            想换一件事？
          </button>
        </div>
      )}

      {/* ─── 状态 C：已完成 ─── */}
      {hasPlan && hasDone && (
        <div className="space-y-5">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--done-bg)]">
                <CheckCircle2 className="h-5 w-5 text-[#2d8a6e]" />
              </div>
              <span className="text-[15px] font-medium text-[#2d8a6e]">今日完成</span>
            </div>
            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--fg)]">
              干得漂亮
            </h1>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">你完成的事</p>
            <p className="mt-1 font-medium text-[var(--fg)]">{data.oneThing}</p>
            <div className="mt-5 flex gap-3">
              <div className="flex-1 rounded-xl bg-[var(--bg)] px-4 py-3">
                <p className="text-xl font-semibold text-[var(--fg)]">{formatMinutes(data.focusMinutes)}</p>
                <p className="text-[11px] text-[var(--fg-subtle)]">专注时长</p>
              </div>
              <div className="flex-1 rounded-xl bg-[var(--bg)] px-4 py-3">
                <p className="text-xl font-semibold text-[var(--fg)]">{data.focusSessions}</p>
                <p className="text-[11px] text-[var(--fg-subtle)]">番茄钟</p>
              </div>
            </div>
          </div>
          {!hasReviewed ? (
            <button
              onClick={() => setShowReview(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--fg-subtle)] bg-[var(--bg-card)] py-3.5 text-sm font-medium text-[var(--fg-secondary)] card-hover hover:border-[#a09c94] hover:text-[var(--fg)]"
            >
              晚间回顾（3 分钟，整理今天）
            </button>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#2d8a6e]" />
                <p className="text-[13px] text-[var(--fg-muted)]">今日已回顾</p>
              </div>
              <p className="mt-1.5 text-[14px] text-[var(--fg-secondary)] line-clamp-2">{data.reviewDone1}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/today")}
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-3.5 text-[14px] font-medium text-[var(--fg-secondary)] transition-colors hover:bg-[var(--bg)]"
            >
              为明天做准备 →
            </button>
            <button
              onClick={() => setShowShare(true)}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3.5 text-[14px] font-medium text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--fg-secondary)]"
              title="分享今天的成就"
            >
              分享
            </button>
          </div>
        </div>
      )}

      {/* 方法论入口 + 一人AI标签 + 再看引导 */}
      <div className="mt-10 text-center space-y-2">
        <a
          href="/method"
          className="text-[12px] text-[var(--fg-subtle)] transition-colors hover:text-[var(--fg-muted)]"
        >
          壹念背后的科学依据 →
        </a>
        <p className="text-[10px] text-[var(--fg-subtle)]">
          由一个人 + Claude Code 构建 · DeepSeek 驱动 AI
        </p>
      </div>

      <ReviewModal isOpen={showReview} onClose={() => setShowReview(false)} onSubmit={handleReviewSubmit} />
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        data={{
          oneThing: data?.oneThing || "",
          focusMinutes: data?.focusMinutes || 0,
          focusSessions: data?.focusSessions || 0,
          clarityScore: data?.clarity?.score || 50,
          clarityLabel: data?.clarity?.label || "",
        }}
      />
      <Celebration show={showCelebration} onDismiss={() => setShowCelebration(false)} />
      <Toast message={toast} show={!!toast} onDone={() => setToast("")} />
    </div>
  )
}
