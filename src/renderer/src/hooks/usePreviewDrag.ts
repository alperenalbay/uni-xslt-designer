/**
 * Hibrit sürükleme motoru:
 *  - Alt tutmadan sürükleme (sayfa kabının doğrudan çocuğu ise) → bölüm sıralama
 *  - Alt + sürükleme → serbest konumlandırma (position:relative + left/top)
 *  - <th> sağ kenarından sürükleme → tablo sütun genişletme
 * Canlı geri bildirim canlı DOM'da yapılır; fare bırakılınca tek seferde XSLT'ye yazılır.
 */
import { useEffect } from 'react'
import { XSLT_ID_ATTR } from '@/core/xsltId'
import { moveXsltNode, setStyleInXslt } from '@/core/xsltWrite'
import { useEditorStore } from '@/store/editorStore'
import { usePreviewStore } from '@/store/previewStore'

interface DragHandlers {
  /** Bölüm sıralamada bırakma çizgisi konumu (iframe px) — null gizle */
  onDropLine: (line: { x: number; y: number; height: number } | null) => void
  /** Serbest konumda merkez hizalama kılavuzu (iframe px x) */
  onGuide: (x: number | null) => void
}

const EDGE = 7

export function usePreviewDrag(
  frameRef: React.RefObject<HTMLIFrameElement | null>,
  loadTick: number,
  scale: number,
  handlers: DragHandlers
): void {
  const html = usePreviewStore((s) => s.html)

  useEffect(() => {
    const docOrNull = frameRef.current?.contentDocument
    if (!docOrNull?.body || !html) return
    const doc: Document = docOrNull

    function resolveId(target: EventTarget | null): { el: HTMLElement; id: string } | null {
      const el = (target as Element | null)?.closest?.(`[${XSLT_ID_ATTR}]`) as HTMLElement | null
      if (!el) return null
      return { el, id: el.getAttribute(XSLT_ID_ATTR) ?? '' }
    }

    function commit(patch: Record<string, string>, id: string): void {
      const { xslt, setXslt } = useEditorStore.getState()
      setXslt(setStyleInXslt(xslt, id, patch))
    }

    function commitMove(id: string, refId: string, position: 'before' | 'after'): void {
      const { xslt, setXslt } = useEditorStore.getState()
      setXslt(moveXsltNode(xslt, id, { refId, position }))
    }

    /* --- Sütun genişletme --- */
    function startColumnResize(e: MouseEvent, th: HTMLElement, id: string): void {
      const win = doc.defaultView ?? window
      e.preventDefault()
      e.stopPropagation()
      const startX = e.clientX
      const baseW = th.getBoundingClientRect().width
      const move = (ev: MouseEvent): void => {
        const w = Math.max(24, baseW + (ev.clientX - startX) / scale)
        th.style.width = `${w}px`
        ;(th.parentElement?.parentElement as HTMLElement | null)?.style.setProperty(
          'table-layout',
          'fixed'
        )
      }
      const up = (): void => {
        win.removeEventListener('mousemove', move)
        win.removeEventListener('mouseup', up)
        doc.body.style.cursor = ''
        const w = parseFloat(th.style.width)
        if (Number.isFinite(w)) commit({ width: `${Math.round(w)}px` }, id)
      }
      win.addEventListener('mousemove', move)
      win.addEventListener('mouseup', up)
    }

    /* --- Serbest konumlandırma (Alt veya herhangi bir iç öğe) --- */
    function startFreeDrag(e: MouseEvent, el: HTMLElement, id: string): void {
      const win = doc.defaultView ?? window
      e.preventDefault()
      e.stopPropagation()
      const startX = e.clientX
      const startY = e.clientY
      let moved = false
      const cs = getComputedStyle(el)
      el.style.position = 'relative'
      const baseLeft = parseFloat(cs.left || '0') || 0
      const baseTop = parseFloat(cs.top || '0') || 0
      const page = el.closest('.page') as HTMLElement | null

      const move = (ev: MouseEvent): void => {
        const dx = (ev.clientX - startX) / scale
        const dy = (ev.clientY - startY) / scale
        if (!moved && Math.abs(dx) + Math.abs(dy) > 3) moved = true
        if (!moved) return
        let newLeft = baseLeft + dx
        el.style.left = `${newLeft}px`
        el.style.top = `${baseTop + dy}px`

        // merkez hizalama kılavuzu
        if (page) {
          const pr = page.getBoundingClientRect()
          const r = el.getBoundingClientRect()
          const centerX = r.left + r.width / 2 - pr.left
          const pageCenter = pr.width / 2
          if (Math.abs(centerX - pageCenter) < 5 / scale) {
            newLeft += pageCenter - centerX
            el.style.left = `${newLeft}px`
            handlers.onGuide(pageCenter)
          } else handlers.onGuide(null)
        }
      }
      const up = (): void => {
        win.removeEventListener('mousemove', move)
        win.removeEventListener('mouseup', up)
        handlers.onGuide(null)
        if (!moved) {
          // tıklama amaçlıydı — konumu değiştirme
          el.style.position = ''
          el.style.left = ''
          el.style.top = ''
          return
        }
        commit(
          {
            position: 'relative',
            left: `${Math.round(parseFloat(el.style.left))}px`,
            top: `${Math.round(parseFloat(el.style.top))}px`
          },
          id
        )
      }
      win.addEventListener('mousemove', move)
      win.addEventListener('mouseup', up)
    }

    /* --- Bölüm sıralama (akış) --- */
    function startReorder(e: MouseEvent, el: HTMLElement, id: string): void {
      const win = doc.defaultView ?? window
      e.preventDefault()
      e.stopPropagation()
      const parent = el.parentElement
      if (!parent) return
      const siblings = Array.from(parent.children).filter(
        (c): c is HTMLElement => c !== el && c.hasAttribute(XSLT_ID_ATTR)
      )

      let lastTarget: { refId: string; before: boolean } | null = null
      const move = (ev: MouseEvent): void => {
        const myY = ev.clientY
        let best: { refId: string; before: boolean } | null = null
        let bestDist = Infinity
        for (const s of siblings) {
          const r = s.getBoundingClientRect()
          const mid = r.top + r.height / 2
          const before = myY < mid
          const dist = Math.abs(mid - myY)
          if (dist < bestDist) {
            bestDist = dist
            best = { refId: s.getAttribute(XSLT_ID_ATTR) ?? '', before }
          }
        }
        lastTarget =
          best && bestDist < 160 ? (siblings.length > 0 ? best : null) : null

        if (lastTarget && best) {
          const refEl = siblings.find(
            (s) => s.getAttribute(XSLT_ID_ATTR) === lastTarget!.refId
          )!
          const r = refEl.getBoundingClientRect()
          const y = lastTarget.before ? r.top : r.bottom
          handlers.onDropLine({ x: parent.getBoundingClientRect().left, y, height: 2 })
        } else handlers.onDropLine(null)
      }
      const up = (): void => {
        win.removeEventListener('mousemove', move)
        win.removeEventListener('mouseup', up)
        handlers.onDropLine(null)
        if (lastTarget) commitMove(id, lastTarget.refId, lastTarget.before ? 'before' : 'after')
      }
      win.addEventListener('mousemove', move)
      win.addEventListener('mouseup', up)
    }

    const onMouseDown = (e: MouseEvent): void => {
      if (e.button !== 0) return
      const hit = resolveId(e.target)
      if (!hit) return

      // 1) Sütun kenarı
      if (/^(TH|TD)$/i.test(hit.el.tagName)) {
        const r = hit.el.getBoundingClientRect()
        if (r.right - e.clientX < EDGE / scale + 3) {
          startColumnResize(e, hit.el, hit.id)
          return
        }
      }

      // 2) Sayfa kabının doğrudan çocuğu → bölüm sıralama
      const pageContainer = hit.el.closest('.page') ?? doc.body
      const isSection = hit.el.parentElement === pageContainer

      // 3) Alt her zaman serbest konum; iç öğeler (metin kutusu, görsel, paragraf…)
      //    artık Alt'sız da sürüklenip taşınabilir; bölümler akışta sıralanır.
      if (e.altKey || !isSection) {
        startFreeDrag(e, hit.el, hit.id)
        return
      }
      startReorder(e, hit.el, hit.id)
    }

    const onMouseMoveHover = (e: MouseEvent): void => {
      const hit = resolveId(e.target)
      if (!hit) {
        doc.body.style.cursor = ''
        return
      }
      if (/^(TH|TD)$/i.test(hit.el.tagName)) {
        const r = hit.el.getBoundingClientRect()
        doc.body.style.cursor =
          r.right - e.clientX < EDGE / scale + 3 ? 'col-resize' : ''
      } else {
        doc.body.style.cursor = ''
      }
    }

    doc.addEventListener('mousedown', onMouseDown)
    doc.addEventListener('mousemove', onMouseMoveHover)

    return () => {
      doc.removeEventListener('mousedown', onMouseDown)
      doc.removeEventListener('mousemove', onMouseMoveHover)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, loadTick, scale])
}


