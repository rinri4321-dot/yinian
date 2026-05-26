import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateInsight } from "@/lib/ai"
import { getWeekRange } from "@/lib/utils"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  if (type === "records") {
    const records = await prisma.dailyRecord.findMany({
      orderBy: { date: "desc" },
      take: 30,
    })
    return NextResponse.json({ records })
  }

  // 生成周洞察
  const { start, end } = getWeekRange()

  const weekRecords = await prisma.dailyRecord.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    orderBy: { date: "asc" },
  })

  if (weekRecords.length === 0) {
    return NextResponse.json({
      insight: "还没有数据。完成几次清空和执行后，这里会出现你的个人洞察。",
    })
  }

  const insight = await generateInsight(weekRecords)

  // 保存洞察
  const existingInsight = await prisma.weeklyInsight.findFirst({
    where: { weekStart: start },
  })

  if (!existingInsight) {
    await prisma.weeklyInsight.create({
      data: {
        weekStart: start,
        weekEnd: end,
        insightText: insight,
      },
    })
  }

  return NextResponse.json({ insight })
}
