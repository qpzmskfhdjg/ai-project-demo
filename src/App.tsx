import { useState, useRef, useEffect } from 'react'
import './index.css'

// ─── Demo data: fixed blocks everyone sees ───────────────────────────────────
const DEMO_BLOCKS = [
  {
    id: 'positioning',
    icon: '🎯',
    title: '项目定位',
    delay: 0,
    content: '面向高校学生的二手物品交易平台，解决毕业季大量闲置物品难以快速流转的痛点。轻量化、移动优先、校内信任背书。',
  },
  {
    id: 'features',
    icon: '⚡',
    title: '核心功能',
    delay: 150,
    content: '用户系统（学校邮箱验证）· 商品发布与管理 · 智能搜索与推荐 · 站内即时聊天 · 交易评价体系 · 安全审核机制',
  },
  {
    id: 'stack',
    icon: '🛠',
    title: '技术栈',
    delay: 300,
    content: 'React + Vite（前端）· Node.js + TypeScript（后端）· PostgreSQL + Redis（数据库）· Socket.io（实时通信）· Docker + Nginx（部署）',
  },
  {
    id: 'milestone',
    icon: '📅',
    title: '开发里程碑',
    delay: 450,
    content: 'Week 1-2：基础骨架 & 用户系统 → Week 3-4：核心交易功能 → Week 5-6：社交与信任体系 → Week 7-8：性能优化 & 上线',
  },
  {
    id: 'team',
    icon: '👥',
    title: '团队分工',
    delay: 600,
    content: '前端工程师 × 1（页面 & 交互）· 后端工程师 × 1-2（API & 数据库）· 全栈/PM × 1（产品设计 & 部署运维）',
  },
  {
    id: 'insight',
    icon: '💡',
    title: 'AI 效率',
    delay: 750,
    content: '这份方案由 AI 在 15 秒内生成。传统团队讨论同等深度的方案需要 2-3 天。这就是 CIL-anything 的价值。',
  },
]

// ─── Radial layout positions (6 blocks around center) ────────────────────────
const POSITIONS = [
  { top: '0%',   left: '50%',  transform: 'translate(-50%, 0)'    }, // top
  { top: '25%',  left: '88%',  transform: 'translate(-50%, -50%)' }, // top-right
  { top: '72%',  left: '88%',  transform: 'translate(-50%, -50%)' }, // bottom-right
  { top: '100%', left: '50%',  transform: 'translate(-50%, -100%)' }, // bottom
  { top: '72%',  left: '12%',  transform: 'translate(-50%, -50%)' }, // bottom-left
  { top: '25%',  left: '12%',  transform: 'translate(-50%, -50%)' }, // top-left
]

