import OpenAI from "openai"
import type { DumpAnalysis, DumpItem } from "@/types"

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: "https://api.deepseek.com",
})

// ── 清空分析 + 跟进提问（合并为一次调用，省钱） ──────────

export async function analyzeDump(content: string): Promise<DumpAnalysis> {
  try {
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: `你是一个思维整理助手。用户会把脑子里乱七八糟的想法倒给你。
请分析这些内容，返回一个 JSON：

{
  "items": [
    { "content": "用户写的原话", "category": "worry|task|idea|reminder|other" }
  ],
  "summary": "一句话总结（50字以内），点出主要情绪和重点"
}

分类规则：
- worry: 表达焦虑、担心、害怕、压力、迷茫
- task: 具体要做的事、任务、目标
- idea: 想法、灵感、想尝试的事
- reminder: 提醒、别忘了的事
- other: 其他无法归类的

summary 要有人情味，不要机械罗列。`,
        },
        {
          role: "user",
          content: content,
        },
      ],
      response_format: { type: "json_object" },
    })

    const text = response.choices[0]?.message?.content || "{}"
    const parsed = JSON.parse(text)

    return {
      items: (parsed.items || []) as DumpItem[],
      summary: parsed.summary || `共梳理出 ${parsed.items?.length || 0} 件事`,
    }
  } catch (error) {
    console.error("DeepSeek analyzeDump error:", error)
    // 降级到本地分类
    return fallbackAnalyze(content)
  }
}

// ── 跟进提问 ──────────────────────────────────────────

export async function generateFollowUpQuestion(
  dumpContent: string,
  analysis: DumpAnalysis
): Promise<string> {
  try {
    const tasks = analysis.items.filter((i) => i.category === "task")
    const worries = analysis.items.filter((i) => i.category === "worry")
    const itemsPreview = analysis.items
      .slice(0, 10)
      .map((i) => `[${i.category}] ${i.content}`)
      .join("\n")

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: `你是一个温和的思维引导者。用户的脑子里有一堆事，你需要问一个问题，帮 ta 从这些事里面找到今天最重要的一件。
规则：
- 只问一个问题，不要多余的话
- 语气温和，像朋友在聊天
- 如果待办事项多（task ≥ 2），引导 ta 从中选一件
- 如果焦虑情绪多（worry ≥ 2），引导 ta 找到一件可以减轻焦虑的行动
- 如果想法很多（idea ≥ 3），引导 ta 选一个可以今天就试试的
- 不要让用户感到压力`,
        },
        {
          role: "user",
          content: `我脑子里有这些事：
${itemsPreview}

分析摘要：${analysis.summary}
待办 ${tasks.length} 件，焦虑 ${worries.length} 件，想法 ${analysis.items.filter((i) => i.category === "idea").length} 件。

问我一个问题，帮我找到今天最重要的一件事。`,
        },
      ],
      max_tokens: 100,
    })

    return (
      response.choices[0]?.message?.content?.trim() ||
      "把所有事看一遍——如果今天只能完成一件事，你选哪件？"
    )
  } catch (error) {
    console.error("DeepSeek generateQuestion error:", error)
    // 降级
    const questions = [
      "这些事里，如果今天只能完成一件，哪件最重要？",
      "哪件事如果完成了，其他的就不那么紧迫了？",
      "哪件事你已经想了很久但一直没有开始？",
    ]
    return questions[Math.floor(Math.random() * questions.length)]
  }
}

// ── 周洞察 ────────────────────────────────────────────

export async function generateInsight(
  records: Array<{
    focusMinutes: number
    focusSessions: number
    oneThingDone: string | null
    moodScore: number | null
    date: Date
    oneThing: string | null
  }>
): Promise<string> {
  if (records.length === 0) {
    return "还没有数据。开始每天清空+执行，一周后这里会出现你的个人洞察。"
  }

  try {
    const summary = records.map((r) => ({
      date: r.date.toISOString().split("T")[0],
      thing: r.oneThing || "未记录",
      done: r.oneThingDone === "done" ? "完成" : r.oneThingDone === "partial" ? "部分" : "未完成",
      focus: `${r.focusMinutes}分钟`,
      mood: r.moodScore || "未记录",
    }))

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `你是一个温和的数据观察者。根据用户本周的记录，给 ta 一段洞察（100字以内）。
规则：
- 语气温和鼓励，不要批评
- 指出一个 ta 可能没注意到的模式
- 给一条具体的小建议
- 用"你"而不是"用户"
- 像朋友聊天，不要像报告`,
        },
        {
          role: "user",
          content: `本周记录：
${JSON.stringify(summary, null, 2)}

总天数：${records.length}
完成天数：${records.filter((r) => r.oneThingDone === "done").length}
累计专注：${records.reduce((s, r) => s + r.focusMinutes, 0)} 分钟
番茄钟：${records.reduce((s, r) => s + r.focusSessions, 0)} 个

给一段洞察。`,
        },
      ],
      max_tokens: 200,
    })

    return response.choices[0]?.message?.content?.trim() || "继续坚持，数据会揭示你的模式。"
  } catch (error) {
    console.error("DeepSeek generateInsight error:", error)
    // 降级
    const totalFocus = records.reduce((s, r) => s + r.focusMinutes, 0)
    const totalSessions = records.reduce((s, r) => s + r.focusSessions, 0)
    const doneCount = records.filter((r) => r.oneThingDone === "done").length
    if (totalSessions > 0) {
      return `这周完成了 ${doneCount} 天，累计专注 ${totalFocus} 分钟（${totalSessions} 个番茄钟）。继续坚持！`
    }
    return "这周还没有启动过番茄钟。试试明天开一个 5 分钟的？"
  }
}

// ── 降级方案（AI 不可用时） ────────────────────────────

function fallbackAnalyze(content: string): DumpAnalysis {
  const items = content
    .split(/[\n,，。！？、；;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
    .map((text) => ({
      content: text,
      category: classifyLocal(text) as DumpItem["category"],
    }))

  return {
    items,
    summary: `共梳理出 ${items.length} 件事。AI 暂时不可用，这是本地分类结果。`,
  }
}

function classifyLocal(text: string): DumpItem["category"] {
  const patterns: Array<{ cat: DumpItem["category"]; words: string[] }> = [
    { cat: "worry", words: ["担心", "焦虑", "害怕", "万一", "怎么办", "压力", "迷茫"] },
    { cat: "task", words: ["要做", "需要做", "得做", "必须", "完成", "提交", "处理", "报告", "PPT", "论文"] },
    { cat: "idea", words: ["想法", "也许", "或许", "试试", "灵感", "想学", "感兴趣"] },
    { cat: "reminder", words: ["别忘了", "记得", "提醒", "买", "快递", "打电话", "预约"] },
  ]

  for (const p of patterns) {
    if (p.words.some((w) => text.includes(w))) return p.cat
  }
  return "other"
}
