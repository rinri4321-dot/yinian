import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getTodayStr } from "@/lib/utils"

export async function POST(request: Request) {
  const { done1, better, nextOne, mood } = await request.json()

  const todayStr = getTodayStr()
  const today = new Date(todayStr)

  await prisma.dailyRecord.upsert({
    where: { date: today },
    update: {
      reviewDone1: done1,
      reviewBetter: better,
      reviewNextOne: nextOne,
      moodScore: mood,
    },
    create: {
      date: today,
      reviewDone1: done1,
      reviewBetter: better,
      reviewNextOne: nextOne,
      moodScore: mood,
    },
  })

  return NextResponse.json({ success: true })
}
