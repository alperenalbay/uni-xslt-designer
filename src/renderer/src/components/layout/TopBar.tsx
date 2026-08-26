import {
  Download,
  FileCode,
  FilePlus2,
  Moon,
  Printer,
  Redo2,
  Save,
  Sun,
  Undo2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { DOC_TYPE_LABELS, type DocType, useUiStore } from '@/store/uiStore'
import { IconButton } from '@/components/common/IconButton'
import { printPreview, usePreviewStore } from '@/store/previewStore'
import { redoEditor, undoEditor, useEditorStore } from '@/store/editorStore'
import { useToastStore } from '@/store/toastStore'
import {
  exportPdf,
  openXmlOrXslt,
  saveTextFile,
} from '@/api/ipc'
import { detectDocTypeFromXml } from '@/core/docTypes'
import { extractEmbeddedXslt } from '@/core/embeddedXslt'

const DOC_TYPES: DocType[] = ['fatura', 'arsiv', 'irsaliye']

export function TopBar(): React.JSX.Element {
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const docType = useUiStore((s) => s.docType)
  const hasDocument = useEditorStore((s) => s.hasDocument)

  // zundo geçmişine reaktif abonelik
  const [, force] = useState(0)
  useEffect(() => {
    return useEditorStore.temporal.subscribe(() => force((x) => x + 1))
  }, [])
  const temporal = useEditorStore.temporal.getState()
  const canUndo = temporal.pastStates.length > 0
  const canRedo = temporal.futureStates.length > 0

  /**
   * Birleşik dosya açma akışı:
   *  1) Dosya diyaloğu (XML)
   *  2) Gömülü XSLT varsa → doğrudan onunla yükle
   *  3) Yoksa → şablon seçim kutusu önüne çıkar
   */
  async function openXmlFlow(): Promise<void> {
    const res = await openXmlOrXslt('xml')
    if (!res) return
    const detected = detectDocTypeFromXml(res.content)
    const type = detected === 'bilinmiyor' ? useUiStore.getState().docType : detected

    const embedded = extractEmbeddedXslt(res.content)
    if (embedded) {
      useUiStore.getState().setDocType(type)
      useEditorStore.getState().loadDocument(res.content, embedded.content, type)
      useToastStore.getState().push(`"${res.name}" gömülü tasarımıyla açıldı.`)
      return
    }

    useUiStore
      .getState()
      .openTemplatePicker({ xml: res.content, name: res.name ?? '', docType: type })
  }

  async function handleOpenXslt(): Promise<void> {
    const s = useEditorStore.getState()
    if (!s.hasDocument) {
      useToastStore.getState().push('Önce bir şablon yükleyin, sonra tasarım açın.', 'error')
      return
    }
    const res = await openXmlOrXslt('xslt')
    if (!res) return
    s.setXslt(res.content)
  }

  async function handleSaveXslt(): Promise<void> {
    const { xslt, hasDocument: has } = useEditorStore.getState()
    if (!has || !xslt.trim()) return
    await saveTextFile('tasarim.xslt', xslt, ['xslt', 'xsl', 'xml'])
  }

  async function handleExportPdf(): Promise<void> {
    const html = usePreviewStore.getState().html
    if (!html) return
    await exportPdf(html)
  }

  // Ctrl+S / Ctrl+P / Ctrl+O kısayolları
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (!(e.ctrlKey || e.metaKey)) return
      const k = e.key.toLowerCase()
      if (k === 's') {
        e.preventDefault()
        void handleSaveXslt()
      } else if (k === 'p') {
        e.preventDefault()
        printPreview()
      } else if (k === 'o') {
        e.preventDefault()
        void openXmlFlow()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function goHome(): void {
    const s = useEditorStore.getState()
    if (s.hasDocument) {
      s.closeDocument()
      useToastStore.getState().push('Ana ekrana dönüldü — çalışma otomatik kaydedildi.')
    }
  }

  function handleDocType(type: DocType): void {
    goHome()
    useUiStore.getState().setDocType(type)
  }

  return (
    <header className="relative z-10 flex h-12 shrink-0 items-center gap-3 border-b border-edge bg-panel px-3">
      <button
        type="button"
        onClick={goHome}
        title="Ana ekran / Yeni Belge"
        className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-accent-soft"
      >
        <span className="block h-3.5 w-3.5 rotate-45 rounded-[3px] bg-accent shadow-[0_0_12px_var(--at-accent)]" />
        <span className="text-[13px] font-bold tracking-tight">UNI Tasarım</span>
        <span className="rounded bg-panel-2 px-1.5 py-0.5 font-mono text-[9px] text-secondary">
          v0.3.4
        </span>
      </button>

      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-edge bg-panel-2 p-[3px]">
        {DOC_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleDocType(type)}
            className={`seg-btn ${docType === type ? 'is-active' : ''}`}
          >
            {DOC_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-0.5">
        <IconButton icon={FilePlus2} label="Dosya Aç (XML) (Ctrl+O)" onClick={openXmlFlow} />
        <IconButton icon={FileCode} label="XSLT Tasarımı Aç" onClick={handleOpenXslt} />
        <span className="mx-1.5 h-4 w-px bg-edge" />
        <IconButton icon={Undo2} label="Geri Al (Ctrl+Z)" disabled={!canUndo} onClick={undoEditor} />
        <IconButton icon={Redo2} label="Yinele (Ctrl+Y)" disabled={!canRedo} onClick={redoEditor} />
        <span className="mx-1.5 h-4 w-px bg-edge" />
        <IconButton icon={Save} label="Tasarımı Kaydet (.xslt) (Ctrl+S)" disabled={!hasDocument} onClick={handleSaveXslt} />
        <IconButton icon={Download} label="PDF olarak indir" disabled={!hasDocument} onClick={handleExportPdf} />
        <IconButton icon={Printer} label="Yazdır (Ctrl+P)" disabled={!hasDocument} onClick={printPreview} />
        <span className="mx-1.5 h-4 w-px bg-edge" />
        <IconButton
          icon={theme === 'dark' ? Sun : Moon}
          label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
          onClick={toggleTheme}
        />
        <span className="ml-2 hidden items-center gap-1 text-[11px] text-secondary lg:flex">
          {DOC_TYPE_LABELS[docType]}
        </span>
      </div>
    </header>
  )
}




