import { useEffect, useRef } from 'react'
import { transformXmlWithXslt } from '@/core/transformer'
import { useEditorStore } from '@/store/editorStore'
import { usePreviewStore } from '@/store/previewStore'

const DEBOUNCE_MS = 400

/** xml/xslt değişimini 400ms debounce ile dönüştürür; sonucu previewStore'a yazar. */
export function useTransform(): void {
  const xml = useEditorStore((s) => s.xml)
  const xslt = useEditorStore((s) => s.xslt)
  const timer = useRef<number | undefined>(undefined)
  const runToken = useRef(0)

  useEffect(() => {
    if (!xml && !xslt) return
    usePreviewStore.setState({ busy: true })
    window.clearTimeout(timer.current)
    const token = ++runToken.current
    timer.current = window.setTimeout(async () => {
      const res = await transformXmlWithXslt(xml, xslt)
      if (token !== runToken.current) return
      usePreviewStore.setState({
        html: res.html,
        issues: res.issues,
        busy: false,
        dynamicIds: res.dynamicIds,
        meta: res.meta
      })
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(timer.current)
  }, [xml, xslt])
}
