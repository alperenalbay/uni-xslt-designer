import { useEffect } from 'react'
import { XSLT_ID_ATTR } from '@/core/xsltId'
import { setImageSrcInXslt } from '@/core/xsltWrite'
import { useEditorStore } from '@/store/editorStore'
import { useToastStore } from '@/store/toastStore'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Önizlemeye dosya bırakma: bir görselin üzerine bırakılırsa kaynağı değiştirilir. */
export function usePreviewDrop(
  frameRef: React.RefObject<HTMLIFrameElement | null>,
  loadTick: number
): void {
  const html = useEditorStore((s) => s.hasDocument)

  useEffect(() => {
    const doc = frameRef.current?.contentDocument
    if (!doc?.body || !html) return

    const onDragOver = (e: DragEvent): void => {
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    }

    const onDrop = async (e: DragEvent): Promise<void> => {
      e.preventDefault()
      const file = e.dataTransfer?.files?.[0]
      if (!file) return
      if (!file.type.startsWith('image/')) {
        useToastStore.getState().push('Sadece görsel dosyaları bırakılabilir.', 'error')
        return
      }
      const target = e.target as Element | null
      const el = target?.closest?.(`[${XSLT_ID_ATTR}]`)
      const img = el?.matches('img') ? el : el?.querySelector('img')
      const id = img?.getAttribute(XSLT_ID_ATTR)
      if (!id) {
        useToastStore
          .getState()
          .push('Görseli mevcut bir resmin üzerine bırakın (logo gibi).', 'info')
        return
      }
      const dataUrl = await fileToDataUrl(file)
      const { xslt, setXslt } = useEditorStore.getState()
      setXslt(setImageSrcInXslt(xslt, id, dataUrl))
      useToastStore.getState().push('Görsel tasarıma gömüldü.')
    }

    doc.addEventListener('dragover', onDragOver)
    doc.addEventListener('drop', onDrop)
    return () => {
      doc.removeEventListener('dragover', onDragOver)
      doc.removeEventListener('drop', onDrop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, loadTick])
}
