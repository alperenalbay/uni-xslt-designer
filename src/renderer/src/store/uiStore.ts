import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'dark' | 'light'
export type DocType = 'fatura' | 'arsiv' | 'irsaliye'
export type LeftTab = 'templates' | 'elements'
export type CodeTab = 'xslt' | 'xml' | 'html'

interface UiState {
  theme: ThemeMode
  docType: DocType
  leftTab: LeftTab | null
  codeDrawerOpen: boolean
  activeCodeTab: CodeTab
  canvasZoom: number
  canvasFit: boolean
  /** XML'den çıkarılan gömülü tasarım teklifi */
  embedOffer: { label: string; xslt: string } | null
  /** Açılan XML için bekleyen şablon seçimi (gömülü tasarım yokken) */
  templatePicker: { xml: string; name: string; docType: DocType } | null
  setTheme: (t: ThemeMode) => void
  toggleTheme: () => void
  setDocType: (d: DocType) => void
  setLeftTab: (t: LeftTab | null) => void
  setCodeDrawerOpen: (v: boolean) => void
  setActiveCodeTab: (t: CodeTab) => void
  setCanvasZoom: (z: number) => void
  setCanvasFit: (v: boolean) => void
  offerEmbed: (o: { label: string; xslt: string } | null) => void
  openTemplatePicker: (p: { xml: string; name: string; docType: DocType }) => void
  closeTemplatePicker: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      docType: 'fatura',
      leftTab: null,
      codeDrawerOpen: true,
      activeCodeTab: 'xslt',
      canvasZoom: 1,
      canvasFit: true,
      embedOffer: null,
      templatePicker: null,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setDocType: (docType) => set({ docType }),
      setLeftTab: (leftTab) => set({ leftTab }),
      setCodeDrawerOpen: (codeDrawerOpen) => set({ codeDrawerOpen }),
      setActiveCodeTab: (activeCodeTab) => set({ activeCodeTab }),
      setCanvasZoom: (canvasZoom) => set({ canvasZoom }),
      setCanvasFit: (canvasFit) => set({ canvasFit }),
      offerEmbed: (embedOffer) => set({ embedOffer }),
      openTemplatePicker: (templatePicker) => set({ templatePicker }),
      closeTemplatePicker: () => set({ templatePicker: null })
    }),
    {
      name: 'uni-ui',
      partialize: (s) => ({ theme: s.theme })
    }
  )
)

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  fatura: 'e-Fatura',
  arsiv: 'e-Arşiv',
  irsaliye: 'e-İrsaliye'
}
