import { useEffect } from 'react'
import { XSLT_ID_ATTR } from '@/core/xsltId'
import { deleteXsltNode, setStyleInXslt, setTextInXslt } from '@/core/xsltWrite'
import { useEditorStore } from '@/store/editorStore'
import { usePreviewStore } from '@/store/previewStore'

const NUDGE: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1]
}

export interface SelectionRect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Önizleme iframe'i üzerinde doğrudan etkileşim:
 * - tıkla-seç (data-xslt-id çözümlemesi)
 * - seçim halkası sınıfı yönetimi
 * - çift tıkla statik metin düzenleme
 * - Delete ile öğe silme
 */
export function usePreviewInteraction(
  frameRef: React.RefObject<HTMLIFrameElement | null>,
  loadTick: number,
  scale: number,
  onRect: (r: SelectionRect | null) => void
): void {
  const html = usePreviewStore((s) => s.html)
  const selectedId = useEditorStore((s) => s.selectedXsltId)
  const setSelected = useEditorStore((s) => s.setSelectedXsltId)

  const getDoc = (): Document | null => {
    const doc = frameRef.current?.contentDocument
    return doc?.body ? doc : null
  }

  // Tık-seç + çift tık düzenleme + Delete silme dinleyicileri
  useEffect(() => {
    const doc = getDoc()
    if (!doc || !html) return

    const resolve = (target: EventTarget | null): HTMLElement | null => {
      const el = target as Element | null
      return el?.closest?.(`[${XSLT_ID_ATTR}]`) as HTMLElement | null
    }

    const onClick = (e: MouseEvent): void => {
      const el = resolve(e.target)
      setSelected(el?.getAttribute(XSLT_ID_ATTR) ?? null)
    }

    const onDblClick = (e: MouseEvent): void => {
      const el = resolve(e.target)
      if (!el) return
      const id = el.getAttribute(XSLT_ID_ATTR)
      const dynamicIds = usePreviewStore.getState().dynamicIds
      if (!id || dynamicIds.includes(id)) return

      const { xslt } = useEditorStore.getState()
      void xslt
      el.contentEditable = 'true'
      el.classList.add('uni-editing')
      el.focus()

      let cancelled = false
      const onKeyDown = (ev: KeyboardEvent): void => {
        if (ev.key === 'Escape') {
          cancelled = true
          finish()
        }
        ev.stopPropagation()
      }
      const finish = (): void => {
        el.removeEventListener('keydown', onKeyDown, true)
        el.removeEventListener('blur', finish)
        el.contentEditable = 'false'
        el.classList.remove('uni-editing')
        if (!cancelled) {
          const newText = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
          const current = (el.dataset.uniOriginalText ?? '').trim()
          if (newText && newText !== current) {
            const src = useEditorStore.getState().xslt
            useEditorStore.getState().setXslt(setTextInXslt(src, id, newText))
          }
          el.dataset.uniOriginalText = ''
        }
      }
      el.dataset.uniOriginalText = el.textContent ?? ''
      el.addEventListener('keydown', onKeyDown, true)
      el.addEventListener('blur', finish)
    }

    const onKeyDown = (e: KeyboardEvent): void => {
      // Ok tuşları: seçili öğeyi ince ayarla kaydır (yazma alanlarında değil)
      const nudge = NUDGE[e.key]
      if (nudge) {
        const active = doc.activeElement as HTMLElement | null
        if (
          active?.isContentEditable ||
          active?.tagName === 'INPUT' ||
          active?.tagName === 'TEXTAREA' ||
          active?.closest?.('.monaco-editor')
        ) {
          return
        }
        const id = useEditorStore.getState().selectedXsltId
        if (!id) return
        e.preventDefault()
        const el = doc.querySelector(`[${XSLT_ID_ATTR}="${CSS.escape(id)}"]`) as HTMLElement | null
        if (!el) return
        const step = e.shiftKey ? 10 : 1
        const cs = getComputedStyle(el)
        const curLeft = parseFloat(cs.left || '0') || 0
        const curTop = parseFloat(cs.top || '0') || 0
        const src = useEditorStore.getState().xslt
        useEditorStore.getState().setXslt(
          setStyleInXslt(src, id, {
            position: 'relative',
            left: `${curLeft + nudge[0] * step}px`,
            top: `${curTop + nudge[1] * step}px`
          })
        )
        return
      }

      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      const active = doc.activeElement as HTMLElement | null
      if (
        active?.isContentEditable ||
        active?.tagName === 'INPUT' ||
        active?.tagName === 'TEXTAREA'
      )
        return
      const id = useEditorStore.getState().selectedXsltId
      if (!id) return
      const src = useEditorStore.getState().xslt
      useEditorStore.getState().setXslt(deleteXsltNode(src, id))
      setSelected(null)
    }

    const onScroll = (): void => emitRect()

    function emitRect(): void {
      const id = useEditorStore.getState().selectedXsltId
      const d = getDoc()
      if (!id || !d) return onRect(null)
      const el = d.querySelector(`[${XSLT_ID_ATTR}="${CSS.escape(id)}"]`) as HTMLElement | null
      if (!el) return onRect(null)
      const r = el.getBoundingClientRect()
      onRect({ x: r.left, y: r.top, width: r.width, height: r.height })
    }

    doc.addEventListener('click', onClick)
    doc.addEventListener('dblclick', onDblClick)
    doc.addEventListener('keydown', onKeyDown)
    doc.addEventListener('scroll', onScroll, true)
    emitRect()

    return () => {
      doc.removeEventListener('click', onClick)
      doc.removeEventListener('dblclick', onDblClick)
      doc.removeEventListener('keydown', onKeyDown)
      doc.removeEventListener('scroll', onScroll, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, loadTick])

  // Seçim halkası + rect güncellemesi (seçim değiştiğinde / yeniden dönüşümde)
  useEffect(() => {
    const doc = getDoc()
    if (!doc) return
    doc.querySelectorAll('.uni-selected').forEach((el) => el.classList.remove('uni-selected'))
    if (selectedId) {
      const el = doc.querySelector(`[${XSLT_ID_ATTR}="${CSS.escape(selectedId)}"]`)
      el?.classList.add('uni-selected')
    }
    const id = selectedId
    if (!id) {
      onRect(null)
      return
    }
    const el = doc.querySelector(`[${XSLT_ID_ATTR}="${CSS.escape(id)}"]`) as HTMLElement | null
    if (!el) {
      onRect(null)
      return
    }
    const r = el.getBoundingClientRect()
    onRect({ x: r.left, y: r.top, width: r.width, height: r.height })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, html, scale])
}
