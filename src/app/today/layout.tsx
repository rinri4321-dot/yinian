import type { Metadata } from "next"

export const metadata: Metadata = { title: "今日" }

export default function TodayLayout({ children }: { children: React.ReactNode }) {
  return children
}
