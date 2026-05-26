"use client"

import { X } from "lucide-react"
import { formatDate, formatMinutes } from "@/lib/utils"
import { playOpen, playClose } from "@/lib/sounds"
import { useEffect } from "react"

interface Props {
  isOpen: boolean
  onClose: () => void
  data: {
    oneThing: string
    focusMinutes: number
    focusSessions: number
    clarityScore: number
    clarityLabel: string
  }
}

export default function ShareModal({ isOpen, onClose, data }: Props) {
  useEffect(() => {
    if (isOpen) playOpen()
  }, [isOpen])

  if (!isOpen) return null

  const today = new Date()
  const dateStr = formatDate(today)

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--fg)]/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* 卡片本体 */}
      <div
        className="slide-up-enter w-full max-w-sm overflow-hidden rounded-3xl bg-[var(--bg-card)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部 —— 暖色渐变 */}
        <div
          className="relative px-6 pb-10 pt-10"
          style={{
            background: "linear-gradient(160deg, rgba(235,154,74,0.15) 0%, rgba(235,154,74,0.04) 50%, var(--bg-card) 100%)",
          }}
        >
          {/* 装饰：极淡几何圆 */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border border-[#eb9a4a]/10" />
          <div className="pointer-events-none absolute bottom-6 right-8 h-16 w-16 rounded-full border border-[#eb9a4a]/8" />

          <div className="relative">
            {/* 品牌 */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eb9a4a]/20">
                <span className="text-sm font-bold text-[#eb9a4a]">壹</span>
              </div>
              <span className="text-[12px] font-medium tracking-wider text-[var(--fg-muted)]">壹念</span>
            </div>

            {/* 日期 */}
            <p className="mt-4 text-[12px] text-[var(--fg-muted)]">{dateStr}</p>

            {/* 核心成就 */}
            <div className="mt-8">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--fg-muted)]/70">
                今天完成的事
              </p>
              <p className="mt-2 text-[1.4rem] font-bold leading-snug text-[var(--fg)]">
                {data.oneThing}
              </p>
            </div>
          </div>
        </div>

        {/* 数据区 */}
        <div className="space-y-2.5 px-6 py-5">
          {/* 壹指数 */}
          <div className="flex items-center justify-between rounded-2xl bg-[var(--bg)] px-4 py-3.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {data.clarityScore >= 80 ? "✨" : data.clarityScore >= 60 ? "🌤️" : "🌫️"}
              </span>
              <span className="text-[13px] font-medium text-[var(--fg-secondary)]">壹指数</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] text-[var(--fg-subtle)]">{data.clarityLabel}</span>
              <span className="text-xl font-bold text-[var(--fg)]">{data.clarityScore}</span>
            </div>
          </div>

          {/* 专注时长 + 番茄钟 同行 */}
          <div className="flex gap-2.5">
            <div className="flex flex-1 items-center justify-between rounded-2xl bg-[var(--bg)] px-4 py-3.5">
              <span className="text-[12px] text-[var(--fg-muted)]">专注</span>
              <span className="text-[15px] font-semibold text-[var(--fg)]">
                {formatMinutes(data.focusMinutes)}
              </span>
            </div>
            <div className="flex flex-1 items-center justify-between rounded-2xl bg-[var(--bg)] px-4 py-3.5">
              <span className="text-[12px] text-[var(--fg-muted)]">番茄钟</span>
              <span className="text-[15px] font-semibold text-[var(--fg)]">
                {data.focusSessions} 个
              </span>
            </div>
          </div>
        </div>

        {/* 底部标语 */}
        <div className="border-t border-[var(--border-light)] px-6 py-4">
          <p className="text-center text-[11px] tracking-wider text-[var(--fg-subtle)]">
            每天清空大脑，聚焦一件事
          </p>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => { playClose(); onClose() }}
          className="rounded-full bg-[var(--fg)]/15 p-3 text-[var(--fg)] backdrop-blur-sm transition-colors hover:bg-[var(--fg)]/25"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-[13px] text-[var(--fg-muted)]">截屏保存这张卡片</p>
      </div>
    </div>
  )
}
