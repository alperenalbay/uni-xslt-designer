import { X } from 'lucide-react'
import { BUILT_IN_TEMPLATES } from '@/samples/templates'
import { useEditorStore } from '@/store/editorStore'
import { DOC_TYPE_LABELS, type DocType, useUiStore } from '@/store/uiStore'
import { useToastStore } from '@/store/toastStore'

const DOC_TYPES: DocType[] = ['fatura', 'arsiv', 'irsaliye']

/** Açılan XML gömülü tasarım içermiyorsa devreye giren şablon seçim kutusu. */
export function TemplatePickerModal(): React.JSX.Element | null {
  const picker = useUiStore((s) => s.templatePicker)
  const close = useUiStore((s) => s.closeTemplatePicker)
  if (!picker) return null

  const choose = (templateId: string, type: DocType): void => {
    const tpl = BUILT_IN_TEMPLATES[type].find((t) => t.id === templateId)
    if (!tpl) return
    useEditorStore.getState().loadDocument(picker.xml, tpl.xslt, type)
    // loadDocument zaten uiStore'u senkronlar ama hızlı geri bildirim için açıkça da set edelim
    useUiStore.getState().setDocType(type)
    useToastStore.getState().push(`"${picker.name}" ${tpl.name} şablonuyla açıldı.`)
    close()
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onMouseDown={close}
    >
      <div
        className="panel w-[520px] max-w-[92vw] p-5 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="mb-1 flex items-center gap-2">
          <h2 className="text-[15px] font-bold">Şablon Seçin</h2>
          <span className="text-secondary truncate text-[11.5px]">— {picker.name}</span>
          <button type="button" onClick={close} className="icon-btn ml-auto" title="Vazgeç">
            <X size={15} />
          </button>
        </header>
        <p className="text-secondary mb-3 text-[11.5px]">
          Dosyada gömülü tasarım bulunamadı. Hangi şablonla açalım?
        </p>

        <div className="mb-3 flex items-center gap-1 rounded-lg border border-edge bg-panel-2 p-[3px]">
          {DOC_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => useUiStore.setState({ templatePicker: { ...picker, docType: t } })}
              className={`seg-btn flex-1 ${picker.docType === t ? 'is-active' : ''}`}
            >
              {DOC_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          {BUILT_IN_TEMPLATES[picker.docType].map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => choose(tpl.id, picker.docType)}
              className="template-row"
            >
              <span className="font-semibold">{tpl.name}</span>
              <span className="text-secondary text-[10.5px] font-medium">{tpl.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
