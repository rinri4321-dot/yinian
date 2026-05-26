// Web Audio API 合成音效 —— 无需外部音频文件

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      ctx = new AudioContext()
    }
    return ctx
  } catch {
    return null
  }
}

// ── 辅助：播放一个频率/时长的音 ──

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.08,
  delay = 0
) {
  try {
    const c = getCtx()
    if (!c) return

    // 静默处理 suspended 状态（浏览器自动播放限制）
    if (c.state === "suspended") {
      c.resume().catch(() => {})
      // 如果还是 suspended，就不播放
      if (c.state === "suspended") return
    }

    const osc = c.createOscillator()
    const gain = c.createGain()

    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(volume, c.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration)

    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(c.currentTime + delay)
    osc.stop(c.currentTime + delay + duration)
  } catch {
    // 静默失败：浏览器不支持或音频上下文出错
  }
}

// ── 开始专注：轻轻上扬 ──
export function playFocusStart() {
  playTone(440, 0.15, "sine", 0.06)
  playTone(660, 0.2, "sine", 0.05, 0.1)
}

// ── 专注完成：双音叮咚 ──
export function playFocusComplete() {
  playTone(660, 0.25, "sine", 0.08)
  playTone(880, 0.35, "sine", 0.07, 0.15)
}

// ── 任务完成：清脆确认 ──
export function playTaskDone() {
  playTone(880, 0.1, "sine", 0.06)
  playTone(1100, 0.15, "sine", 0.05, 0.06)
  playTone(1320, 0.2, "sine", 0.04, 0.12)
}

// ── 休息结束：轻铃 ──
export function playBreakEnd() {
  playTone(550, 0.2, "triangle", 0.05)
  playTone(660, 0.3, "triangle", 0.04, 0.12)
}

// ── 按钮轻触 ──
export function playTick() {
  playTone(800, 0.04, "sine", 0.03)
}

// ── 粒子庆祝：上升音阶 ──
export function playCelebration() {
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    playTone(freq, 0.2, "sine", 0.06, i * 0.08)
  })
}

// ── 思绪动画完成：柔和下行 ──
export function playThoughtDone() {
  playTone(660, 0.3, "sine", 0.05)
  playTone(550, 0.35, "sine", 0.04, 0.15)
  playTone(440, 0.4, "sine", 0.03, 0.3)
}

// ── 回顾保存：温和确认 ──
export function playReviewSaved() {
  playTone(528, 0.15, "sine", 0.05)
  playTone(660, 0.25, "sine", 0.04, 0.12)
}

// ── 心情选择：轻快弹跳 ──
export function playMoodPick() {
  playTone(1047, 0.06, "sine", 0.03)
}

// ── 打开弹窗 ──
export function playOpen() {
  playTone(600, 0.08, "sine", 0.04)
  playTone(800, 0.12, "sine", 0.03, 0.05)
}

// ── 关闭弹窗 ──
export function playClose() {
  playTone(800, 0.08, "sine", 0.03)
  playTone(600, 0.12, "sine", 0.04, 0.05)
}
