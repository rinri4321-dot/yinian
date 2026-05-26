"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  text: string
  x: number
  y: number
  targetX: number
  targetY: number
  rotation: number
  color: string
  delay: number
}

const COLORS_BY_CAT: Record<string, string> = {
  worry: "#eb9a4a",
  task: "#5b8def",
  idea: "#9b6fe8",
  reminder: "#2d8a6e",
  other: "#a09c94",
}

const CAT_NAMES: Record<string, string> = {
  worry: "担忧消散",
  task: "待办就绪",
  idea: "灵感记录",
  reminder: "提醒整理",
  other: "杂项归档",
}

interface Props {
  text: string
  onComplete: () => void
}

export default function ThoughtAnimation({ text, onComplete }: Props) {
  const [phase, setPhase] = useState<"scatter" | "organize" | "done">("scatter")
  const [particles, setParticles] = useState<Particle[]>([])
  const [showLabel, setShowLabel] = useState(false)

  useEffect(() => {
    // 将文本拆成短句/词
    const phrases = text
      .split(/[\n,，。！？、；;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 30)
      .slice(0, 24)

    if (phrases.length === 0) {
      // 太短了，直接跳过动画
      setTimeout(onComplete, 200)
      return
    }

    // 为每个短语分配"目标位置"（模拟分类排列）
    const cols = Math.min(4, Math.ceil(Math.sqrt(phrases.length)))
    const rows = Math.ceil(phrases.length / cols)
    const colors = Object.values(COLORS_BY_CAT)

    const items: Particle[] = phrases.map((text, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      // 目标：整齐排列
      const targetX = 10 + (col / cols) * 80
      const targetY = 10 + (row / rows) * 80
      // 初始：散乱分布
      return {
        id: i,
        text: text.length > 12 ? text.slice(0, 12) + "…" : text,
        x: Math.random() * 90,
        y: Math.random() * 90,
        targetX,
        targetY,
        rotation: (Math.random() - 0.5) * 30,
        color: colors[i % colors.length],
        delay: Math.random() * 0.5,
      }
    })

    setParticles(items)

    // 阶段1：散乱 → 800ms 后开始整理
    const t1 = setTimeout(() => {
      setPhase("organize")
      setShowLabel(true)
    }, 800)

    // 阶段2：整理完毕 → 通知父组件
    const t2 = setTimeout(() => {
      setPhase("done")
      setTimeout(onComplete, 300)
    }, 2400)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [text, onComplete])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[var(--bg)]/95 backdrop-blur-sm">
      <div className="relative h-80 w-80 sm:h-96 sm:w-96">
        {/* 中央提示文字 */}
        <div
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center transition-all duration-500 ${
            showLabel ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          <p className="text-[13px] font-medium text-[var(--fg-muted)]">
            {phase === "organize" ? "正在整理你的思绪…" : "清空中…"}
          </p>
          {phase === "organize" && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {Object.entries(CAT_NAMES).slice(0, 3).map(([cat, name]) => (
                <span
                  key={cat}
                  className="rounded-full px-3 py-1 text-[11px] font-medium"
                  style={{
                    backgroundColor: `${COLORS_BY_CAT[cat]}15`,
                    color: COLORS_BY_CAT[cat],
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 粒子 */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute max-w-[120px] truncate rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all duration-700 ease-out"
            style={{
              left:
                phase === "scatter"
                  ? `${p.x}%`
                  : `${p.targetX}%`,
              top:
                phase === "scatter"
                  ? `${p.y}%`
                  : `${p.targetY}%`,
              transform:
                phase === "scatter"
                  ? `rotate(${p.rotation}deg) scale(1)`
                  : "rotate(0deg) scale(0.95)",
              backgroundColor:
                phase === "scatter"
                  ? "var(--bg-card)"
                  : `${p.color}12`,
              color: phase === "scatter" ? "#787774" : p.color,
              borderColor:
                phase === "scatter"
                  ? "var(--border)"
                  : `${p.color}30`,
              borderWidth: "1px",
              transitionDelay: `${p.delay}s`,
              opacity: phase === "done" ? 0 : 1,
              zIndex: phase === "scatter" ? 0 : 1,
            }}
          >
            {p.text}
          </div>
        ))}
      </div>
    </div>
  )
}
