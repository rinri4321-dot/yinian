"use client"

import { ArrowLeft, Brain, Target, Zap, BookOpen, Pencil, TrendingUp, Lightbulb } from "lucide-react"
import { useRouter } from "next/navigation"

const TECHNIQUES = [
  {
    num: "01",
    icon: Brain,
    title: "思维倾倒",
    en: "Cognitive Offloading",
    problem: "焦虑",
    evidence: "多项对照实验证实：将想法外部化可显著降低认知负荷和工作记忆压力。（Sweller, 1988; Grinschgl et al., 2021）",
    mapping: "对应「清空大脑」——把所有杂念倒出来，大脑不再死抓着不放。",
    color: "#eb9a4a",
    bg: "var(--accent-bg)",
  },
  {
    num: "02",
    icon: BookOpen,
    title: "GTD 清空法",
    en: "Capture & Clarify",
    problem: "焦虑",
    evidence: "一项 RCT（范宏霞 & 王晓, 2015）发现：接受 GTD 培训 6 个月后，参与者焦虑水平显著降低（p < 0.05）。",
    mapping: "对应「清空大脑」后的 AI 分类——捕获所有想法，逐条厘清。",
    color: "var(--tech-blue)",
    bg: "var(--tech-blue-bg)",
  },
  {
    num: "03",
    icon: Target,
    title: "唯一目标",
    en: "The ONE Thing",
    problem: "迷茫",
    evidence: "帕累托法则（80/20）指出 80% 结果来自 20% 努力。决策疲劳研究（Baumeister, 1998）证实选择越多行动越少。",
    mapping: "对应「聚焦一件事」——每天只选一件，砍掉所有噪音。",
    color: "#2d8a6e",
    bg: "var(--done-bg)",
  },
  {
    num: "04",
    icon: Zap,
    title: "执行意图",
    en: "Implementation Intention",
    problem: "拖延",
    evidence: "Gollwitzer & Sheeran 对 94 项研究的元分析：执行意图对目标达成有中到大效应量（d = 0.65）。",
    mapping: "对应「定意图」——把目标写成「如果 X 时间在 Y 地点，就做 Z」，成功率提升 2-3 倍。",
    color: "var(--tech-purple)",
    bg: "var(--tech-purple-bg)",
  },
  {
    num: "05",
    icon: Pencil,
    title: "5 分钟法则",
    en: "Behavioral Activation",
    problem: "拖延",
    evidence: "CBT 核心干预技术：行动先于动机。约 80% 的人开始 5 分钟后会继续做下去（蔡加尼克效应）。",
    mapping: "对应「专注执行」中的 5 分钟快速启动——绕过大脑的威胁检测系统。",
    color: "var(--tech-red)",
    bg: "var(--tech-red-bg)",
  },
  {
    num: "06",
    icon: Lightbulb,
    title: "结构化反思",
    en: "Structured Journaling",
    problem: "迷茫",
    evidence: "20 项 RCT 的元分析：结构化日记干预对症状改善有显著效果（B 级推荐）。关键是结构化而非随意写。",
    mapping: "对应「晚间回顾」——三个固定问题：达成了什么？可以更好的是什么？明天的一件事？",
    color: "var(--tech-brown)",
    bg: "var(--tech-brown-bg)",
  },
  {
    num: "07",
    icon: TrendingUp,
    title: "认知重评",
    en: "Cognitive Reappraisal",
    problem: "焦虑",
    evidence: "CBT 金标准技术（JAMA, 2025）：识别自动产生的消极思维，用现实证据重新评估。",
    mapping: "对应 AI 分析——DeepSeek 帮你从客观角度审视你的担忧，区分事实和恐惧。",
    color: "var(--tech-teal)",
    bg: "var(--tech-teal-bg)",
  },
]

export default function MethodPage() {
  const router = useRouter()

  return (
    <div className="page-transition mx-auto max-w-lg px-5 py-10">
      {/* 顶栏 */}
      <button
        onClick={() => router.push("/")}
        className="mb-8 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </button>

      {/* 标题 */}
      <div className="mb-3">
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-[var(--fg)]">
          不是鸡汤，是科学
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--fg-secondary)]">
          壹念的每一个功能背后，都有一项经临床验证的心理学技术。
          <br />
          这里没有玄学，只有被 RCT（随机对照试验）和元分析反复验证过的有效方法。
        </p>
      </div>

      {/* 技术卡片 */}
      <div className="mt-8 space-y-3">
        {TECHNIQUES.map((t) => (
          <div
            key={t.num}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm card-hover"
          >
            <div className="flex items-start gap-4">
              {/* 序号 + 图标 */}
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: t.bg }}
              >
                <t.icon className="h-5 w-5" style={{ color: t.color }} strokeWidth={1.5} />
              </div>

              <div className="min-w-0 flex-1">
                {/* 标题行 */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold tracking-wider text-[var(--fg-subtle)]">{t.num}</span>
                  <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t.title}</h3>
                  <span className="text-[11px] text-[var(--fg-subtle)]">{t.en}</span>
                </div>

                {/* 解决的问题 */}
                <div className="mt-0.5">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ backgroundColor: t.bg, color: t.color }}
                  >
                    解决 {t.problem}
                  </span>
                </div>

                {/* 证据 */}
                <p className="mt-2 text-[12px] leading-relaxed text-[var(--fg-muted)]">
                  {t.evidence}
                </p>

                {/* 映射到功能 */}
                <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-[var(--bg)] px-3 py-2">
                  <span className="text-[11px] shrink-0 font-medium text-[var(--fg-secondary)]">壹念中</span>
                  <p className="text-[12px] leading-relaxed text-[var(--fg-secondary)]">{t.mapping}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部 */}
      <div className="mt-8 space-y-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 text-center">
          <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">
            这些技术本身不新鲜。
            <br />
            壹念做的事是把它们打包成
            <span className="font-semibold text-[var(--fg-secondary)]">每天 10 分钟的简单练习</span>。
          </p>
        </div>
        <p className="text-center text-[11px] text-[var(--fg-subtle)]">
          由一个人 + Claude Code 构建 · DeepSeek 驱动 AI · 为「解决我们这代人的问题」而生
        </p>
      </div>
    </div>
  )
}
