import { Suspense } from "react"
import TodayContent from "./TodayContent"

export default function TodayPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-lg px-5 py-10">
        <div className="skeleton h-8 w-48 rounded mb-8" />
        <div className="skeleton h-96 rounded-2xl mb-4" />
      </div>
    }>
      <TodayContent />
    </Suspense>
  )
}
