"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Sparkles, ChevronDown, ChevronUp, Play, Pause, RotateCcw, CheckCircle, Coffee } from "lucide-react"
import type { DumpAnalysis } from "@/types"
import ThoughtAnimation from "@/components/ThoughtAnimation"
import { playFocusStart, playFocusComplete, playTaskDone, playBreakEnd, playCelebration, playThoughtDone } from "@/lib/sounds"

const STEPS = [
  { key: "dump", label: "清空", num: 1 },
  { key: "analyze", label: "识别", num: 2 },
  { key: "focus", label: "聚焦", num: 3 },
  { key: "intent", label: "定意图", num: 4 },
  { key: "execute", label: "执行", num: 5 },
]

const PRESETS = [
  { mins: 5, label: "5 分钟", hint: "快速启动" },
  { mins: 15, label: "15 分钟", hint: "短时冲刺" },
  { mins: 25, label: "25 分钟", hint: "标准番茄钟" },
  { mins: 45, label: "45 分钟", hint: "深度专注" },
  { mins: 60, label: "60 分钟", hint: "长时沉浸" },
]

const BREAK_PRESETS = [
  { mins: 3, label: "3 分钟" },
  { mins: 5, label: "5 分钟" },
  { mins: 10, label: "10 分钟" },
  { mins: 15, label: "15 分钟" },
]

const categoryConfig: Record<string, { label: string; dot: string; border: string }> = {
  worry: { label: "担忧", dot: "bg-amber-400", border: "border-l-amber-400" },
  task: { label: "待办", dot: "bg-blue-400", border: "border-l-blue-400" },
  idea: { label: "想法", dot: "bg-purple-400", border: "border-l-purple-400" },
  reminder: { label: "提醒", dot: "bg-emerald-400", border: "border-l-emerald-400" },
  other: { label: "其他", dot: "bg-[var(--fg-subtle)]", border: "border-l-[var(--fg-subtle)]" },
}

