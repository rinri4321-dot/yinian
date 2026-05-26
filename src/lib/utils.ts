export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ")
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
}

export function getTodayStr(): string {
  return new Date().toISOString().split("T")[0]
}

// ── 壹指数计算 ──────────────────────────────────────

export function calcClarityScore(record: {
  brainDump?: string | null
  oneThing?: string | null
  oneThingDone?: string | null
  focusSessions?: number
  reviewDone1?: string | null
  moodScore?: number | null
}): { score: number; label: string } {
  let score = 50

  if (record.brainDump) score += 15
  if (record.oneThing) score += 10
  if (record.focusSessions && record.focusSessions > 0) {
    score += Math.min(record.focusSessions * 10, 30)
  }
  if (record.reviewDone1) score += 15
  if (record.moodScore && record.moodScore >= 4) score += 5

  const clamped = Math.min(100, score)
  const label =
    clamped >= 85 ? "思绪清晰" : clamped >= 70 ? "头脑有序" : clamped >= 55 ? "略有混沌" : "需要清空"

  return { score: clamped, label }
}

// ── 日期工具 ────────────────────────────────────────

export function getWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const start = new Date(now)
  start.setDate(now.getDate() - diff)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}
