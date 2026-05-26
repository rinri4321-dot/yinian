export interface DailyRecord {
  id: string
  date: Date

  // 清空
  brainDump?: string | null
  dumpAnalysis?: string | null

  // 聚焦
  oneThing?: string | null
  oneThingWhy?: string | null

  // 意图
  intentTime?: string | null
  intentPlace?: string | null
  intentFull?: string | null

  // 执行
  focusMinutes: number
  focusSessions: number
  oneThingDone?: string | null

  // 回顾
  reviewDone1?: string | null
  reviewBetter?: string | null
  reviewNextOne?: string | null

  // 心情
  moodScore?: number | null

  createdAt: Date
}

export interface WeeklyInsight {
  id: string
  weekStart: Date
  weekEnd: Date
  insightText: string
  createdAt: Date
}

export type DumpCategory = "worry" | "task" | "idea" | "reminder" | "other"

export interface DumpItem {
  content: string
  category: DumpCategory
}

export interface DumpAnalysis {
  items: DumpItem[]
  summary: string
}
