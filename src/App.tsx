import { useState, useRef, useEffect } from 'react'
import './index.css'

// Pre-built demo content (fixed example everyone sees)
const DEMO_PROJECT = "校园二手交易平台"
const DEMO_RESPONSE = `## 项目定位

一个面向高校学生的二手物品交易平台，解决毕业季/换季大量闲置物品难以快速流转的痛点。轻量化、移动优先、校内信任背书。

## 核心功能模块

### 1. 用户系统
- 学校邮箱注册验证（确保校内身份）
- 个人信誉评分体系
- 收藏夹 & 浏览历史

### 2. 商品发布与管理
- 图片上传 + AI 自动生成商品描述
- 分类标签（教材/电子/生活/服饰）
- 一键降价 & 自动下架

### 3. 搜索与推荐
- 全文搜索 + 分类筛选
- 基于浏览行为的个性化推荐
- "同校热卖"排行榜

### 4. 交易流程
- 站内即时聊天（WebSocket）
- 线下交易地点推荐（校内快递站/食堂门口）
- 交易完成互评

### 5. 安全与审核
- 违禁品关键词过滤
- 图片 NSFW 检测
- 举报 & 人工审核队列

## 技术栈选型

| 层级 | 技术 | 理由 |
|------|------|------|
| 前端 | React + Vite + TailwindCSS | 开发效率高，生态成熟 |
| 移动端 | React Native / Taro 小程序 | 学生群体移动端优先 |
| 后端 | Node.js + Express + TypeScript | 全栈统一语言，降低心智负担 |
| 数据库 | PostgreSQL + Redis | 关系型主存储 + 缓存/会话 |
| 文件存储 | 阿里云 OSS / MinIO | 图片存储，CDN 加速 |
| 实时通信 | Socket.io | 站内聊天 |
| 部署 | Docker + Nginx | 容器化，方便迁移 |

## 开发里程碑

### Phase 1（第1-2周）— 基础骨架
- [ ] 项目初始化 & CI/CD 配置
- [ ] 用户注册/登录（JWT）
- [ ] 数据库 Schema 设计 & Migration

### Phase 2（第3-4周）— 核心交易
- [ ] 商品 CRUD + 图片上传
- [ ] 搜索 & 筛选功能
- [ ] 商品详情页 & 收藏

### Phase 3（第5-6周）— 社交与信任
- [ ] 即时聊天系统
- [ ] 交易流程 & 互评
- [ ] 信誉评分算法

### Phase 4（第7-8周）— 打磨上线
- [ ] 推荐算法
- [ ] 安全审核系统
- [ ] 性能优化 & 压测
- [ ] 部署上线 & 灰度发布

## 团队分工建议（3-4人）

- **前端 × 1**：页面开发、交互体验
- **后端 × 1-2**：API、数据库、实时通信
- **全栈/PM × 1**：产品设计、协调、部署运维

---

> 💡 这个方案由 AI 在 15 秒内生成。从需求到可执行计划，传统方式需要团队讨论 2-3 天。`

