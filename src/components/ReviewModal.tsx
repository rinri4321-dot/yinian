"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { playMoodPick, playReviewSaved, playOpen, playClose } from "@/lib/sounds"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    done1: string
    better: string
    nextOne: string
    mood: number
  }) => void
}

export default function ReviewModal({ isOpen, onClose, onSubmit }: Props) {
  const [done1, setDone1] = useState("")
  const [better, setBetter] = useState("")
  const [nextOne, setNextOne] = useState("")
  const [mood, setMood] = useState(0)

  useEffect(() => {
    if (isOpen) playOpen()
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!done1.trim()) return
    playReviewSaved()
    onSubmit({ done1, better, nextOne, mood })
    setDone1("")
    setBetter("")
    setNextOne("")
    setMood(0)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--fg)]/10 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="slide-up-enter w-full max-w-lg rounded-t-2xl bg-[var(--bg-card)] p-6 shadow-xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--fg)]">晚间回顾</h2>
          <button onClick={() => { playClose(); onClose() }} className="text-[var(--fg-subtle)] hover:text-[var(--fg-secondary)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--fg-secondary)]">
              今天达成了什么？
            </label>
            <textarea
              value={done1}
              onChange={(e) => setDone1(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-sm focus:border-[var(--fg-muted)] focus:outline-none"
              rows={2}
              placeholder="哪怕是很小的事…"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--fg-secondary)]">
              有什么可以做得更好？
            </label>
            <textarea
              value={better}
              onChange={(e) => setBetter(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-sm focus:border-[var(--fg-muted)] focus:outline-none"
              rows={2}
              placeholder="不是自我批评，是学习…"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--fg-secondary)]">
              明天最重要的一件事？
            </label>
            <input
              value={nextOne}
              onChange={(e) => setNextOne(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-sm focus:border-[var(--fg-muted)] focus:outline-none"
              placeholder="提前想好，明天少一个决策"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--fg-secondary)]">
              今天整体心情
            </label>
            <div className="flex gap-1.5">
              {[
                { score: 1, emoji: "😞", label: "很差" },
                { score: 2, emoji: "😔", label: "不太好" },
                { score: 3, emoji: "😐", label: "一般" },
                { score: 4, emoji: "🙂", label: "不错" },
                { score: 5, emoji: "😊", label: "很好" },
              ].map(({ score, emoji, label }) => (
                <button
                  key={score}
                  onClick={() => { setMood(score); playMoodPick() }}
                  className={`btn-press flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2.5 transition-all ${
                    mood === score
                      ? "pop-in bg-[var(--fg)] text-[var(--bg)] shadow-sm"
                      : "bg-[var(--bg)] text-[var(--fg-subtle)] hover:bg-[var(--border-light)] hover:text-[var(--fg-secondary)]"
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className={`text-xs ${mood === score ? "text-[var(--bg)]" : "text-[var(--fg-subtle)]"}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!done1.trim()}
          className="btn-press mt-6 w-full rounded-xl bg-[var(--fg)] py-3.5 text-sm font-medium text-[var(--bg)] transition-all hover:opacity-80 disabled:opacity-30"
        >
          完成回顾
        </button>
      </div>
    </div>
  )
}
