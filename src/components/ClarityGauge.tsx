"use client"

import { useState } from "react"

interface Props {
  score: number
  label: string
}

export default function ClarityGauge({ score, label }: Props) {
  const [showTip, setShowTip] = useState(false)
  const clamped = Math.max(0, Math.min(100, score))
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (clamped / 100) * circumference

  const color =
    clamped >= 80 ? "#2d8a6e" : clamped >= 60 ? "#eb9a4a" : "#c5c1b8"

  const emoji = clamped >= 80 ? "✨" : clamped >= 60 ? "🌤️" : "🌫️"

  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={() => setShowTip(!showTip)}
        className="relative cursor-help"
        title="点击了解壹指数"
      >
        <svg width="48" height="48" className="-rotate-90">
          <circle cx="24" cy="24" r="18" fill="none" stroke="var(--border-light)" strokeWidth="3" />
          <circle cx="24" cy="24" r="18" fill="none"
            stroke={color} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset * (18 / 40)}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold tracking-tight text-[var(--fg)]">
            {clamped}
          </span>
        </div>
      </button>

      {/* 提示气泡 */}
      {showTip && (
        <div className="absolute right-0 top-12 z-50 w-44 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-3 shadow-lg">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span>{emoji}</span>
            <span className="text-xs font-semibold text-[var(--fg)]">壹指数 {clamped}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--fg-secondary)]">
            心智清晰度评分。
            清空大脑、完成专注、做回顾都会提升它。
          </p>
          <div className="mt-2 space-y-0.5 text-[10px] text-[var(--fg-subtle)]">
            <div className="flex justify-between"><span>清空大脑</span><span>+15</span></div>
            <div className="flex justify-between"><span>选定要事</span><span>+10</span></div>
            <div className="flex justify-between"><span>每次专注</span><span>+10</span></div>
            <div className="flex justify-between"><span>完成回顾</span><span>+15</span></div>
          </div>
        </div>
      )}

      {/* 点击遮罩关闭 */}
      {showTip && (
        <div className="fixed inset-0 z-40" onClick={() => setShowTip(false)} />
      )}

      {label && <p className="mt-1.5 text-[11px] font-medium text-[var(--fg-subtle)]">{label}</p>}
    </div>
  )
}
