import { create } from 'zustand'
import type { ValidationIssue } from '@/core/validation'

interface PreviewState {
  html: string
  issues: ValidationIssue[]
  busy: boolean
  /** İçinde xsl talimatı olan öğeler — statik metin düzenlemesi yasak */
  dynamicIds: string[]
  /** id → kaynak kod arama imzası */
  meta: Record<string, { tag: string; ordinal: number }>
  /** Tuvalde fiilen uygulanan ölçek (durum çubuğu göstergesi için) */
  effectiveScale: number
  /** Paletten yeni eklenen öğeyi otomatik seçmek için bekleyen işaret */
  pendingSelectMarker: string | null
}

export const usePreviewStore = create<PreviewState>(() => ({
  html: '',
  issues: [],
  busy: false,
  dynamicIds: [],
  meta: {},
  effectiveScale: 1,
  pendingSelectMarker: null
}))

export function printPreview(): void {
  const frame = document.querySelector<HTMLIFrameElement>('#preview-frame')
  frame?.contentWindow?.focus()
  frame?.contentWindow?.print()
}
