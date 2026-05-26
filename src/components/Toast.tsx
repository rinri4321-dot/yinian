"use client"

import { useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"

interface Props {
  message: string
  show: boolean
  onDone: () => void
}

export default function Toast({ message, show, onDone }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const t = setTimeout(() => {
        setVisible(false)
        setTimeout(onDone, 300)
      }, 1800)
      return () => clearTimeout(t)
    }
  }, [show, onDone])

  if (!show && !visible) return null

  return (
    <div
      className={`fixed left-1/2 top-8 z-[100] -translate-x-1/2 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-center gap-2 rounded-full bg-[var(--fg)] px-4 py-2.5 text-sm text-[var(--bg)] shadow-lg">
        <CheckCircle2 className="h-4 w-4 text-[#2d8a6e]" />
        {message}
      </div>
    </div>
  )
}
