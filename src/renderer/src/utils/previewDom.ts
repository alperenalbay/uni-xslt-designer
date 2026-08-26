import { XSLT_ID_ATTR } from '@/core/xsltId'
import { useEditorStore } from '@/store/editorStore'

/** Önizleme iframe'inin contentDocument'ını döndürür. */
export function getFrameDoc(): Document | null {
  const doc = document.querySelector<HTMLIFrameElement>('#preview-frame')?.contentDocument
  return doc?.body ? doc : null
}

export function getSelectedEl(): HTMLElement | null {
  const id = useEditorStore.getState().selectedXsltId
  if (!id) return null
  return getFrameDoc()?.querySelector(`[${XSLT_ID_ATTR}="${CSS.escape(id)}"]`) ?? null
}
