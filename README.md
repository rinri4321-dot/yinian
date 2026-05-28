# 壹念 — 每天清空大脑，聚焦一件事

> 不是待办清单，不是效率工具。一个基于认知心理学的 AI 驱动日常聚焦练习。

---

## 解决什么问题

**信息过载、选择太多、不知道每天该干什么** — 这是我们这代人共同的困境。

焦虑、拖延、迷茫不是三个独立的问题，而是一个循环：脑子里装太多事 → 触发焦虑 → 无法启动 → 更加焦虑。

壹念把 7 项经过 RCT 验证的临床心理学技术整合成一个 5 步流程，每天花 10 分钟，帮你打破这个循环。

---

## 核心流程

```
清空大脑 → AI 识别模式 → 聚焦一件事 → 制定执行意图 → 番茄钟执行 → 晚间回顾
```

| 步骤 | 做什么 | 背后的科学 |
|------|--------|-----------|
| 1. 清空 | 把脑子里的杂念全部倒出来 | 认知卸载（GTD）— 写下即释放 |
| 2. 识别 | AI 分析你的思绪，找出模式 | 自动分类：担忧/待办/想法/提醒 |
| 3. 聚焦 | 选出今天唯一重要的事 | "一件事"原则（Gary Keller） |
| 4. 定意图 | 制定"如果…就…"执行计划 | 执行意图（Gollwitzer, 1999）— 成功率提升 2-3 倍 |
| 5. 执行 | 番茄钟计时，沉浸专注 | 结构化专注（Pomodoro Technique） |

---

## 7 项循证技术

| 技术 | 研究支持 |
|------|---------|
| 认知卸载（Cognitive Offloading） | Risko & Gilbert (2016), *Trends in Cognitive Sciences* |
| 注意力修复理论（ART） | Kaplan (1995), *Journal of Environmental Psychology* |
| 执行意图（Implementation Intention） | Gollwitzer (1999), *American Psychologist* |
| 一件事原则（The ONE Thing） | Gary Keller (2013), *The ONE Thing* |
| 结构化拖延 | Perry (2012), *The Art of Procrastination* |
| 番茄工作法 | Cirillo (2006), *The Pomodoro Technique* |
| 自我决定理论（SDT） | Deci & Ryan (2000), *Psychological Inquiry* |

完整方法论 → `/method` 页面。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + React 19 |
| 语言 | TypeScript（全栈） |
| 样式 | Tailwind CSS v4 + CSS 变量主题 |
| 数据库 | Prisma 5 + SQLite |
| AI | DeepSeek API（via OpenAI SDK） |
| 部署 | PWA（manifest + service worker，可安装到桌面） |
| 音效 | Web Audio API（11 种合成音效，无外部文件） |

**53 个源文件 · ~10,600 行代码 · 13 个自定义组件 · 6 个 API 端点**

---

## 一个人 + AI

这个项目由一个人和 Claude Code 共同构建。DeepSeek 驱动 AI 分析。

产品灵感来自我自己的经历：信息过载、容易分心、每天忙完不知道忙了什么。查阅了大量临床心理学研究后，发现这些方法确实有效，但缺少一个把它们串起来的工具。所以我用 AI 做了壹念。

它先帮了我。希望也能帮到你。

---

## 本地运行

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000

需要配置 `.env` 文件：

```env
DATABASE_URL="file:./dev.db"
DEEPSEEK_API_KEY="你的 DeepSeek API Key"
JWT_SECRET="随机字符串"
```

---

## 项目结构

```
src/
├── app/
│   ├── api/          # 6 个 API 端点
│   ├── insights/     # 洞察页（趋势图+AI分析）
│   ├── login/        # 登录页
│   ├── method/       # 方法论页（7项技术）
│   ├── profile/      # 个人页（统计+成就）
│   ├── register/     # 注册页
│   └── today/        # 核心5步流程
├── components/       # 13 个自定义组件
├── lib/              # 工具库（AI/认证/音效/数据库）
└── types/            # TypeScript 类型定义
```

---

## 比赛信息

- 比赛：AI 挑战赛
- 主题：解决我们这代人的问题
- 作者：Rinri
- 构建：一个人 + Claude Code · DeepSeek 驱动 AI
