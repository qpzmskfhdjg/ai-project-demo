import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import './index.css'

const ACCENT = '#5E0ED7'
const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260517_222138_3e3205be-3364-417b-a64a-bfe087acbec4.mp4'

const EASE = [0.22, 1, 0.36, 1] as const

const fadeDown = {
  hidden: { opacity: 0, y: -20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: EASE },
  }),
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: EASE },
  }),
}

// ─── Demo data ───────────────────────────────────────────────────────────────
const DEMO_BLOCKS = [
  { id: 'positioning', label: '项目定位', content: '面向边缘计算场景的嵌入式AI监控相机系统，实现云端协同推理，解决传统监控延迟高、带宽占用大、无法本地智能分析的痛点。' },
  { id: 'features', label: '核心功能', content: '本地AI推理引擎（目标检测/行为识别）· 云边协同任务调度 · 自适应码率传输 · 边缘端模型热更新 · 异常事件实时告警 · 多摄像头协同分析' },
  { id: 'stack', label: '技术栈', content: 'RV1126嵌入式平台（NPU推理）· RKNN-Toolkit模型部署 · MQTT+WebSocket（云边通信）· React+Go（云端管理平台）· Docker Edge（容器化部署）' },
  { id: 'milestone', label: '开发里程碑', content: 'Phase 1：硬件选型与基础驱动开发 → Phase 2：本地推理引擎与模型优化 → Phase 3：云边通信协议与任务调度 → Phase 4：系统联调与性能压测' },
  { id: 'team', label: '团队分工', content: '嵌入式工程师 × 1（驱动/NPU适配）· 算法工程师 × 1（模型训练/量化部署）· 后端工程师 × 1（云端平台/通信协议）' },
  { id: 'insight', label: 'AI 效率', content: '这份方案由 AI 在 15 秒内生成完整技术路线。传统团队完成同等深度的可行性分析需要 1-2 周。这就是 CIL-anything 的价值。' },
  { id: 'npu', label: 'NPU推理优化', content: 'RV1126内置2.0TOPS NPU算力，支持INT8/INT16混合量化推理。通过RKNN-Toolkit将PyTorch模型转换为RKNN格式，推理延迟控制在25ms以内。' },
  { id: 'quantize', label: '模型量化', content: 'RKNN量化流程：FP32→INT8对称量化，精度损失<1.5%。采用逐通道量化+混合精度策略，关键层保留FP16确保检测精度。' },
  { id: 'mqtt', label: '云边通信', content: 'MQTT v5.0协议实现云边双向通信，QoS 1保证消息可靠投递。心跳间隔30s，断线自动重连，支持遗嘱消息实现设备离线感知。' },
  { id: 'video', label: '视频编解码', content: 'H.265硬编码，1080P@30fps码率仅2Mbps。支持ROI区域增强编码，目标区域画质提升的同时整体带宽降低40%。' },
  { id: 'detection', label: '目标检测', content: 'YOLOv8-nano模型，输入分辨率640×640，支持80类目标检测。边缘端mAP@0.5达到78.3%，单帧推理耗时22ms。' },
  { id: 'behavior', label: '行为识别', content: '基于时空图卷积网络(ST-GCN)的行为识别模块，支持跌倒检测、异常徘徊、越界入侵等12种预设行为模式识别。' },
  { id: 'container', label: '容器化部署', content: 'Docker Edge轻量容器运行时，镜像体积<50MB。支持OTA远程更新，灰度发布策略确保升级过程中服务不中断。' },
  { id: 'hotupdate', label: '模型热更新', content: '云端训练完成后自动推送模型到边缘节点，A/B测试验证精度后无缝切换。支持模型版本回滚，更新失败自动恢复上一版本。' },
  { id: 'multiview', label: '多摄协同', content: '跨摄像头目标重识别(ReID)，支持8路同时接入。全局ID分配实现跨视角目标追踪，轨迹拼接准确率>92%。' },
  { id: 'alert', label: '异常告警', content: '三级告警机制：边缘端即时推送（<500ms）→ 云端二次确认 → 管理平台聚合展示。支持告警规则自定义和静默时段设置。' },
  { id: 'bitrate', label: '自适应码率', content: '基于网络带宽实时探测的自适应传输策略，支持SRT/RTMP双协议。弱网环境自动降级至720P，恢复后平滑升级。' },
  { id: 'hardware', label: '硬件选型', content: 'RV1126主控 + GC2053 CMOS传感器 + RTL8211F千兆PHY。支持-20°C~60°C工作温度，IP67防护等级，PoE供电。' },
  { id: 'power', label: '功耗优化', content: '动态频率调节(DVFS)，待机功耗<2W，满载推理<5W。支持太阳能供电方案，内置电池管理IC实现智能充放电。' },
  { id: 'security', label: '安全加密', content: 'TLS 1.3加密传输 + 设备证书双向认证。视频流AES-256加密存储，密钥通过安全芯片(SE)管理，防止固件逆向。' },
  { id: 'ota', label: 'OTA升级', content: '差分升级包体积减少70%，断点续传支持弱网环境。升级前自动备份，失败回滚时间<10s，确保设备永不变砖。' },
  { id: 'stress', label: '性能压测', content: '72小时连续运行稳定性测试，内存泄漏<5MB/天。NPU利用率峰值85%，CPU温度稳定在65°C以下，满足7×24小时部署要求。' },
  { id: 'product', label: '产品化路径', content: '从原型到量产分三步：功能验证(EVT) → 工程验证(DVT) → 量产验证(PVT)。首批100台试产，预计单台BOM成本控制在¥380以内。' },
]

