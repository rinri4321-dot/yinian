import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getTodayStr, getWeekRange, calcClarityScore } from "@/lib/utils"

export async function GET() {
  const todayStr = getTodayStr()
  const today = new Date(todayStr)

  let record = await prisma.dailyRecord.findUnique({
    where: { date: today },
  })

  // 查昨天的回顾，看有没有"明天的一件事"
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayRecord = await prisma.dailyRecord.findUnique({
    where: { date: yesterday },
  })
  const suggestedFromYesterday = yesterdayRecord?.reviewNextOne || null

  // 本周快照
  const { start, end } = getWeekRange()
  const weekRecords = await prisma.dailyRecord.findMany({
    where: { date: { gte: start, lte: end } },
  })
  const weeklySnapshot = {
    doneDays: weekRecords.filter((r) => r.oneThingDone === "done").length,
    totalFocus: weekRecords.reduce((s, r) => s + r.focusMinutes, 0),
    totalDays: weekRecords.length,
  }

  if (!record) {
    return NextResponse.json({
      date: todayStr,
      oneThing: null,
      oneThingWhy: null,
      intentFull: null,
      focusMinutes: 0,
      focusSessions: 0,
      oneThingDone: null,
      reviewDone1: null,
      suggestedFromYesterday,
      weeklySnapshot,
      clarity: { score: 50, label: "需要清空" },
    })
  }

  const clarity = calcClarityScore(record)

  return NextResponse.json({
    date: todayStr,
    oneThing: record.oneThing,
    oneThingWhy: record.oneThingWhy,
    intentFull: record.intentFull,
    focusMinutes: record.focusMinutes,
    focusSessions: record.focusSessions,
    oneThingDone: record.oneThingDone,
    reviewDone1: record.reviewDone1,
    suggestedFromYesterday,
    weeklySnapshot,
    clarity,
  })
}

export async function POST(request: Request) {
  const { oneThing, oneThingWhy, intentTime, intentPlace, intentFull } =
    await request.json()

  const todayStr = getTodayStr()
  const today = new Date(todayStr)

  await prisma.dailyRecord.upsert({
    where: { date: today },
    update: {
      oneThing,
      oneThingWhy,
      intentTime,
      intentPlace,
      intentFull,
    },
    create: {
      date: today,
      oneThing,
      oneThingWhy,
      intentTime,
      intentPlace,
      intentFull,
    },
  })

  return NextResponse.json({ success: true })
}
