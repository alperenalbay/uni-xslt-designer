import { useCallback, useEffect, useRef, useState } from 'react'
import { Maximize2, Minus, Plus, Printer } from 'lucide-react'
import { printPreview, usePreviewStore } from '@/store/previewStore'
import { useUiStore } from '@/store/uiStore'
import { decorateForDesigner } from '@/core/previewDecor'
import { setStyleInXslt } from '@/core/xsltWrite'
import { useEditorStore } from '@/store/editorStore'
import { XSLT_ID_ATTR } from '@/core/xsltId'
import { usePreviewInteraction, type SelectionRect } from '@/hooks/usePreviewInteraction'
import { usePreviewDrag } from '@/hooks/usePreviewDrag'
import { usePreviewDrop } from '@/hooks/usePreviewDrop'
import { FloatingToolbar } from '@/components/designer/FloatingToolbar'

const A4_PX_WIDTH = 794 // 210mm @96dpi

interface HostPoint {
  x: number
  y: number
}

export function PreviewCanvas(): React.JSX.Element {
  const html = usePreviewStore((s) => s.html)
  const setEffectiveScale = useCallback(
    (v: number) => usePreviewStore.setState({ effectiveScale: v }),
    []
  )

  const fit = useUiStore((s) => s.canvasFit)
  const zoom = useUiStore((s) => s.canvasZoom)
  const setZoom = useUiStore((s) => s.setCanvasZoom)
  const setFit = useUiStore((s) => s.setCanvasFit)

  const wrapRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [fitScale, setFitScale] = useState(0.9)
  const [loadTick, setLoadTick] = useState(0)
  const [rect, setRect] = useState<SelectionRect | null>(null)
  const [dropLine, setDropLine] = useState<{ x: number; y: number; height: number } | null>(null)
  const [guideX, setGuideX] = useState<number | null>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const avail = el.clientWidth - 96
      setFitScale(Math.min(1.4, Math.max(0.25, avail / A4_PX_WIDTH)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const scale = fit ? fitScale : zoom
  useEffect(() => setEffectiveScale(scale), [scale, setEffectiveScale])

  /*
    Zoom kuralı: ölçek iframe elemanına değil, iframe içindeki dokümanın
    body'sine uygulanır — böylece tuval taşması yaşanmaz.
  */
  const applyBodyZoom = useCallback(() => {
    const doc = frameRef.current?.contentDocument
    if (!doc?.body) return
    doc.body.style.transformOrigin = 'top center'
    doc.body.style.transform = `scale(${scale})`
    if (scale < 1) {
      doc.documentElement.style.height = `${Math.round(1123 * scale)}px`
      doc.body.style.marginBottom = '0px'
    }
  }, [scale])

  useEffect(applyBodyZoom, [applyBodyZoom])

  usePreviewInteraction(frameRef, loadTick, scale, setRect)

  // iframe görünür-alan koordinatları → tuval (wrap) koordinatları
  const getFrameOffset = useCallback((): HostPoint => {
    const fr = frameRef.current?.getBoundingClientRect()
    const wr = wrapRef.current?.getBoundingClientRect()
    return { x: (fr?.left ?? 0) - (wr?.left ?? 0), y: (fr?.top ?? 0) - (wr?.top ?? 0) }
  }, [])

  const onDropLine = useCallback(
    (line: { x: number; y: number; height: number } | null) => {
      if (!line) return setDropLine(null)
      const off = getFrameOffset()
      setDropLine({ x: line.x + off.x, y: line.y + off.y, height: line.height })
    },
    [getFrameOffset]
  )
  const onGuide = useCallback(
    (gx: number | null) => {
      if (gx === null) return setGuideX(null)
      const off = getFrameOffset()
      setGuideX(gx * scale + off.x)
    },
    [getFrameOffset, scale]
  )
  usePreviewDrag(frameRef, loadTick, scale, { onDropLine, onGuide })
  usePreviewDrop(frameRef, loadTick)

  // Paletten eklenen yeni öğeyi otomatik seç (işaret sarmalayıcıdadır; iç öğe seçilir)
  useEffect(() => {
    const marker = usePreviewStore.getState().pendingSelectMarker
    if (!marker) return
    const doc = frameRef.current?.contentDocument
    if (!doc?.body || !html) return
    const wrapper = doc.querySelector(`[data-uni-insert="${marker}"]`)
    if (!wrapper) return // henüz dönüştürülmedi — sonraki yükte denenir
    wrapper.removeAttribute('data-uni-insert')
    usePreviewStore.setState({ pendingSelectMarker: null })
    const target =
      (wrapper.querySelector?.(`[${XSLT_ID_ATTR}]`) as HTMLElement | null) ??
      (wrapper as HTMLElement)
    const id = target.getAttribute('data-xslt-id')
    if (id) useEditorStore.getState().setSelectedXsltId(id)
  }, [html, loadTick])

  function stepZoom(delta: number): void {
    setFit(false)
    setZoom(Math.min(1.6, Math.max(0.3, Math.round((zoom + delta) * 100) / 100)))
  }

  // Seçim dikdörtgeni tuval koordinatlarına çevrilir
  const off = getFrameOffset()
  const hostRect: SelectionRect | null = rect

  /** Köşe tutamacı: canlı genişlik/yükseklik sürükleme → bırakınca XSLT'ye yaz. */
  function startResize(e: React.MouseEvent): void {
    e.preventDefault()
    e.stopPropagation()
    const doc = frameRef.current?.contentDocument
    const id = useEditorStore.getState().selectedXsltId
    if (!doc || !id) return
    const el = doc.querySelector(`[${XSLT_ID_ATTR}="${CSS.escape(id)}"]`) as HTMLElement | null
    if (!el) return

    const startX = e.clientX
    const startY = e.clientY
    const r = el.getBoundingClientRect()
    const baseW = r.width / scale
    const baseH = r.height / scale

    const move = (ev: MouseEvent): void => {
      el.style.width = `${Math.max(20, Math.round(baseW + (ev.clientX - startX) / scale))}px`
      el.style.height = `${Math.max(12, Math.round(baseH + (ev.clientY - startY) / scale))}px`
    }
    const up = (): void => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      const patch: Record<string, string> = {}
      const w = parseFloat(el.style.width)
      const h = parseFloat(el.style.height)
      if (Number.isFinite(w)) patch['width'] = `${Math.round(w)}px`
      if (Number.isFinite(h)) patch['height'] = `${Math.round(h)}px`
      const { xslt, setXslt } = useEditorStore.getState()
      setXslt(setStyleInXslt(xslt, id, patch))
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  const handlePos: HostPoint | null =
    rect != null ? { x: rect.x + off.x + rect.width, y: rect.y + off.y + rect.height } : null

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-auto">
      <div className="flex min-h-full items-start justify-center p-12">
        <div
          className="rounded-sm shadow-[var(--at-shadow-page)]"
          style={{ width: A4_PX_WIDTH, height: 1123 }}
        >
          <iframe
            id="preview-frame"
            ref={frameRef}
            title="Belge Önizleme"
            sandbox="allow-scripts allow-same-origin allow-modals"
            srcDoc={decorateForDesigner(html)}
            onLoad={() => {
              applyBodyZoom()
              setLoadTick((t) => t + 1)
            }}
            className="h-full w-full border-0 bg-white"
          />
        </div>
      </div>

      {guideX !== null && <div className="center-guide" style={{ left: guideX }} />}
      {dropLine !== null && (
        <div
          className="drop-line"
          style={{ left: dropLine.x, top: dropLine.y - 2, height: 4 }}
        />
      )}

      <FloatingToolbar rect={hostRect} />

      {handlePos && (
        <div className="resize-handle" title="Boyutlandır" onMouseDown={startResize} style={{ left: handlePos.x - 4, top: handlePos.y - 4 }} />
      )}

      <div className="preview-toolbar">
        <button type="button" className="icon-btn" onClick={() => stepZoom(-0.1)} aria-label="Uzaklaştır">
          <Minus size={14} />
        </button>
        <span className="min-w-[44px] text-center font-mono text-[11px] text-secondary">
          %{Math.round(scale * 100)}
        </span>
        <button type="button" className="icon-btn" onClick={() => stepZoom(0.1)} aria-label="Yakınlaştır">
          <Plus size={14} />
        </button>
        <span className="mx-1 h-4 w-px bg-edge" />
        <button
          type="button"
          className={`icon-btn ${fit ? 'is-active' : ''}`}
          onClick={() => setFit(!fit)}
          aria-label="Genişliğe sığdır"
          title="Genişliğe sığdır"
        >
          <Maximize2 size={14} />
        </button>
        <span className="mx-1 h-4 w-px bg-edge" />
        <button
          type="button"
          className="icon-btn"
          onClick={printPreview}
          aria-label="Yazdır / PDF"
          title="Yazdır / PDF"
        >
          <Printer size={14} />
        </button>
      </div>
    </div>
  )
}
