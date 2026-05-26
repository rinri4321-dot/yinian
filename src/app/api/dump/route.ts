import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { analyzeDump, generateFollowUpQuestion } from "@/lib/ai"
import { getTodayStr } from "@/lib/utils"

export async function POST(request: Request) {
  const { content } = await request.json()

  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 })
  }

  const analysis = await analyzeDump(content)
  const question = await generateFollowUpQuestion(content, analysis)

  const todayStr = getTodayStr()
  const today = new Date(todayStr)

  await prisma.dailyRecord.upsert({
    where: { date: today },
    update: {
      brainDump: content,
      dumpAnalysis: JSON.stringify(analysis),
    },
    create: {
      date: today,
      brainDump: content,
      dumpAnalysis: JSON.stringify(analysis),
    },
  })

  return NextResponse.json({ analysis, question })
}