const SECTION_KEYS = [
  { key: '项目定位', label: '项目定位' },
  { key: '核心功能', label: '核心功能' },
  { key: '技术栈', label: '技术栈选型' },
  { key: '系统架构', label: '系统架构' },
  { key: '数据架构', label: '数据架构' },
  { key: '用户画像', label: '用户画像' },
  { key: '市场分析', label: '市场分析' },
  { key: '竞品对比', label: '竞品对比' },
  { key: '商业模式', label: '商业模式' },
  { key: '开发里程碑', label: '开发里程碑' },
  { key: '团队分工', label: '团队分工' },
  { key: 'AI效率', label: 'AI 效率' },
  { key: '安全策略', label: '安全策略' },
  { key: '性能优化', label: '性能优化' },
  { key: '测试策略', label: '测试策略' },
  { key: '部署方案', label: '部署方案' },
  { key: '监控运维', label: '监控运维' },
  { key: '风险评估', label: '风险评估' },
  { key: '成本估算', label: '成本估算' },
  { key: '成功指标', label: '成功指标' },
]
type Block = { id: string; label: string; content: string }

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = []
  const lines = text.split('\n')
  let currentIdx = -1
  let currentContent: string[] = []

  const flush = (idx: number) => {
    if (idx >= 0 && currentContent.length > 0) {
      const raw = currentContent.join(' ').replace(/#+\s*/g, '').replace(/\*\*/g, '').replace(/\|.*\|/g, '').trim()
      if (raw.length > 10) blocks.push({ id: SECTION_KEYS[idx].key, label: SECTION_KEYS[idx].label, content: raw.slice(0, 220) })
    }
    currentContent = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    let matched = false
    for (let i = 0; i < SECTION_KEYS.length; i++) {
      if (trimmed.includes(SECTION_KEYS[i].key) && (trimmed.startsWith('#') || trimmed.startsWith('**'))) {
        flush(currentIdx); currentIdx = i; matched = true; break
      }
    }
    if (!matched && currentIdx >= 0) {
      const clean = trimmed.replace(/^[-*•]\s*/, '').replace(/#+\s*/, '').replace(/\*\*/g, '')
      if (clean.length > 3 && !clean.startsWith('|') && !clean.startsWith('---')) currentContent.push(clean)
    }
  }
  flush(currentIdx)
  return blocks
}

// ─── Force-directed graph ────────────────────────────────────────────────────
interface GraphNode {
  id: string
  label: string
  content: string
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  boxW: number
}

interface GraphEdge {
  source: number
  target: number
}

function buildGraph(blocks: Block[], width: number, height: number): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const cx = width / 2
  const cy = height / 2
  const maxRadius = Math.min(width, height) * 0.46

  const nodes: GraphNode[] = blocks.map((b) => {
    const angle = Math.random() * 2 * Math.PI
    const r = Math.sqrt(Math.random()) * maxRadius * 0.85
    return {
      id: b.id, label: b.label, content: b.content,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      vx: 0,
      vy: 0,
      radius: 6,
      boxW: 0,
    }
  })

  for (let iter = 0; iter < 100; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const minDist = 85
        if (dist < minDist) {
          const force = (minDist - dist) / dist * 0.5
          nodes[i].x -= dx * force
          nodes[i].y -= dy * force
          nodes[j].x += dx * force
          nodes[j].y += dy * force
        }
      }
      const ox = nodes[i].x - cx
      const oy = nodes[i].y - cy
      const d = Math.sqrt(ox * ox + oy * oy)
      if (d > maxRadius * 0.88) {
        const scale = (maxRadius * 0.88) / d
        nodes[i].x = cx + ox * scale
        nodes[i].y = cy + oy * scale
      }
    }
  }

  const edges: GraphEdge[] = []
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x
      const dy = nodes[j].y - nodes[i].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 140 || Math.random() < 0.06) {
        edges.push({ source: i, target: j })
      }
    }
  }
  return { nodes, edges }
}
function NetworkGraph({ blocks, height = 500 }: { blocks: Block[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<GraphNode[]>([])
  const edgesRef = useRef<GraphEdge[]>([])
  const baseOffsetsRef = useRef<{ dx: number; dy: number }[]>([])
  const perturbRef = useRef<{ dx: number; dy: number; vx: number; vy: number }[]>([])
  const animRef = useRef<number>(0)
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 })
  const hoveredRef = useRef<number>(-1)
  const rotationRef = useRef<number>(0)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [isHoveringAny, setIsHoveringAny] = useState(false)
  const widthRef = useRef(960)

  const initGraph = useCallback(() => {
    const w = containerRef.current?.clientWidth || 960
    widthRef.current = w
    const { nodes, edges } = buildGraph(blocks, w, height)
    nodesRef.current = nodes
    edgesRef.current = edges
    const cx = w / 2
    const cy = height / 2
    baseOffsetsRef.current = nodes.map(n => ({ dx: n.x - cx, dy: n.y - cy }))
    perturbRef.current = nodes.map(() => ({ dx: 0, dy: 0, vx: 0, vy: 0 }))
  }, [blocks, height])

  useEffect(() => { initGraph() }, [initGraph])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let running = true
    let animId = 0

    const REPEL_RADIUS = 80
    const REPEL_STRENGTH = 0.5
    const SPRING = 0.06
    const DAMP = 0.75

    const drawRoundRect = (x: number, y: number, bw: number, bh: number, r: number) => {
      ctx.beginPath()
      if ((ctx as CanvasRenderingContext2D & { roundRect?: (...a: unknown[]) => void }).roundRect) {
        (ctx as CanvasRenderingContext2D & { roundRect: (...a: unknown[]) => void }).roundRect(x, y, bw, bh, r)
      } else {
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + bw - r, y)
        ctx.quadraticCurveTo(x + bw, y, x + bw, y + r)
        ctx.lineTo(x + bw, y + bh - r)
        ctx.quadraticCurveTo(x + bw, y + bh, x + bw - r, y + bh)
        ctx.lineTo(x + r, y + bh)
        ctx.quadraticCurveTo(x, y + bh, x, y + bh - r)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.closePath()
      }
    }

    const start = (w: number) => {
      widthRef.current = w
      const h = height
      const dpr = window.devicePixelRatio || 1
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.scale(dpr, dpr)

      if (nodesRef.current.length === 0) {
        const { nodes, edges } = buildGraph(blocks, w, h)
        nodesRef.current = nodes
        edgesRef.current = edges
        const cx2 = w / 2
        const cy2 = h / 2
        baseOffsetsRef.current = nodes.map(n => ({ dx: n.x - cx2, dy: n.y - cy2 }))
        perturbRef.current = nodes.map(() => ({ dx: 0, dy: 0, vx: 0, vy: 0 }))
      }

      const simulate = () => {
        if (!running) return
        const nodes = nodesRef.current
        const edges = edgesRef.current
        if (nodes.length === 0) { animId = requestAnimationFrame(simulate); return }

        const cx = w / 2
        const cy = h / 2

        rotationRef.current += 0.001
        const cos = Math.cos(rotationRef.current)
        const sin = Math.sin(rotationRef.current)

        const mx = mouseRef.current.x
        const my = mouseRef.current.y
        const offsets = baseOffsetsRef.current
        const perturbs = perturbRef.current

        for (let i = 0; i < nodes.length; i++) {
          const p = perturbs[i]
          if (!p || !offsets[i]) continue

          const { dx: odx, dy: ody } = offsets[i]
          const baseX = cx + odx * cos - ody * sin
          const baseY = cy + odx * sin + ody * cos
          const nodeX = baseX + p.dx
          const nodeY = baseY + p.dy

          const ndx = nodeX - mx
          const ndy = nodeY - my
          const dist = Math.sqrt(ndx * ndx + ndy * ndy)
          if (dist < REPEL_RADIUS && dist > 1) {
            const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH
            p.vx += (ndx / dist) * force
            p.vy += (ndy / dist) * force
          }

          p.vx += -p.dx * SPRING
          p.vy += -p.dy * SPRING
          p.vx *= DAMP
          p.vy *= DAMP
          p.dx += p.vx
          p.dy += p.vy

          const pd = Math.sqrt(p.dx * p.dx + p.dy * p.dy)
          if (pd > 70) { p.dx = (p.dx / pd) * 70; p.dy = (p.dy / pd) * 70 }
        }

        for (let i = 0; i < nodes.length; i++) {
          if (!offsets[i]) continue
          const { dx, dy } = offsets[i]
          const p = perturbs[i]
          nodes[i].x = cx + dx * cos - dy * sin + (p ? p.dx : 0)
          nodes[i].y = cy + dx * sin + dy * cos + (p ? p.dy : 0)
        }

        let hovered = -1
        ctx.font = '600 11px Inter, system-ui, sans-serif'
        for (let i = 0; i < nodes.length; i++) {
          if (!nodes[i].boxW) nodes[i].boxW = ctx.measureText(nodes[i].label).width + 24
          const bw = nodes[i].boxW
          const bh = 26
          if (mx >= nodes[i].x - bw / 2 && mx <= nodes[i].x + bw / 2 &&
              my >= nodes[i].y - bh / 2 && my <= nodes[i].y + bh / 2) {
            hovered = i; break
          }
        }
        if (hovered !== hoveredRef.current) {
          hoveredRef.current = hovered
          setIsHoveringAny(hovered >= 0)
        }

        ctx.clearRect(0, 0, w, h)

        for (const edge of edges) {
          const a = nodes[edge.source]
          const b = nodes[edge.target]
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = 'rgba(94, 14, 215, 0.10)'
          ctx.lineWidth = 0.7
          ctx.stroke()
        }

        ctx.font = '600 11px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i]
          const isHov = i === hovered
          if (!node.boxW) node.boxW = ctx.measureText(node.label).width + 24
          const bw = node.boxW
          const bh = 26
          const bx = node.x - bw / 2
          const by = node.y - bh / 2

          if (isHov) {
            ctx.shadowColor = 'rgba(94, 14, 215, 0.28)'
            ctx.shadowBlur = 14
          }

          drawRoundRect(bx, by, bw, bh, 6)
          ctx.fillStyle = isHov ? '#ede9fe' : 'rgba(255, 255, 255, 0.93)'
          ctx.fill()
          ctx.shadowBlur = 0
          ctx.strokeStyle = isHov ? ACCENT : 'rgba(94, 14, 215, 0.20)'
          ctx.lineWidth = isHov ? 1.5 : 1
          ctx.stroke()

          ctx.fillStyle = isHov ? ACCENT : '#374151'
          ctx.fillText(node.label, node.x, node.y)
        }

        animId = requestAnimationFrame(simulate)
      }

      animId = requestAnimationFrame(simulate)
    }

    const tryStart = () => {
      const w = container.clientWidth
      if (w < 50) return false
      start(w)
      return true
    }

    if (!tryStart()) {
      const ro = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect.width ?? 0
        if (w >= 50) { ro.disconnect(); start(w) }
      })
      ro.observe(container)
      return () => { running = false; cancelAnimationFrame(animId); ro.disconnect() }
    }

    return () => { running = false; cancelAnimationFrame(animId) }
  }, [blocks, height])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 }
    hoveredRef.current = -1
    setIsHoveringAny(false)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || !e.touches[0]) return
    e.preventDefault()
    mouseRef.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
  }, [])

  const handleTouchEnd = useCallback(() => {
    const idx = hoveredRef.current
    if (idx >= 0 && nodesRef.current[idx]) {
      const node = nodesRef.current[idx]
      setPanelPos({ x: node.x, y: node.y })
      setSelectedNode(node)
    }
    mouseRef.current = { x: -9999, y: -9999 }
    hoveredRef.current = -1
    setIsHoveringAny(false)
  }, [])

  const [panelPos, setPanelPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const handleClick = useCallback(() => {
    const idx = hoveredRef.current
    if (idx >= 0 && nodesRef.current[idx]) {
      const node = nodesRef.current[idx]
      setPanelPos({ x: node.x, y: node.y })
      setSelectedNode(node)
    }
  }, [])

  return (
    <div ref={containerRef} className="graph-wrap"
      style={{ position: 'relative', width: '100%', height, borderRadius: 12, overflow: 'hidden', touchAction: 'none' }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick}
      onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, cursor: isHoveringAny ? 'pointer' : 'default' }} />

      <AnimatePresence>
        {selectedNode && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className="graph-detail-panel"
            style={{
              left: Math.min(Math.max(panelPos.x, 170), widthRef.current - 170),
              top: Math.min(Math.max(panelPos.y + 20, 20), height - 60),
              transform: 'translate(-50%, 0)',
            }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span className="tag tag-purple" style={{ fontSize: 10, padding: '3px 12px', background: 'linear-gradient(135deg, #f3e8ff, #ede9fe)', border: '1px solid rgba(124, 58, 237, 0.15)' }}>{selectedNode.label}</span>
              <button onClick={() => setSelectedNode(null)} style={{ background: 'rgba(107, 114, 128, 0.08)', border: 'none', cursor: 'pointer', padding: 6, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                <X size={14} color="#6b7280" />
              </button>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: '#374151', fontWeight: 400, letterSpacing: '-0.01em' }}>{selectedNode.content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
function DemoSection() {
  return (
    <section id="demo" style={{ padding: '96px 24px', background: '#ffffff' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div className="tag tag-purple" style={{ marginBottom: 12 }}>真实案例</div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 600, color: '#1a1a2e', letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 8px' }}>
            云边协同的嵌入式AI监控相机研发
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>AI 对这个项目的完整拆解方案 · 悬停查看标签 · 点击查看详情</p>
        </div>
        <NetworkGraph blocks={DEMO_BLOCKS} height={520} />
      </div>
    </section>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [userInput, setUserInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [liveBlocks, setLiveBlocks] = useState<Block[]>([])
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const outputRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.load()
    const tryPlay = () => v.play().catch(() => {})
    tryPlay()
    const onVisible = () => { if (!document.hidden) tryPlay() }
    document.addEventListener('visibilitychange', onVisible)
    // iOS Safari requires user gesture — play on first touch anywhere
    const onTouch = () => { tryPlay(); document.removeEventListener('touchstart', onTouch) }
    document.addEventListener('touchstart', onTouch, { passive: true })
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      document.removeEventListener('touchstart', onTouch)
    }
  }, [])

  const handleStream = async () => {
    if (!apiKey.trim() || !userInput.trim()) return
    setStreaming(true); setStreamedText(''); setLiveBlocks([]); setDone(false); setError('')
    let fullText = ''

    try {
      const res = await fetch('https://siyu-ai.top/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          stream: true,
          messages: [
            {
              role: 'system',
              content: `你是一个资深全栈架构师和项目经理。用户会给你一个项目需求，请输出完整的项目拆解方案，严格按以下20个章节结构输出，每个章节标题用 ## 开头，内容简洁不超过3行，不要用表格：\n\n## 项目定位\n（一句话概括核心价值，50字以内）\n\n## 核心功能\n（列出4-5个核心功能点，每个一行）\n\n## 技术栈\n（前端/后端/数据库/AI框架，每项一行）\n\n## 系统架构\n（描述整体架构模式，如微服务/单体/边缘计算等）\n\n## 数据架构\n（数据流向、存储方案、关键数据模型）\n\n## 用户画像\n（目标用户群体、使用场景、核心诉求）\n\n## 市场分析\n（市场规模、增长趋势、切入时机）\n\n## 竞品对比\n（2-3个主要竞品，核心差异化优势）\n\n## 商业模式\n（盈利方式、定价策略、变现路径）\n\n## 开发里程碑\n（4个阶段，格式：Week X-X：任务描述）\n\n## 团队分工\n（3-4个角色，每个一行）\n\n## AI效率\n（AI工具如何提升开发效率，节省多少时间）\n\n## 安全策略\n（认证授权、数据加密、关键安全措施）\n\n## 性能优化\n（关键性能指标、优化方向、预期目标）\n\n## 测试策略\n（单元测试/集成测试/压测方案）\n\n## 部署方案\n（云服务选型、CI/CD流程、容器化方案）\n\n## 监控运维\n（监控指标、告警策略、运维工具）\n\n## 风险评估\n（3个主要风险点及应对措施）\n\n## 成本估算\n（开发成本、运营成本、预计月均支出）\n\n## 成功指标\n（3-5个可量化的KPI，用于衡量项目成功）`,
            },
            { role: 'user', content: userInput },
          ],
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        setError(`请求失败 ${res.status}：${errText.slice(0, 120)}`)
        setStreaming(false); return
      }
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (reader) {
        const { done: rdDone, value } = await reader.read()
        if (rdDone) break
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
              const parsed = parseBlocks(fullText)
              if (parsed.length > 0) setLiveBlocks(parsed)
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (e: unknown) {
      setError(`网络错误：${e instanceof Error ? e.message : String(e)}`)
      setStreaming(false); return
    }

    setStreaming(false); setDone(true)
    const final = parseBlocks(fullText)
    if (final.length > 0) setLiveBlocks(final)
  }

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [streamedText])

  const scrollToTry = () => document.getElementById('try')?.scrollIntoView({ behavior: 'smooth' })
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#ffffff', color: '#1a1a2e' }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          // @ts-ignore
          webkit-playsinline="true"
          x-webkit-airplay="allow"
          preload="auto"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.2)', zIndex: 1 }} />

        {/* NAV */}
        <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0', gap: 16 }} className="nav-pad">
          <motion.div custom={0} variants={fadeDown} initial="hidden" animate="show"
            style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${ACCENT}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: ACCENT }} />
          </motion.div>

          <motion.button custom={5} variants={fadeDown} initial="hidden" animate="show"
            onClick={() => setMenuOpen(true)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ width: 16, height: 2, background: '#fff', display: 'block' }} />
            <span style={{ width: 16, height: 2, background: '#fff', display: 'block' }} />
            <span style={{ width: 16, height: 2, background: '#fff', display: 'block' }} />
          </motion.button>
        </nav>

        {/* STATS ROW */}
        <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '32px 20px' }} className="nav-pad">
          <div style={{ display: 'flex', gap: 'clamp(20px, 4vw, 40px)' }}>
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'clamp(1.5rem, 5vw, 3.5rem)', fontWeight: 600, lineHeight: 1, color: '#1a1a2e' }}>
                500<span style={{ fontSize: '0.5em', color: ACCENT }}>+</span>
              </div>
              <div style={{ fontSize: 'clamp(9px, 1.2vw, 13px)', fontWeight: 600, letterSpacing: '0.12em', color: '#9ca3af', lineHeight: 1.3, marginTop: 4 }}>
                用户 稳定接入
              </div>
            </motion.div>
          </div>
        </div>
        {/* BOTTOM CONTENT */}
        <div style={{ position: 'relative', zIndex: 10, padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 4vw, 48px)' }} className="nav-pad-bottom">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <motion.p custom={5} variants={fadeUp} initial="hidden" animate="show"
              style={{ fontSize: 'clamp(9px, 1.2vw, 13px)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af', maxWidth: 'clamp(130px, 20vw, 320px)', lineHeight: 1.6 }}>
              司屿API /<br />高效 /<br />稳定
            </motion.p>
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show">
              <a href="https://shop.api-siyu.top/" target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'clamp(15px, 2.5vw, 24px)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: ACCENT, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                进入司屿API
                <ArrowUpRight size={typeof window !== 'undefined' && window.innerWidth < 640 ? 18 : 22} />
              </a>
            </motion.div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'clamp(12px, 2vw, 16px)' }}>
            <motion.div custom={7} variants={fadeUp} initial="hidden" animate="show"
              style={{ width: 'clamp(120px, 18vw, 280px)', flexShrink: 0 }}>
              <p style={{ fontSize: 'clamp(9px, 1.1vw, 13px)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', lineHeight: 1.6 }}>
                司屿API 让每个人享受世界上最强大的模型
              </p>
            </motion.div>

            <div style={{ textAlign: 'right' }}>
              {['C I L', '正在逐渐重构着', 'anything'].map((word, wi) => (
                <div key={word} style={{ overflow: 'hidden' }}>
                  <motion.div
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.4 + wi * 0.14, duration: 0.7, ease: EASE }}
                    style={{ fontSize: 'clamp(2rem, 9vw, 9rem)', lineHeight: 0.88, fontWeight: 600, textTransform: 'uppercase', color: '#1a1a2e', letterSpacing: '-0.02em' }}>
                    {word}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#ffffff', display: 'flex', flexDirection: 'column', padding: '20px 20px 40px' }}
            className="nav-pad">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${ACCENT}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: ACCENT }} />
              </div>
              <button onClick={() => setMenuOpen(false)}
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#1a1a2e" />
              </button>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <a href="https://shop.api-siyu.top/" target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: ACCENT, textDecoration: 'none' }}>
                进入司屿API <ArrowUpRight size={20} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DEMO SECTION ── */}
      <DemoSection />
      {/* ── TRY IT SECTION ── */}
      <section id="try" style={{ padding: '96px 24px', background: '#ffffff' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <div className="tag tag-purple" style={{ marginBottom: 12 }}>亲自体验</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 600, color: '#1a1a2e', letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 8px' }}>输入你的项目需求</h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>填入 API Key，AI 实时生成方案</p>
          </div>

          <div style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24, maxWidth: 720 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 8 }}>API Key</label>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-..."
                style={{ width: '100%', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#1a1a2e', fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 8 }}>项目需求</label>
              <textarea value={userInput} onChange={e => setUserInput(e.target.value)}
                placeholder="例如：做一个校园跑腿小程序、搭建一个 AI 客服系统..." rows={3}
                style={{ width: '100%', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#1a1a2e', fontFamily: 'inherit', outline: 'none', resize: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn-primary" onClick={handleStream} disabled={streaming || !apiKey.trim() || !userInput.trim()}>
                {streaming ? (
                  <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="8" strokeLinecap="round"/>
                  </svg>AI 正在拆解…</>
                ) : '开始拆解'}
              </button>
              {done && <span className="tag tag-green"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>已完成</span>}
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', marginBottom: 20, maxWidth: 720 }}>
              <p style={{ fontSize: 13, color: '#dc2626' }}>{error}</p>
            </div>
          )}

          {streaming && liveBlocks.length === 0 && streamedText && (
            <div style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20, maxWidth: 720 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 12 }}>AI 输出</div>
              <div ref={outputRef} style={{ maxHeight: 280, overflowY: 'auto' }}>
                <p className="streaming-cursor" style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, Menlo, monospace' }}>
                  {streamedText}
                </p>
              </div>
            </div>
          )}

          {liveBlocks.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                方案拆解
                {streaming && <span style={{ color: ACCENT, fontSize: 10 }}>生成中…</span>}
              </div>
              <NetworkGraph blocks={liveBlocks} height={480} />
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '32px 24px', textAlign: 'center', background: '#ffffff' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>
          CIL<span style={{ color: '#6b7280', fontWeight: 400 }}>-anything</span>
        </p>
        <p style={{ fontSize: 12, color: '#6b7280' }}>Powered by claude-sonnet-4-6 · 想获取 API Key？联系管理员</p>
      </footer>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .nav-pad { padding-left: clamp(20px, 4vw, 48px); padding-right: clamp(20px, 4vw, 48px); }
        .nav-pad-bottom { padding-left: clamp(20px, 4vw, 48px); padding-right: clamp(20px, 4vw, 48px); }
      `}</style>
    </div>
  )
}