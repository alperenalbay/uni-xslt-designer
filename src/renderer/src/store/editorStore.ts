import { create } from 'zustand'
import { temporal } from 'zundo'
import type { DocType } from './uiStore'
import { useUiStore } from './uiStore'

export interface EditorState {
  xml: string
  xslt: string
  hasDocument: boolean
  docType: DocType
  selectedXsltId: string | null
  loadDocument: (xml: string, xslt: string, docType: DocType) => void
  closeDocument: () => void
  setXml: (xml: string) => void
  setXslt: (xslt: string) => void
  setSelectedXsltId: (id: string | null) => void
}

/** Geçmişe yalnızca içerik alanları girer; seçim gibi UI durumları hariç. */
interface HistorySlice {
  xml: string
  xslt: string
}

export const useEditorStore = create<EditorState>()(
  temporal<EditorState, [], [], HistorySlice>(
    (set) => ({
      xml: '',
      xslt: '',
      hasDocument: false,
      docType: 'fatura',
      selectedXsltId: null,
      loadDocument: (xml, xslt, docType) => {
        set({ xml, xslt, docType, hasDocument: true, selectedXsltId: null })
        // uiStore ile tek kaynak: açık belge türü her zaman senkron kalsın
        useUiStore.getState().setDocType(docType)
      },
      closeDocument: () => set({ xml: '', xslt: '', hasDocument: false, selectedXsltId: null }),
      setXml: (xml) => set({ xml }),
      setXslt: (xslt) => set({ xslt }),
      setSelectedXsltId: (selectedXsltId) => set({ selectedXsltId })
    }),
    {
      limit: 120,
      equality: (a: HistorySlice, b: HistorySlice) => a.xml === b.xml && a.xslt === b.xslt,
      partialize: (s) => ({ xml: s.xml, xslt: s.xslt })
    }
  )
)

export function undoEditor(): void {
  useEditorStore.temporal.getState().undo()
}

export function redoEditor(): void {
  useEditorStore.temporal.getState().redo()
}