// ─── Parse AI response into blocks ───────────────────────────────────────────
function parseToBlocks(text: string) {
  const sections = [
    { key: '项目定位', icon: '🎯', title: '项目定位' },
    { key: '核心功能', icon: '⚡', title: '核心功能' },
    { key: '技术栈',   icon: '🛠', title: '技术栈'   },
    { key: '里程碑',   icon: '📅', title: '开发里程碑' },
    { key: '团队',     icon: '👥', title: '团队分工'  },
    { key: 'AI',       icon: '💡', title: 'AI 效率'   },
  ]

  const blocks: typeof DEMO_BLOCKS = []
  const lines = text.split('\n')
  let currentSection = -1
  let currentContent: string[] = []

  const flush = (idx: number) => {
    if (idx >= 0 && currentContent.length > 0) {
      const raw = currentContent.join(' ').replace(/#+\s*/g, '').replace(/\*\*/g, '').replace(/\|.*\|/g, '').trim()
      if (raw.length > 10) {
        blocks.push({
          id: sections[idx].key,
          icon: sections[idx].icon,
          title: sections[idx].title,
          delay: idx * 150,
          content: raw.slice(0, 200),
        })
      }
    }
    currentContent = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    let matched = false
    for (let i = 0; i < sections.length; i++) {
      if (trimmed.includes(sections[i].key) && (trimmed.startsWith('#') || trimmed.startsWith('**'))) {
        flush(currentSection)
        currentSection = i
        matched = true
        break
      }
    }
    if (!matched && currentSection >= 0) {
      const clean = trimmed.replace(/^[-*•]\s*/, '').replace(/#+\s*/, '').replace(/\*\*/g, '')
      if (clean.length > 3 && !clean.startsWith('|') && !clean.startsWith('---')) {
        currentContent.push(clean)
      }
    }
  }
  flush(currentSection)
  return blocks.length >= 3 ? blocks : null
}

// ─── Block Card Component ─────────────────────────────────────────────────────
function BlockCard({
  block,
  position,
  visible,
}: {
  block: typeof DEMO_BLOCKS[0]
  position: typeof POSITIONS[0]
  visible: boolean
}) {
  return (
    <div
      className="block-card"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        transform: position.transform,
        opacity: visible ? 1 : 0,
        scale: visible ? '1' : '0.4',
        transition: `opacity 0.5s ease ${block.delay}ms, scale 0.5s cubic-bezier(0.34,1.56,0.64,1) ${block.delay}ms`,
        width: '220px',
      }}
    >
      <div className="glass-card p-4 h-full">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{block.icon}</span>
          <span className="text-xs font-medium text-white/80 uppercase tracking-wider">{block.title}</span>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">{block.content}</p>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [apiKey, setApiKey] = useState('')
  const [userInput, setUserInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [demoVisible, setDemoVisible] = useState(false)
  const [userBlocks, setUserBlocks] = useState<typeof DEMO_BLOCKS | null>(null)
  const [userBlocksVisible, setUserBlocksVisible] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  // Show demo blocks with stagger
  const triggerDemo = () => {
    setDemoVisible(false)
    setTimeout(() => setDemoVisible(true), 50)
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Real API streaming
  const handleStream = async () => {
    if (!apiKey.trim() || !userInput.trim()) return
    setStreaming(true)
    setStreamedText('')
    setUserBlocks(null)
    setUserBlocksVisible(false)

    let fullText = ''

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
              content: `你是一个资深全栈架构师和项目经理。用户会给你一个项目需求，请输出完整的项目拆解方案，严格按以下结构：

## 项目定位
（一段话概括，50字以内）

## 核心功能模块
（列出5-6个核心功能，每个一行，用·分隔关键词）

## 技术栈选型
（前端/后端/数据库/部署，每项一行）

## 开发里程碑
（4个阶段，每阶段一行，格式：Week X-X：任务描述）

## 团队分工建议
（3个角色，每个一行）

## AI 效率点评
（一句话，说明 AI 帮助节省了多少时间）

输出简洁，每个章节不超过3行。不要用表格。`
            },
            { role: 'user', content: userInput }
          ],
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        setStreamedText(`请求失败: ${res.status}\n${err}`)
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
              fullText += content
              setStreamedText(fullText)
            }
          } catch {}
        }
      }
    } catch (e: any) {
      setStreamedText(`网络错误: ${e.message}`)
      setStreaming(false)
      return
    }

    setStreaming(false)

    // Parse into blocks and show radial layout
    const parsed = parseToBlocks(fullText)
    if (parsed) {
      setUserBlocks(parsed)
      setTimeout(() => setUserBlocksVisible(true), 100)
    }
  }

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [streamedText])

  return (
    <div className="relative bg-black">

      {/* ── HERO: fullscreen video, complete & sharp ── */}
      <section className="relative w-full h-screen flex flex-col overflow-hidden">
        {/* Video: object-contain so full video is visible, no crop */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-contain z-0"
          style={{ background: '#000' }}
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
            type="video/mp4"
          />
        </video>

        {/* Subtle vignette only at edges, not center */}
        <div className="absolute inset-0 z-[1]" style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)'
        }} />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
          <div className="text-2xl tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
            <span className="text-white font-medium">CIL</span>
            <span className="text-white/50">-anything</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#demo" className="text-sm text-white/60 hover:text-white transition-colors">案例演示</a>
            <a href="#try" className="text-sm text-white/60 hover:text-white transition-colors">亲自体验</a>
          </div>
        </nav>

        {/* Hero content: centered */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
          <h1
            className="text-6xl sm:text-8xl md:text-9xl font-normal leading-[0.9] tracking-[-3px] text-white animate-fade-rise"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            CIL
            <br />
            <em className="not-italic text-white/40">anything.</em>
          </h1>
          <p className="text-white/50 text-base sm:text-lg mt-6 max-w-md leading-relaxed animate-fade-rise-delay">
            输入项目需求，AI 15 秒内给出完整技术方案
          </p>
          <button
            onClick={triggerDemo}
            className="liquid-glass rounded-full px-12 py-4 text-base text-white mt-10 hover:scale-[1.04] transition-transform cursor-pointer animate-fade-rise-delay-2"
          >
            开始
          </button>
        </div>

        {/* Scroll hint */}
        <div className="relative z-10 flex justify-center pb-8 animate-fade-rise-delay-2">
          <div className="scroll-hint" />
        </div>
      </section>

      {/* ── DEMO SECTION ── */}
      <section id="demo" className="relative min-h-screen bg-black px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl sm:text-6xl font-normal text-white mb-4"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              看 AI 怎么拆项目
            </h2>
            <p className="text-white/40 text-base">固定案例：校园二手交易平台</p>
          </div>

          {/* Radial block layout */}
          <div className="radial-container">
            {/* Center node */}
            <div className="center-node glass-card">
              <div className="text-center">
                <div className="text-2xl mb-1">🏫</div>
                <div className="text-xs text-white/80 font-medium">校园二手</div>
                <div className="text-xs text-white/40">交易平台</div>
              </div>
            </div>

            {/* Connector lines */}
            {DEMO_BLOCKS.map((_, i) => (
              <div
                key={i}
                className="connector-line"
                style={{
                  '--angle': `${i * 60}deg`,
                  opacity: demoVisible ? 0.3 : 0,
                  transition: `opacity 0.4s ease ${i * 150 + 200}ms`,
                } as React.CSSProperties}
              />
            ))}

            {/* Block cards */}
            {DEMO_BLOCKS.map((block, i) => (
              <BlockCard
                key={block.id}
                block={block}
                position={POSITIONS[i]}
                visible={demoVisible}
              />
            ))}
          </div>

          {!demoVisible && (
            <div className="text-center mt-8">
              <button
                onClick={triggerDemo}
                className="liquid-glass rounded-full px-10 py-3 text-sm text-white hover:scale-[1.03] transition-transform cursor-pointer"
              >
                ▶ 展开方案
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── TRY IT SECTION ── */}
      <section id="try" className="relative min-h-screen bg-[#050a0f] px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl sm:text-6xl font-normal text-white mb-4"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              亲自体验
            </h2>
            <p className="text-white/40 text-base">填入你的 API Key，输入任意项目需求</p>
          </div>

          <div className="glass-card p-8 mb-8">
            <div className="mb-5">
              <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors text-sm"
              />
            </div>
            <div className="mb-6">
              <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">项目需求</label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="例如：做一个校园跑腿小程序、搭建一个 AI 客服系统..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors resize-none text-sm"
              />
            </div>
            <button
              onClick={handleStream}
              disabled={streaming || !apiKey.trim() || !userInput.trim()}
              className="liquid-glass rounded-full px-10 py-3 text-sm text-white hover:scale-[1.03] transition-transform cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {streaming ? '⏳ AI 正在拆解...' : '开始拆解'}
            </button>
          </div>

          {/* User result: radial blocks if parsed, else raw text */}
          {userBlocks && (
            <div>
              <p className="text-center text-white/30 text-xs mb-8 uppercase tracking-wider">方案已生成</p>
              <div className="radial-container">
                <div className="center-node glass-card">
                  <div className="text-center">
                    <div className="text-2xl mb-1">✨</div>
                    <div className="text-xs text-white/80 font-medium leading-tight">{userInput.slice(0, 10)}</div>
                  </div>
                </div>
                {userBlocks.map((_, i) => (
                  <div
                    key={i}
                    className="connector-line"
                    style={{
                      '--angle': `${i * 60}deg`,
                      opacity: userBlocksVisible ? 0.3 : 0,
                      transition: `opacity 0.4s ease ${i * 150 + 200}ms`,
                    } as React.CSSProperties}
                  />
                ))}
                {userBlocks.map((block, i) => (
                  <BlockCard
                    key={block.id}
                    block={block}
                    position={POSITIONS[i % POSITIONS.length]}
                    visible={userBlocksVisible}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Fallback: show raw text while streaming or if parse failed */}
          {streamedText && !userBlocks && (
            <div className="glass-card p-6">
              <div className="text-xs text-white/30 mb-3 uppercase tracking-wider">AI 输出</div>
              <div ref={outputRef} className="max-h-[400px] overflow-y-auto">
                <p className={`text-sm text-white/70 leading-relaxed whitespace-pre-wrap ${streaming ? 'streaming-cursor' : ''}`}>
                  {streamedText}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative bg-black px-6 py-12 text-center border-t border-white/5">
        <div className="text-2xl tracking-tight mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>
          <span className="text-white">CIL</span><span className="text-white/30">-anything</span>
        </div>
        <p className="text-white/30 text-xs">Powered by Claude Sonnet 4 · 想获取 API Key？联系管理员</p>
      </footer>
    </div>
  )
}

export default App
