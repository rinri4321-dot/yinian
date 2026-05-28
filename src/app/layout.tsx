import type { Metadata, Viewport } from "next"
import "./globals.css"
import AppShell from "@/components/AppShell"
import SWRegister from "@/components/SWRegister"
import ThemeProvider from "@/components/ThemeProvider"

export const metadata: Metadata = {
  title: {
    default: "壹念 — 每天清空大脑，聚焦一件事",
    template: "%s — 壹念",
  },
  description: "一个基于认知心理学的每日大脑清空+聚焦练习。不是待办清单，不是效率工具。",
  icons: { icon: "/favicon.svg", apple: "/icon-192.svg" },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "壹念", statusBarStyle: "default" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a18" },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <head>
        {/* 阻塞脚本：在页面渲染前读取 localStorage 设置 dark 类，彻底消灭闪白 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("yinian_theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <SWRegister />
        </ThemeProvider>
      </body>
    </html>
  )
}
