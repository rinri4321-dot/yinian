"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("yinian_theme")
    if (stored === "dark") {
      setDark(true)
      document.documentElement.classList.add("dark")
    } else if (stored === "light") {
      setDark(false)
      document.documentElement.classList.remove("dark")
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("yinian_theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("yinian_theme", "light")
    }
  }

  if (!mounted) return <div className="h-8 w-8" />

  return (
    <button
      onClick={toggle}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--fg-secondary)] transition-all duration-500 hover:text-[var(--fg)]"
      title={dark ? "切换到浅色模式" : "切换到深色模式"}
    >
      <span className={`inline-block transition-all duration-500 ${dark ? "rotate-180" : "rotate-0"}`}>
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </span>
    </button>
  )
}
