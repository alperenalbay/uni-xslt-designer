import { useEffect, useState } from 'react'
import { Archive, FileText, History, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { DOC_TYPE_LABELS, type DocType, useUiStore } from '@/store/uiStore'
import { getSampleXml } from '@/samples'
import { BUILT_IN_TEMPLATES } from '@/samples/templates'
import { clearAutosave, readAutosave, type AutosavePayload } from '@/hooks/useAutosave'

const CARDS: Array<{ type: DocType; icon: LucideIcon; blurb: string }> = [
  {
    type: 'fatura',
    icon: FileText,
    blurb: 'UBL-TR 1.2 · TEMELFATURA profili örnek verisiyle başla.'
  },
  {
    type: 'arsiv',
    icon: Archive,
    blurb: 'UBL-TR 1.2 · EARSIVFATURA profili örnek verisiyle başla.'
  },
  {
    type: 'irsaliye',
    icon: Truck,
    blurb: 'DespatchAdvice TR1.2 sevkiyat verisiyle başla.'
  }
]

export function LandingScreen(): React.JSX.Element {
  const loadDocument = useEditorStore((s) => s.loadDocument)
  const setUiDocType = useUiStore((s) => s.setDocType)
  const [autosave, setAutosave] = useState<AutosavePayload | null>(null)

  useEffect(() => {
    setAutosave(readAutosave())
  }, [])

  function handleLoad(docType: DocType, templateId: string): void {
    const tpl = BUILT_IN_TEMPLATES[docType].find((t) => t.id === templateId)
    if (!tpl) return
    setUiDocType(docType)
    loadDocument(getSampleXml(docType), tpl.xslt, docType)
  }

  function handleRestore(): void {
    if (!autosave) return
    setUiDocType(autosave.docType)
    loadDocument(autosave.xml, autosave.xslt, autosave.docType)
    clearAutosave()
  }

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto p-8">
      <div className="w-full max-w-[860px]">
        <p className="micro-label">UNI Tasarım Atölyesi</p>
        <h1 className="mt-2 text-[26px] font-bold tracking-tight">Ne tasarlamak istersiniz?</h1>
        <p className="text-secondary mt-1 mb-5 text-sm">
          Bir belge türü ve şablon seçin — örnek veriyle anında canlı önizlemeye geçin.
        </p>

        {autosave && (
          <button type="button" onClick={handleRestore} className="restore-card mb-5">
            <History size={16} className="text-accent-strong shrink-0" />
            <span className="text-left text-[12px] font-semibold">
              Önceki oturumdaki tasarımı geri yükle
              <span className="text-secondary block font-normal">
                {new Date(autosave.savedAt).toLocaleString('tr-TR')} tarihli çalışma bulundu.
              </span>
            </span>
          </button>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map(({ type, icon: Icon, blurb }) => (
            <section key={type} className="panel flex flex-col p-4">
              <header className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <h2 className="text-[15px] font-bold">{DOC_TYPE_LABELS[type]}</h2>
              </header>
              <p className="text-secondary mt-2 mb-4 min-h-[36px] text-[11.5px] leading-relaxed">
                {blurb}
              </p>
              <div className="flex flex-col gap-1.5">
                {BUILT_IN_TEMPLATES[type].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleLoad(type, tpl.id)}
                    title={tpl.description}
                    className="template-row"
                  >
                    <span className="font-semibold">{tpl.name}</span>
                    <span className="text-secondary text-[10.5px] font-medium">{tpl.description}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
