import { useEffect } from 'react'
import { useEditorStore } from '@/store/editorStore'

const KEY = 'uni-autosave'

/** Çalışma durumunu her değişiklikten 800ms sonra yerel depoya yazar. */
export function useAutosave(): void {
  useEffect(() => {
    let timer: number | undefined
    const unsub = useEditorStore.subscribe((s) => {
      if (!s.hasDocument) {
        localStorage.removeItem(KEY)
        return
      }
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        try {
          localStorage.setItem(
            KEY,
            JSON.stringify({ xml: s.xml, xslt: s.xslt, docType: s.docType, savedAt: Date.now() })
          )
        } catch {
          /* kota dolu olabilir */
        }
      }, 800)
    })
    return () => {
      unsub()
      window.clearTimeout(timer)
    }
  }, [])
}

export interface AutosavePayload {
  xml: string
  xslt: string
  docType: 'fatura' | 'arsiv' | 'irsaliye'
  savedAt: number
}

export function readAutosave(): AutosavePayload | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as AutosavePayload
    return p.xml && p.xslt ? p : null
  } catch {
    return null
  }
}

export function clearAutosave(): void {
  localStorage.removeItem(KEY)
}
