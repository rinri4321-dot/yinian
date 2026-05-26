"use client"

import { useEffect, useState } from "react"
import { CheckCircle } from "lucide-react"

const COLORS = ["#eb9a4a", "#2d8a6e", "#5b8def", "#9b6fe8", "#e8e6e1", "#f07b7b", "#6ab8d4", "#e8b06a"]
const PARTICLE_COUNT = 36

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  delay: number
  angle: number
  distance: number
}

export default function Celebration({ show, onDismiss }: { show: boolean; onDismiss?: () => void }) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) return
    setVisible(true)

    const items: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: 50,
      y: 42,
      color: COLORS[i % COLORS.length],
      size: 4 + Math.random() * 8,
      delay: Math.random() * 0.35,
      angle: (i / PARTICLE_COUNT) * 360 + Math.random() * 20,
      distance: 80 + Math.random() * 160,
    }))
    setParticles(items)
  }, [show])

  const handleDismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* 粒子层 — 不拦截点击 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[var(--bg)]/70 pop-in" />
        <div className="absolute inset-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                ["--tx" as string]: `${Math.cos((p.angle * Math.PI) / 180) * p.distance}px`,
                "--ty": `${Math.sin((p.angle * Math.PI) / 180) * p.distance}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* 中央内容 + 按钮 — 可点击 */}
      <div className="relative z-10 flex flex-col items-center pop-in">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--done)] shadow-xl">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <p className="mt-5 text-[1.75rem] font-bold tracking-tight text-[var(--fg)]">完成了!</p>
        <p className="mt-1.5 text-[15px] text-[var(--fg-muted)]">今天最重要的事已经做好</p>
        <button
          onClick={handleDismiss}
          className="btn-press mt-6 rounded-xl bg-[var(--fg)] px-8 py-3 text-sm font-medium text-[var(--bg)] hover:opacity-80"
        >
          继续
        </button>
      </div>
    </div>
  )
}
