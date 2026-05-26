import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getTodayStr } from "@/lib/utils"

export async function POST(request: Request) {
  const { duration, completed, oneThingDone } = await request.json()

  const todayStr = getTodayStr()
  const today = new Date(todayStr)

  const record = await prisma.dailyRecord.findUnique({
    where: { date: today },
  })

  if (!record) {
    return NextResponse.json({ error: "no record for today" }, { status: 404 })
  }

  const updateData: Record<string, unknown> = {}

  if (duration) {
    updateData.focusMinutes = record.focusMinutes + Math.floor(duration / 60)
    updateData.focusSessions = record.focusSessions + 1
  }

  if (oneThingDone) {
    updateData.oneThingDone = oneThingDone
  }

  await prisma.dailyRecord.update({
    where: { date: today },
    data: updateData,
  })

  return NextResponse.json({ success: true })
}
