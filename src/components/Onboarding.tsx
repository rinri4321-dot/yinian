"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, Brain, Target, Sparkles, ChevronRight } from "lucide-react"

const SLIDES = [
  {
    icon: Brain,
    iconBg: "bg-[var(--accent-bg)]",
    iconColor: "text-[#eb9a4a]",
    accentColor: "#eb9a4a",
    accentBg: "var(--accent-bg)",
    tag: "我们这代人",
    title: "焦虑、拖延、迷茫\n不是三个问题\n是一个循环",
    body: "焦虑让你不敢开始。\n不开始让你更焦虑。\n越拖越不知道做什么。\n——这些我都经历过。\n\n我查了临床心理学研究，\n然后用 AI 一个人做出了这个工具。\n它帮了我，希望也能帮你。",
  },
  {
    icon: Target,
    iconBg: "bg-[var(--done-bg)]",
    iconColor: "text-[#2d8a6e]",
    accentColor: "#2d8a6e",
    accentBg: "var(--done-bg)",
    tag: "解法",
    title: "每天只做\n一件事就够了",
    body: "思维倾倒降低焦虑。\n唯一目标消除迷茫。\n执行意图打败拖延。\n7 项临床研究支撑，不是鸡汤。",
  },
  {
    icon: Sparkles,
    iconBg: "bg-[var(--accent-bg)]",
    iconColor: "text-[#eb9a4a]",
    accentColor: "#eb9a4a",
    accentBg: "var(--accent-bg)",
    tag: "方法",
    title: "每天 10 分钟\n三步走",
    body: "",
    steps: [
      { num: "1", label: "清空大脑", desc: "把所有杂念倒出来，分类整理" },
      { num: "2", label: "聚焦一件事", desc: "找到今天唯一重要的任务" },
      { num: "3", label: "开始执行", desc: "用番茄钟推进，先做 5 分钟" },
    ],
  },
]

export default function Onboarding() {
  const [visible, setVisible] = useState(false)
  const [slide, setSlide] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const [stepsVisible, setStepsVisible] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem("yinian_onboarded")
    if (!seen) {
      setVisible(true)
    }
  }, [])

  // 切页动画
  const goTo = (next: number) => {
    if (next === slide) return
    setSlide(next)
    setAnimKey((k) => k + 1)
    setStepsVisible(false)
    if (SLIDES[next].steps) {
      setTimeout(() => setStepsVisible(true), 350)
    }
  }

  const handleDone = () => {
    setExiting(true)
    setTimeout(() => {
      localStorage.setItem("yinian_onboarded", "1")
      setVisible(false)
    }, 500)
  }

  const handleNext = () => {
    if (slide < SLIDES.length - 1) {
      goTo(slide + 1)
    } else {
      handleDone()
    }
  }

  if (!visible) return null

  const s = SLIDES[slide]
  const Icon = s.icon

  return (
    <div
      className={`fixed inset-0 z-[300] flex items-center justify-center transition-all duration-500 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "var(--bg)" }}
    >
      {/* 背景装饰 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-20 -right-20 h-80 w-80 rounded-full opacity-[0.04] transition-all duration-700"
          style={{ backgroundColor: s.accentColor, transform: `scale(${exiting ? 0.8 : 1})` }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full opacity-[0.03] transition-all duration-700"
          style={{ backgroundColor: s.accentColor, transform: `scale(${exiting ? 0.8 : 1})` }}
        />
      </div>

      <div className="relative mx-auto flex h-full max-w-lg flex-col px-6 py-10">
        {/* 顶栏：进度 + 跳过 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-500 ${
                  i === slide
                    ? "h-1.5 w-8"
                    : i < slide
                    ? "h-1.5 w-1.5 bg-[var(--fg-subtle)]"
                    : "h-1.5 w-1.5 bg-[var(--border)]"
                }`}
                style={{
                  backgroundColor: i === slide ? s.accentColor : undefined,
                }}
              />
            ))}
          </div>
          <button
            onClick={handleDone}
            className="text-[13px] font-medium text-[var(--fg-subtle)] transition-colors hover:text-[var(--fg-secondary)]"
          >
            跳过
          </button>
        </div>

        {/* 主内容 */}
        <div className="flex flex-1 flex-col justify-center">
          {/* 标签 */}
          <div
            key={`tag-${animKey}`}
            className="mb-8 inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wider"
            style={{
              backgroundColor: s.accentBg,
              color: s.accentColor,
              animation: "page-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
          >
            {s.tag}
          </div>

          {/* 图标 */}
          <div
            key={`icon-${animKey}`}
            className={`mb-10 flex h-20 w-20 items-center justify-center rounded-3xl ${s.iconBg}`}
            style={{
              animation: "pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both",
            }}
          >
            <Icon className={`h-9 w-9 ${s.iconColor}`} strokeWidth={1.5} />
          </div>

          {/* 标题 */}
          <h1
            key={`title-${animKey}`}
            className="text-[2.25rem] font-bold leading-[1.15] tracking-tight text-[var(--fg)]"
            style={{ animation: "page-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both" }}
          >
            {s.title.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < s.title.split("\n").length - 1 && <br />}
              </span>
            ))}
          </h1>

          {/* 正文 */}
          {s.body && (
            <p
              key={`body-${animKey}`}
              className="mt-6 text-[16px] leading-[1.75] text-[var(--fg-secondary)]"
              style={{ animation: "page-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both" }}
            >
              {s.body.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i < s.body.split("\n").length - 1 && <br />}
                </span>
              ))}
            </p>
          )}

          {/* 步骤卡片 */}
          {s.steps && (
            <div className="mt-8 space-y-3">
              {s.steps.map((step, i) => (
                <div
                  key={step.num}
                  className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm card-hover"
                  style={{
                    animation: `page-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${0.35 + i * 0.1}s both`,
                    opacity: stepsVisible ? 1 : 0,
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                    style={{
                      backgroundColor: s.accentBg,
                      color: s.accentColor,
                    }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[var(--fg)]">{step.label}</p>
                    <p className="text-[13px] text-[var(--fg-muted)]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between pt-6">
          <p className="text-[12px] font-medium text-[var(--fg-subtle)]">
            {slide + 1} / {SLIDES.length}
          </p>
          <button
            onClick={handleNext}
            className="btn-press group flex items-center gap-2 rounded-full bg-[var(--fg)] px-6 py-3.5 text-sm font-semibold text-[var(--bg)] shadow-lg shadow-black/5 transition-all hover:opacity-80 hover:shadow-black/10"
          >
            {slide < SLIDES.length - 1 ? (
              <>
                继续
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            ) : (
              <>
                开始使用
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
