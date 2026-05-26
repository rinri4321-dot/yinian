import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyPassword, setSessionCookie } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "请填写邮箱和密码" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 })
    }

    await setSessionCookie(user.id)

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch {
    return NextResponse.json({ error: "登录失败，请重试" }, { status: 500 })
  }
}