export default function TodayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const suggested = searchParams.get("suggest")

  // 步骤1：清空
  const [step, setStep] = useState(1)
  const [content, setContent] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<DumpAnalysis | null>(null)
  const [aiQuestion, setAiQuestion] = useState("")
  const [showAnimation, setShowAnimation] = useState(false)
  const [animText, setAnimText] = useState("")
  const [showAll, setShowAll] = useState(false)
  const [suggestionAccepted, setSuggestionAccepted] = useState(false)

  // 步骤3-4：聚焦
  const [oneThing, setOneThing] = useState("")
  const [oneThingWhy, setOneThingWhy] = useState("")
  const [intentTime, setIntentTime] = useState("")
  const [intentPlace, setIntentPlace] = useState("")

  // 步骤5：计时
  const [focusMins, setFocusMins] = useState(25)
  const [breakMins, setBreakMins] = useState(5)
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [customInputVal, setCustomInputVal] = useState("")
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [totalSecs, setTotalSecs] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [paused, setPaused] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [showDoneOptions, setShowDoneOptions] = useState(false)
  const [partialMessage, setPartialMessage] = useState(false)

  const endTimeRef = useRef(0)
  const totalSecsRef = useRef(25 * 60)
  const rafRef = useRef(0)
  const hasRecordedRef = useRef(false)
  const isBreakRef = useRef(false)
  const focusMinsRef = useRef(25)
  const breakMinsRef = useRef(5)

  useEffect(() => { isBreakRef.current = isBreak }, [isBreak])
  useEffect(() => { focusMinsRef.current = focusMins }, [focusMins])
  useEffect(() => { breakMinsRef.current = breakMins }, [breakMins])

  // 检查今天是否已有计划
  useEffect(() => {
    fetch("/api/focus")
      .then((r) => r.json())
      .then((d) => {
        if (d.oneThing && !d.oneThingDone) {
          // 已有计划未完成，直接跳到执行步骤
          setOneThing(d.oneThing || "")
          setOneThingWhy(d.oneThingWhy || "")
          setIntentTime(d.intentTime || "")
          setIntentPlace(d.intentPlace || "")
          setStep(5)
        }
      })
      .catch(() => {})
  }, [])

  // ── 步骤1：清空分析 ──
  const handleDump = async () => {
    if (!content.trim()) return
    setAnalyzing(true)
    const res = await fetch("/api/dump", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
    const data = await res.json()
    setAnalysis(data.analysis)
    setAiQuestion(data.question)
    setAnimText(content)
    setShowAnimation(true)
    setAnalyzing(false)
  }

  const handlePickFromList = (item: string) => {
    setOneThing(item)
    setStep(4)
  }

  const acceptSuggestion = () => {
    if (!suggested) return
    setOneThing(suggested)
    setSuggestionAccepted(true)
    setStep(4)
  }

  // ── 步骤3→4：保存聚焦 ──
  const saveFocus = async () => {
    const intentFull = intentTime && intentPlace
      ? `如果到了 ${intentTime} 我在 ${intentPlace}，我就开始 ${oneThing}`
      : `今天我要完成：${oneThing}`
    await fetch("/api/focus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oneThing, oneThingWhy, intentTime, intentPlace, intentFull }),
    })
    setStep(5)
  }

  // ── 计时逻辑 ──
  useEffect(() => {
    if (!isRunning) return
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (endTimeRef.current - Date.now() <= 0) {
        setIsRunning(false)
        if (!isBreakRef.current && !hasRecordedRef.current) {
          hasRecordedRef.current = true
          setSessions((s) => s + 1)
          recordSession(totalSecsRef.current)
          setShowDoneOptions(true)
          playFocusComplete()
        } else if (isBreakRef.current) {
          playBreakEnd()
          const nextFocus = focusMinsRef.current * 60
          setTimeLeft(nextFocus)
          setTotalSecs(nextFocus)
          setIsBreak(false)
        }
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isRunning])

  const recordSession = async (secs: number) => {
    await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration: secs, completed: true }),
    })
  }

  const startFocus = (mins?: number) => {
    const m = mins || focusMins
    const secs = m * 60
    setFocusMins(m)
    setTimeLeft(secs)
    setTotalSecs(secs)
    totalSecsRef.current = secs
    endTimeRef.current = Date.now() + secs * 1000
    hasRecordedRef.current = false
    setIsBreak(false)
    setIsRunning(true)
    setPaused(false)
    setShowDoneOptions(false)
    playFocusStart()
  }

  const startBreak = (mins?: number) => {
    const m = mins || breakMins
    const secs = m * 60
    setBreakMins(m)
    setTimeLeft(secs)
    setTotalSecs(secs)
    totalSecsRef.current = secs
    endTimeRef.current = Date.now() + secs * 1000
    hasRecordedRef.current = false
    setIsBreak(true)
    setIsRunning(true)
    setPaused(false)
    setShowDoneOptions(false)
  }

  const selectPreset = (mins: number) => {
    setIsCustomMode(false)
    setCustomInputVal("")
    setFocusMins(mins)
    setTimeLeft(mins * 60)
    setTotalSecs(mins * 60)
    totalSecsRef.current = mins * 60
  }

  const togglePause = () => {
    const nowPaused = !paused
    if (nowPaused) {
      endTimeRef.current = Math.max(0, endTimeRef.current - Date.now())
    } else {
      endTimeRef.current = Date.now() + endTimeRef.current
    }
    setIsRunning((p) => !p)
    setPaused((p) => !p)
  }

  const reset = () => {
    setIsRunning(false)
    setPaused(false)
    const secs = focusMins * 60
    setTimeLeft(secs)
    setTotalSecs(secs)
    totalSecsRef.current = secs
    setIsBreak(false)
  }

  const markDone = async (status: string) => {
    await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oneThingDone: status }),
    })
    if (status === "done") {
      sessionStorage.setItem("celebrate", "true")
      playTaskDone()
      setTimeout(() => playCelebration(), 120)
      router.push("/")
    } else if (status === "partial") {
      setShowDoneOptions(false)
      setPartialMessage(true)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const progress = totalSecs > 0 ? ((totalSecs - timeLeft) / totalSecs) * 100 : 0
  const circumference = 2 * Math.PI * 110
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const livePreviewMins = (() => {
    if (!isCustomMode) return focusMins
    const v = parseInt(customInputVal)
    return v >= 1 && v <= 180 ? v : null
  })()
  const displayMins = livePreviewMins ?? focusMins

  const visibleItems = (() => {
    if (!analysis) return []
    return showAll || analysis.items.length <= 8 ? analysis.items : analysis.items.slice(0, 5)
  })()
  const hiddenCount = analysis ? Math.max(0, analysis.items.length - 5) : 0

  // ── 步骤指示器 ──
  const StepIndicator = () => (
    <div className="mb-8 flex items-center gap-1.5">
      {STEPS.map((s, i) => {
        const done = i + 1 < step
        const active = i + 1 === step
        return (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
              done ? "bg-[var(--done)] text-white" : active ? "bg-[var(--fg)] text-[var(--bg)]" : "bg-[var(--border)] text-[var(--fg-subtle)]"
            }`}>
              {done ? "✓" : s.num}
            </div>
            <span className={`text-xs font-medium ${active || done ? "text-[var(--fg-secondary)]" : "text-[var(--fg-subtle)]"}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-5 ${i + 1 < step ? "bg-[var(--fg-subtle)]" : "bg-[var(--border)]"}`} />
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="page-transition mx-auto max-w-lg px-5 py-10">
      <StepIndicator />

      {/* ─── 步骤1：清空 ─── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--fg)]">
              把脑子里的东西全部倒出来
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--fg-secondary)]">
              焦虑、待办、想法、杂念——全部写下来。不用排序，不用评判。
            </p>
          </div>

          {suggested && !suggestionAccepted && (
            <div className="rounded-2xl border border-[var(--accent-bg)] bg-[var(--accent-bg)]/60 p-4">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span className="text-[11px] font-medium text-[var(--fg-subtle)]">昨晚你写下的</span>
              </div>
              <p className="mt-1.5 text-[15px] font-medium text-[var(--fg)]">{suggested}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={acceptSuggestion} className="rounded-lg bg-[var(--fg)] px-4 py-2 text-xs font-medium text-[var(--bg)] hover:opacity-80">就用这个，跳过清空</button>
                <button onClick={() => setSuggestionAccepted(true)} className="rounded-lg bg-[var(--bg-card)] px-4 py-2 text-xs text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]">不用，重新理一遍</button>
              </div>
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[240px] w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-[15px] leading-relaxed shadow-sm placeholder:text-[var(--fg-subtle)] focus:border-[var(--fg-muted)] focus:outline-none"
            placeholder="比如：要做PPT但完全没头绪\n担心下周的汇报\n该给妈妈打电话了\n想学编程但不知道从哪开始"
            autoFocus
          />
          <button onClick={handleDump} disabled={!content.trim() || analyzing}
            className="btn-press flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--fg)] py-3.5 text-sm font-medium text-[var(--bg)] hover:opacity-80 disabled:opacity-30">
            {analyzing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--bg)] border-t-transparent" />分析中…</> : <><Sparkles className="h-4 w-4" />清空完毕，帮我看看</>}
          </button>
        </div>
      )}

      {/* 思绪动画 */}
      {showAnimation && (
        <ThoughtAnimation text={animText} onComplete={() => { playThoughtDone(); setShowAnimation(false); setStep(2) }} />
      )}

      {/* ─── 步骤2：分析 ─── */}
      {step === 2 && analysis && (
        <div className="space-y-5">
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--fg)]">你脑子里倒出了这些</h1>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
            <p className="text-[14px] leading-relaxed text-[var(--fg-secondary)]">{analysis.summary}</p>
          </div>
          <div className="space-y-1.5">
            {visibleItems.map((item, i) => {
              const cfg = categoryConfig[item.category] || categoryConfig.other
              return (
                <button key={i} onClick={() => handlePickFromList(item.content)}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  className={`stagger-item card-hover btn-press group flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-left shadow-sm hover:border-[var(--fg-muted)] border-l-[3px] ${cfg.border}`}>
                  <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
                  <span className="flex-1 text-[14px] text-[var(--fg)]">{item.content}</span>
                  <span className="text-[11px] text-[var(--fg-subtle)]">{cfg.label}</span>
                  <ArrowRight className="mt-px h-3.5 w-3.5 shrink-0 text-[var(--fg-subtle)] opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              )
            })}
            {hiddenCount > 0 && !showAll && (
              <button onClick={() => setShowAll(true)} className="flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[13px] text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]">
                <ChevronDown className="h-3.5 w-3.5" />展开全部 {analysis.items.length} 条
              </button>
            )}
          </div>
          {aiQuestion && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
              <div className="mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span className="text-[11px] font-medium text-[var(--fg-subtle)]">帮你梳理后的问题</span>
              </div>
              <p className="text-[14px] font-medium leading-relaxed text-[var(--fg)]">{aiQuestion}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3.5 text-sm text-[var(--fg-secondary)] hover:bg-[var(--bg)]"><ArrowLeft className="h-4 w-4" />返回</button>
            <button onClick={() => setStep(3)} className="btn-press flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--fg)] py-3.5 text-sm font-medium text-[var(--bg)] hover:opacity-80">选今天的一件事 <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* ─── 步骤3：聚焦 ─── */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--fg)]">今天唯一重要的事</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--fg-secondary)]">如果今天只能完成一件事——哪件事让其他事都变得不重要？</p>
          </div>
          <input value={oneThing} onChange={(e) => setOneThing(e.target.value)}
            className="w-full rounded-xl border border-[var(--fg-subtle)] bg-[var(--bg-card)] p-4 text-[15px] font-medium shadow-sm placeholder:font-normal placeholder:text-[var(--fg-subtle)] focus:border-[var(--fg-muted)] focus:outline-none"
            placeholder="今天最重要的一件事是…" autoFocus />
          <input value={oneThingWhy} onChange={(e) => setOneThingWhy(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 text-sm shadow-sm placeholder:text-[var(--fg-subtle)] focus:border-[var(--fg-subtle)] focus:outline-none"
            placeholder="为什么这件事重要？（可选）" />
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3.5 text-sm text-[var(--fg-secondary)] hover:bg-[var(--bg)]"><ArrowLeft className="h-4 w-4" />返回</button>
            <button onClick={() => { if (oneThing.trim()) setStep(4) }} disabled={!oneThing.trim()}
              className="btn-press flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--fg)] py-3.5 text-sm font-medium text-[var(--bg)] hover:opacity-80 disabled:opacity-30">选定 <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* ─── 步骤4：定意图 ─── */}
      {step === 4 && (
        <div className="space-y-5">
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--fg)]">让开始变得容易</h1>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--fg-subtle)]">你今天要做的事</p>
            <p className="mt-1 font-medium text-[var(--fg)]">{oneThing}</p>
            {oneThingWhy && <p className="mt-1 text-sm text-[var(--fg-muted)]">{oneThingWhy}</p>}
          </div>
          <div className="rounded-xl bg-[var(--accent-bg)] px-4 py-3.5">
            <p className="text-[13px] leading-relaxed text-[var(--accent-text)]">
              研究表明：把目标写成<b>"如果到了 X 时间，在 Y 地点，就做 Z"</b>，成功率比单纯想"我要做 Z"高出 <b>2-3 倍</b>。
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--fg-secondary)]">什么时间开始？</label>
              <input value={intentTime} onChange={(e) => setIntentTime(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 text-sm shadow-sm placeholder:text-[var(--fg-subtle)] focus:border-[var(--fg-muted)] focus:outline-none"
                placeholder="比如：上午9点、下午2点半、晚饭后" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--fg-secondary)]">在哪里开始？</label>
              <input value={intentPlace} onChange={(e) => setIntentPlace(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 text-sm shadow-sm placeholder:text-[var(--fg-subtle)] focus:border-[var(--fg-muted)] focus:outline-none"
                placeholder="比如：书房桌前、公司工位、咖啡店" />
            </div>
          </div>
          {intentTime && intentPlace && (
            <div className="rounded-2xl border-2 border-[var(--fg)] bg-[var(--bg)] px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">你的执行意图</p>
              <p className="mt-1.5 text-[15px] font-semibold leading-relaxed text-[var(--fg)]">
                如果到了 <span className="underline decoration-[var(--accent)] decoration-2 underline-offset-4">{intentTime}</span>，我在 <span className="underline decoration-[var(--accent)] decoration-2 underline-offset-4">{intentPlace}</span>，我就开始 <span className="underline decoration-[var(--accent)] decoration-2 underline-offset-4">{oneThing}</span>。
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3.5 text-sm text-[var(--fg-secondary)] hover:bg-[var(--bg)]"><ArrowLeft className="h-4 w-4" />返回</button>
            <button onClick={saveFocus} className="btn-press flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--fg)] py-3.5 text-sm font-medium text-[var(--bg)] hover:opacity-80">定好计划，去执行 <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* ─── 步骤5：执行─── */}
      {step === 5 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--fg)]">
              专注执行
            </h1>
          </div>

          {/* 任务卡 */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--fg-subtle)]">今天唯一重要的事</p>
            <p className="mt-1 font-medium text-[var(--fg)]">{oneThing}</p>
            {oneThingWhy && <p className="mt-1 text-[13px] text-[var(--fg-muted)]">{oneThingWhy}</p>}
            {sessions > 0 && (
              <span className="mt-2 inline-block rounded-full bg-[var(--bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--fg-secondary)]">{sessions} 🍅</span>
            )}
          </div>

          {/* 时长选择（未开始时） */}
          {!isRunning && !showDoneOptions && !partialMessage && (
            <div className="space-y-4">
              {!isBreak ? (
                <>
                  <p className="text-sm font-medium text-[var(--fg-muted)]">选择专注时长</p>
                  <div className="flex flex-wrap gap-2.5">
                    {PRESETS.map((p) => {
                      const selected = !isCustomMode && focusMins === p.mins
                      return (
                        <button key={p.mins} onClick={() => selectPreset(p.mins)}
                          className={`btn-press flex-shrink-0 rounded-2xl px-5 py-3 text-center ${
                            selected ? "bg-[var(--selected-bg)] text-[var(--selected-text)] shadow-sm" : "bg-[var(--bg-card)] text-[var(--fg-secondary)] shadow-sm ring-1 ring-[var(--border)] hover:ring-[var(--fg-muted)]"
                          }`}>
                          <div className="text-lg font-bold leading-none">{p.mins}</div>
                          <div className="mt-1 text-xs opacity-70">{p.label}</div>
                          <div className="text-[10px] opacity-50">{p.hint}</div>
                        </button>
                      )
                    })}
                    <button onClick={() => { setIsCustomMode(true); setCustomInputVal(String(focusMins)) }}
                      className={`btn-press flex-shrink-0 rounded-2xl px-5 py-3 text-center ${
                        isCustomMode ? "bg-[var(--selected-bg)] text-[var(--selected-text)] shadow-sm" : "bg-[var(--bg-card)] text-[var(--fg-subtle)] shadow-sm ring-1 ring-dashed ring-[var(--fg-subtle)] hover:ring-[var(--fg-muted)] hover:text-[var(--fg-secondary)]"
                      }`}>
                      <Sparkles className="mx-auto h-5 w-5" />
                      <div className="mt-1 text-xs">自定义</div>
                    </button>
                  </div>
                  {isCustomMode && (
                    <div className="flex items-center gap-2.5">
                      <input type="number" value={customInputVal} onChange={(e) => { setCustomInputVal(e.target.value); const v = parseInt(e.target.value); if (v >= 1 && v <= 180) { setFocusMins(v); setTimeLeft(v * 60); setTotalSecs(v * 60); totalSecsRef.current = v * 60 } }}
                        className="w-20 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5 text-center text-sm font-medium focus:border-[var(--fg-muted)] focus:outline-none" min={1} max={180} placeholder="分钟" autoFocus />
                      <span className="text-sm text-[var(--fg-subtle)]">分钟（1-180）</span>
                    </div>
                  )}
                  <button onClick={() => startFocus()}
                    className="btn-press flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--fg)] py-3.5 text-sm font-medium text-[var(--bg)] hover:opacity-80">
                    <Play className="h-4 w-4" />开始专注（{displayMins} 分钟）
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-[var(--fg-muted)]">休息时长</p>
                  <div className="flex flex-wrap gap-2.5">
                    {BREAK_PRESETS.map((p) => (
                      <button key={p.mins} onClick={() => setBreakMins(p.mins)}
                        className={`btn-press flex-shrink-0 rounded-2xl px-5 py-3 text-center ${
                          breakMins === p.mins ? "bg-[var(--done)] text-white shadow-sm" : "bg-[var(--bg-card)] text-[var(--fg-muted)] shadow-sm ring-1 ring-[var(--border)] hover:ring-[var(--fg-muted)]"
                        }`}>
                        <div className="text-lg font-bold leading-none">{p.mins}</div>
                        <div className="mt-1 text-xs opacity-70">{p.label}</div>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => startBreak()}
                    className="btn-press flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--fg)] py-3.5 text-sm font-medium text-[var(--bg)] hover:opacity-80">
                    <Coffee className="h-4 w-4" />开始休息（{breakMins} 分钟）
                  </button>
                </>
              )}
            </div>
          )}

          {/* 计时器圆环 */}
          {(isRunning || paused) && (
            <div className="flex flex-col items-center">
              <div className="relative mb-5">
                {isRunning && !paused && !isBreak && (
                  <svg width="240" height="240" className="absolute inset-0 -rotate-90">
                    <circle cx="120" cy="120" r="115" fill="none" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 8" className="pulse-ring" />
                  </svg>
                )}
                <svg width="240" height="240" className="-rotate-90">
                  <circle cx="120" cy="120" r="110" fill="none" stroke="var(--border-light)" strokeWidth="7" />
                  <circle cx="120" cy="120" r="110" fill="none"
                    stroke={paused ? "var(--fg-subtle)" : isBreak ? "var(--done)" : "var(--fg)"} strokeWidth="7"
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-light tracking-tight tabular-nums transition-colors ${paused ? "text-[var(--fg-subtle)]" : isBreak ? "text-[var(--done)]" : "text-[var(--fg)]"}`}>
                    {formatTime(timeLeft)}
                  </span>
                  <span className="mt-2.5 text-xs text-[var(--fg-subtle)]">
                    {paused ? "已暂停" : isBreak ? `休息 · ${breakMins} 分钟` : `专注中 · ${focusMins} 分钟`}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button onClick={reset} className="btn-press inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-5 py-2.5 text-sm font-medium text-[var(--fg-secondary)] hover:bg-[var(--bg)]"><RotateCcw className="h-4 w-4" />重置</button>
                <button onClick={togglePause} className="btn-press inline-flex items-center gap-2 rounded-full bg-[var(--fg)] px-6 py-2.5 text-sm font-medium text-[var(--bg)] hover:opacity-80">
                  {paused ? <><Play className="h-4 w-4" />继续</> : <><Pause className="h-4 w-4" />暂停</>}
                </button>
              </div>
            </div>
          )}

          {/* 完成选择 */}
          {showDoneOptions && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
                <p className="text-center text-[15px] font-medium text-[var(--fg)]">专注结束，进展如何？</p>
              </div>
              <button onClick={() => markDone("done")}
                className="btn-press flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--done)] py-3.5 text-sm font-medium text-white hover:opacity-80">
                <CheckCircle className="h-4 w-4" />完成了，今天搞定
              </button>
              <button onClick={() => { setShowDoneOptions(false); startBreak() }}
                className="btn-press flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-3.5 text-sm font-medium text-[var(--fg-secondary)] hover:bg-[var(--bg)]">
                <Coffee className="h-4 w-4" />还没完，休息 {breakMins} 分钟继续
              </button>
              <button onClick={() => markDone("partial")}
                className="w-full py-2.5 text-center text-sm text-[var(--fg-subtle)] hover:text-[var(--fg-secondary)]">
                完成了一部分，明天继续
              </button>
            </div>
          )}

          {/* 部分完成确认 */}
          {partialMessage && (
            <div className="flex flex-col items-center gap-4 py-8 pop-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-bg)]">
                <Sparkles className="h-8 w-8 text-[var(--accent)]" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-[var(--fg)]">已记录</p>
                <p className="mt-1 text-[14px] text-[var(--fg-muted)]">明天继续加油</p>
              </div>
              <button onClick={() => router.push("/")}
                className="btn-press mt-2 rounded-xl bg-[var(--fg)] px-8 py-3 text-sm font-medium text-[var(--bg)] hover:opacity-80">
                继续
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