function App() {
  const [apiKey, setApiKey] = useState('')
  const [userInput, setUserInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const [demoText, setDemoText] = useState('')
  const outputRef = useRef<HTMLDivElement>(null)
  // Simulate streaming for the demo
  useEffect(() => {
    if (!showDemo) return
    let i = 0
    const interval = setInterval(() => {
      i += 3
      if (i >= DEMO_RESPONSE.length) {
        setDemoText(DEMO_RESPONSE)
        clearInterval(interval)
      } else {
        setDemoText(DEMO_RESPONSE.slice(0, i))
      }
    }, 10)
    return () => clearInterval(interval)
  }, [showDemo])

  // Real API streaming
  const handleStream = async () => {
    if (!apiKey.trim() || !userInput.trim()) return
    setStreaming(true)
    setStreamedText('')

    try {
      const res = await fetch('https://siyu-ai.top/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          stream: true,
          messages: [
            {
              role: 'system',
              content: `你是一个资深全栈架构师和项目经理。用户会给你一个项目需求，你需要输出完整的项目拆解方案，包括：
1. 项目定位（一段话概括）
2. 核心功能模块（每个模块列出子功能）
3. 技术栈选型（表格形式，含选型理由）
4. 开发里程碑（分阶段，含时间估算和具体任务）
5. 团队分工建议

使用 Markdown 格式输出，清晰有层次。最后加一句话点评 AI 的效率优势。`
            },
            { role: 'user', content: userInput }
          ],
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        setStreamedText(`❌ 请求失败: ${res.status}\n${err}`)
        setStreaming(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const json = JSON.parse(data)
            const content = json.choices?.[0]?.delta?.content
            if (content) {
              setStreamedText(prev => prev + content)
            }
          } catch {}
        }
      }
    } catch (e: any) {
      setStreamedText(`❌ 网络错误: ${e.message}`)
    }
    setStreaming(false)
  }

  // Auto scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [demoText, streamedText])

  return (
    <div className="relative min-h-screen">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div
          className="text-3xl tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          <span className="text-white">SiYu AI</span>
          <sup className="text-xs">✦</sup>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#demo" className="text-sm text-white transition-colors">案例演示</a>
          <a href="#try" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-white transition-colors">亲自体验</a>
          <button
            onClick={() => document.getElementById('try')?.scrollIntoView({ behavior: 'smooth' })}
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white hover:scale-[1.03] transition-transform cursor-pointer"
          >
            开始体验
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-32 pb-20">
        <h1
          className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal animate-fade-rise"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Your <em className="not-italic text-[hsl(var(--muted-foreground))]">AI teammate</em> that
          <br />
          <em className="not-italic text-[hsl(var(--muted-foreground))]">ships projects.</em>
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          输入一个项目需求，AI 在 15 秒内输出完整技术方案——从架构选型到开发排期。
          <br />
          不是建议，是直接可执行的计划。
        </p>
        <button
          onClick={() => {
            setShowDemo(true)
            document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="liquid-glass rounded-full px-14 py-5 text-base text-white mt-12 hover:scale-[1.03] transition-transform cursor-pointer animate-fade-rise-delay-2"
        >
          看看 AI 怎么拆项目 ↓
        </button>
      </section>

      {/* Demo Section */}
      <section id="demo" className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <div className="glass-card p-8 animate-fade-rise-delay-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-4 text-sm text-[hsl(var(--muted-foreground))]">AI Project Architect</span>
          </div>

          {/* Input display */}
          <div className="mb-6 text-left">
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wider">需求输入</div>
            <div className="bg-white/5 rounded-lg px-4 py-3 text-white/90 border border-white/10">
              「{DEMO_PROJECT}」
            </div>
          </div>

          {/* Output */}
          <div className="text-left">
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wider">AI 输出</div>
            {!showDemo ? (
              <button
                onClick={() => setShowDemo(true)}
                className="liquid-glass rounded-full px-8 py-3 text-sm text-white hover:scale-[1.03] transition-transform cursor-pointer"
              >
                ▶ 点击开始演示
              </button>
            ) : (
              <div
                ref={demoText.length < DEMO_RESPONSE.length ? outputRef : undefined}
                className="bg-white/5 rounded-lg px-4 py-3 border border-white/10 max-h-[500px] overflow-y-auto"
              >
                <pre className={`whitespace-pre-wrap text-sm text-white/90 leading-relaxed font-[var(--font-body)] ${demoText.length < DEMO_RESPONSE.length ? 'streaming-cursor' : ''}`}>
                  {demoText}
                </pre>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Try It Section */}
      <section id="try" className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-5xl font-normal text-white mb-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            亲自体验
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-base">
            输入你的 API Key，用你自己的项目需求试试
          </p>
        </div>

        <div className="glass-card p-8">
          {/* API Key Input */}
          <div className="mb-6">
            <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wider text-left">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* Project Input */}
          <div className="mb-6">
            <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wider text-left">
              你的项目需求
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="例如：做一个校园跑腿小程序、搭建一个 AI 客服系统、开发一个在线协作白板..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleStream}
            disabled={streaming || !apiKey.trim() || !userInput.trim()}
            className="liquid-glass rounded-full px-10 py-3 text-sm text-white hover:scale-[1.03] transition-transform cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {streaming ? '⏳ AI 正在拆解...' : '🚀 开始拆解'}
          </button>

          {/* Streamed Output */}
          {streamedText && (
            <div className="mt-6 text-left">
              <div className="text-xs text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wider">AI 输出</div>
              <div
                ref={outputRef}
                className="bg-white/5 rounded-lg px-4 py-3 border border-white/10 max-h-[500px] overflow-y-auto"
              >
                <pre className={`whitespace-pre-wrap text-sm text-white/90 leading-relaxed font-[var(--font-body)] ${streaming ? 'streaming-cursor' : ''}`}>
                  {streamedText}
                </pre>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 px-6 py-20 text-center">
        <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4">
          Powered by Claude Sonnet 4 · SiYu AI 中转站
        </p>
        <p className="text-[hsl(var(--muted-foreground))] text-xs">
          想要获取 API Key？联系管理员加入
        </p>
      </section>
    </div>
  )
}

export default App
