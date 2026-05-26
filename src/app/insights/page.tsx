"use client"

import { useEffect, useState, useMemo } from "react"
import { formatDate, formatMinutes, calcClarityScore } from "@/lib/utils"
import { Sparkles, TrendingUp, Target, Clock, Smile } from "lucide-react"

interface Record {
  id: string
  date: string
  oneThing: string | null
  focusMinutes: number
  focusSessions: number
  oneThingDone: string | null
  moodScore: number | null
  brainDump: string | null
  reviewDone1: string | null
}

export default function InsightsPage() {
  const [records, setRecords] = useState<Record[]>([])
  const [insight, setInsight] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/insights").then((r) => r.json()),
      fetch("/api/insights?type=records").then((r) => r.json()),
    ])
      .then(([insightData, recordsData]) => {
        setInsight(insightData.insight)
        setRecords(recordsData.records || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const clarityTrend = useMemo(() => {
    if (records.length < 2) return []
    return records
      .slice(0, 14)
      .reverse()
      .map((r) => ({
        date: new Date(r.date),
        label: ["日", "一", "二", "三", "四", "五", "六"][new Date(r.date).getDay()],
        score: calcClarityScore(r).score,
      }))
  }, [records])

  if (loading) {
    return (
      <div className="page-transition mx-auto max-w-lg px-5 py-10 bg-[var(--bg)] min-h-screen">
        <div className="mb-8 h-6 w-16 animate-pulse rounded bg-[var(--border)]" />
        <div className="mb-6 h-24 animate-pulse rounded-2xl bg-[var(--border)]" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-[var(--border)]" />
          ))}
        </div>
      </div>
    )
  }

  const totalFocus = records.reduce((s, r) => s + r.focusMinutes, 0)
  const totalSessions = records.reduce((s, r) => s + r.focusSessions, 0)
  const doneDays = records.filter((r) => r.oneThingDone === "done").length
  const totalDays = records.length
  const completionRate = totalDays > 0 ? Math.round((doneDays / totalDays) * 100) : 0
  const avgMood =
    records.filter((r) => r.moodScore).length > 0
      ? (
          records.filter((r) => r.moodScore).reduce((s, r) => s + (r.moodScore || 0), 0) /
          records.filter((r) => r.moodScore).length
        ).toFixed(1)
      : null

  // 生成本周一～周日的7天数组
  const weekDays = (() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + mondayOffset)
    monday.setHours(0, 0, 0, 0)

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d
    })
  })()

  // 把已有记录映射到对应日期
  const recordMap = new Map<string, Record>()
  for (const r of records) {
    const key = new Date(r.date).toDateString()
    if (!recordMap.has(key)) recordMap.set(key, r)
  }

  // 生成图表数据：每天一条
  const weekData = weekDays.map((d) => {
    const key = d.toDateString()
    const record = recordMap.get(key)
    return {
      date: d,
      dayLabel: ["一", "二", "三", "四", "五", "六", "日"][
        d.getDay() === 0 ? 6 : d.getDay() - 1
      ],
      isToday: d.toDateString() === new Date().toDateString(),
      focusMinutes: record?.focusMinutes || 0,
      focusSessions: record?.focusSessions || 0,
      done: record?.oneThingDone === "done",
    }
  })

  const maxFocus = Math.max(...weekData.map((d) => d.focusMinutes), 1)

  return (
    <div className="page-transition mx-auto max-w-lg px-5 py-10 bg-[var(--bg)] min-h-screen">
      <h1 className="mb-8 text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--fg)]">
        洞察
      </h1>

      {records.length === 0 ? (
        <div className="space-y-5 py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg)]">
            <TrendingUp className="h-7 w-7 text-[var(--fg-subtle)]" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-[var(--fg)]">还没有数据</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--fg-muted)]">
              开始每天「清空」+「执行」
              <br />
              这里会出现你的个人模式和成长轨迹
            </p>
          </div>
          <a
            href="/today"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--fg)] px-6 py-3 text-sm font-medium text-[var(--bg)] transition-colors hover:opacity-80"
          >
            开始第一次清空
          </a>
        </div>
      ) : (
        <>
          {/* AI 洞察 */}
          {insight && (
            <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
              <div className="mb-2.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#eb9a4a]" />
                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">本周洞察</p>
              </div>
              <p className="text-[14px] leading-relaxed text-[var(--fg-secondary)]">{insight}</p>
            </div>
          )}

          {/* 数据卡片 */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            {[
              { icon: Clock, label: "累计专注", value: formatMinutes(totalFocus), color: "text-[var(--fg-secondary)]" },
              { icon: Target, label: "完成率", value: `${completionRate}%`, color: "text-[#2d8a6e]" },
              { icon: TrendingUp, label: "番茄钟", value: `${totalSessions} 个`, color: "text-[var(--fg-secondary)]" },
              { icon: Smile, label: "平均心情", value: avgMood ? `${avgMood}/5` : "-", color: "text-[#eb9a4a]" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-1.5">
                  <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                  <p className="text-[11px] text-[var(--fg-subtle)]">{stat.label}</p>
                </div>
                <p className={`text-[1.5rem] font-semibold tracking-tight ${stat.value === "-" ? "text-[var(--fg-subtle)]" : "text-[var(--fg)]"}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* 壹指数趋势 */}
          {clarityTrend.length >= 2 && (
            <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
                  壹指数趋势
                </p>
                <span className="text-[11px] font-semibold text-[#eb9a4a]">
                  {clarityTrend[clarityTrend.length - 1].score} 分
                </span>
              </div>
              <svg
                viewBox="0 0 300 64"
                width="100%"
                height="72"
                className="block"
              >
                {/* 水平参考线 */}
                {[15, 37].map((y) => (
                  <line key={y} x1="8" y1={y} x2="292" y2={y}
                    stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 3" />
                ))}

                <defs>
                  <linearGradient id="ctGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eb9a4a" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#eb9a4a" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* 填充 */}
                <path
                  d={(() => {
                    const n = clarityTrend.length
                    const x = (i: number) => 8 + (i / Math.max(n - 1, 1)) * 284
                    const y = (s: number) => 52 - (s / 100) * 40
                    const pts = clarityTrend.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.score).toFixed(1)}`)
                    return `${pts.join(' ')} L${x(n - 1).toFixed(1)},52 L8,52 Z`
                  })()}
                  fill="url(#ctGrad)"
                />

                {/* 折线 */}
                <path
                  d={(() => {
                    const n = clarityTrend.length
                    const x = (i: number) => 8 + (i / Math.max(n - 1, 1)) * 284
                    const y = (s: number) => 52 - (s / 100) * 40
                    return clarityTrend.map((d, i) => {
                      const px = x(i).toFixed(1)
                      const py = y(d.score).toFixed(1)
                      return `${i === 0 ? 'M' : 'L'}${px},${py}`
                    }).join(' ')
                  })()}
                  fill="none"
                  stroke="#eb9a4a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 数据点 + 标签 */}
                {clarityTrend.map((d, i) => {
                  const n = clarityTrend.length
                  const px = 8 + (i / Math.max(n - 1, 1)) * 284
                  const py = 52 - (d.score / 100) * 40
                  const isLast = i === n - 1
                  return (
                    <g key={i}>
                      <circle cx={px.toFixed(1)} cy={py.toFixed(1)}
                        r={isLast ? 2.5 : 1.2}
                        fill={isLast ? "#eb9a4a" : "var(--bg-card)"}
                        stroke="#eb9a4a" strokeWidth="1" />
                      {isLast && (
                        <text x={px.toFixed(1)} y={py - 5} textAnchor="middle"
                          className="text-[10px] font-bold" fill="#eb9a4a">{d.score}</text>
                      )}
                      <text x={px.toFixed(1)} y="61" textAnchor="middle"
                        className="text-[10px]" fill="var(--fg-subtle)">{d.label}</text>
                    </g>
                  )
                })}
              </svg>
            </div>
          )}

          {/* 本周柱状图 */}
          <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">
              本周专注时长
            </p>
            <div
              className="flex items-end gap-1.5"
              style={{ height: "110px" }}
            >
              {weekData.map((d, i) => {
                const heightPct = d.focusMinutes > 0
                  ? Math.max((d.focusMinutes / maxFocus) * 100, 12)
                  : 5
                return (
                  <div
                    key={i}
                    className="flex flex-1 flex-col items-center justify-end gap-1.5"
                  >
                    {/* 顶部数字 */}
                    <span
                      className={`text-[10px] tabular-nums font-medium ${
                        d.focusMinutes > 0 ? "text-[var(--fg-secondary)]" : "text-transparent"
                      }`}
                    >
                      {d.focusMinutes > 0 ? `${d.focusMinutes}分` : "0"}
                    </span>
                    {/* 柱体 */}
                    <div className="relative w-full">
                      <div
                        className={`w-full rounded-t-[4px] transition-all duration-300 ${
                          d.isToday
                            ? "bg-[var(--fg)]"
                            : d.done
                            ? "bg-[var(--fg-subtle)]"
                            : d.focusMinutes > 0
                            ? "bg-[var(--border)]"
                            : "bg-[var(--border-light)]"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                      {/* 今天标记点 */}
                      {d.isToday && (
                        <div className="absolute -bottom-4 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--fg)]" />
                      )}
                    </div>
                    {/* 星期标签 */}
                    <span
                      className={`mt-2 text-[11px] font-medium ${
                        d.isToday ? "text-[var(--fg)]" : "text-[var(--fg-subtle)]"
                      }`}
                    >
                      {d.dayLabel}
                    </span>
                  </div>
                )
              })}
            </div>
            {/* 图例 */}
            <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-[var(--fg-subtle)]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-[var(--fg)]" /> 今天
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-[var(--fg-subtle)]" /> 已完成
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-[var(--border)]" /> 有专注
              </span>
            </div>
          </div>

          {/* 历史列表 */}
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">历史记录</p>
            <div className="space-y-1.5">
              {records.slice(0, 14).map((r) => (
                <div key={r.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 shadow-sm transition-colors hover:border-[var(--fg-subtle)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-[var(--fg)] truncate">{r.oneThing || "（未记录）"}</p>
                      <p className="text-[11px] text-[var(--fg-subtle)]">{formatDate(new Date(r.date))}</p>
                    </div>
                    <div className="ml-3 flex items-center gap-3 text-[11px] text-[var(--fg-subtle)]">
                      {r.oneThingDone === "done" && (
                        <span className="rounded-full bg-[var(--done-bg)] px-2 py-0.5 font-medium text-[#2d8a6e]">完成</span>
                      )}
                      {r.oneThingDone === "partial" && (
                        <span className="rounded-full bg-[var(--accent-bg)] px-2 py-0.5 font-medium text-[#eb9a4a]">部分</span>
                      )}
                      {r.focusMinutes > 0 && <span>{formatMinutes(r.focusMinutes)}</span>}
                      {r.moodScore && (
                        <span>{["", "😞", "😔", "😐", "🙂", "😊"][r.moodScore]}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
