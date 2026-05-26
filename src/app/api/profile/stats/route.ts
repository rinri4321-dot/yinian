import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { calcClarityScore } from "@/lib/utils"

export async function GET() {
  const records = await prisma.dailyRecord.findMany({
    orderBy: { date: "desc" },
    take: 365,
  })

  const totalFocus = records.reduce((s, r) => s + r.focusMinutes, 0)
  const totalSessions = records.reduce((s, r) => s + r.focusSessions, 0)
  const doneDays = records.filter((r) => r.oneThingDone === "done").length
  const avgClarity = records.length > 0
    ? Math.round(records.reduce((s, r) => s + calcClarityScore(r).score, 0) / records.length)
    : 50

  return NextResponse.json({
    totalDays: records.length,
    totalFocus,
    totalSessions,
    doneDays,
    avgClarity,
  })
}
