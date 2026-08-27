import { useCallback, useEffect, useState } from 'react'
import { Archive, FileText, History, LayoutTemplate, Trash2, Truck, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { DOC_TYPE_LABELS, type DocType, useUiStore } from '@/store/uiStore'
import { getSampleXml } from '@/samples'
import { BUILT_IN_TEMPLATES } from '@/samples/templates'
import { clearAutosave, readAutosave, type AutosavePayload } from '@/hooks/useAutosave'
import { deleteUserTemplate, listUserTemplates, type UserTemplate } from '@/api/ipc'
import { detectDocTypeFromXslt } from '@/core/docTypes'

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
  const [pickerType, setPickerType] = useState<DocType | null>(null)
  const [userTpls, setUserTpls] = useState<UserTemplate[]>([])
  const [loadingUserTpls, setLoadingUserTpls] = useState(false)

  useEffect(() => {
    setAutosave(readAutosave())
  }, [])

  const refreshUserTpls = useCallback(async (): Promise<void> => {
    setLoadingUserTpls(true)
    try {
      setUserTpls(await listUserTemplates())
    } finally {
      setLoadingUserTpls(false)
    }
  }, [])

  useEffect(() => {
    if (pickerType !== null) void refreshUserTpls()
  }, [pickerType, refreshUserTpls])

  function handleLoad(docType: DocType, templateId: string): void {
    const tpl = BUILT_IN_TEMPLATES[docType].find((t) => t.id === templateId)
    if (!tpl) return
    setUiDocType(docType)
    loadDocument(getSampleXml(docType), tpl.xslt, docType)
    setPickerType(null)
  }

  function handleLoadUserTpl(docType: DocType, tpl: UserTemplate): void {
    // Kayıtlı şablon hangi türde olursa olsun, seçili karta ait örnek veriyle aç
    setUiDocType(docType)
    loadDocument(getSampleXml(docType), tpl.content, docType)
    setPickerType(null)
  }

  async function handleDeleteUserTpl(fileName: string): Promise<void> {
    await deleteUserTemplate(fileName)
    void refreshUserTpls()
  }

  function handleRestore(): void {
    if (!autosave) return
    setUiDocType(autosave.docType)
    loadDocument(autosave.xml, autosave.xslt, autosave.docType)
    clearAutosave()
  }

  function userTplsForType(type: DocType): UserTemplate[] {
    return userTpls.filter((t) => {
      const detected = detectDocTypeFromXslt(t.content)
      // bilinmiyor ise her türde göster ki kullanıcı erişebilsin
      return detected === 'bilinmiyor' || detected === type
    })
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
              <div className="mt-auto flex flex-col gap-1.5">
                <span className="text-secondary text-[10.5px]">
                  {BUILT_IN_TEMPLATES[type].length} hazır şablon
                </span>
                <button
                  type="button"
                  onClick={() => setPickerType(type)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-[12px] font-semibold text-white hover:bg-accent-strong"
                >
                  <LayoutTemplate size={14} />
                  Şablonları Gör
                </button>
                <span className="text-center text-[10px] leading-none text-secondary opacity-70">
                  Hazır + kütüphanem bir arada
                </span>
              </div>
            </section>
          ))}
        </div>
      </div>

      {pickerType !== null &&
        (() => {
          const type = pickerType
          const filteredUserTpls = userTplsForType(type)
          return (
            <div
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onMouseDown={() => setPickerType(null)}
            >
              <div
                className="panel flex max-h-[86vh] w-[600px] max-w-[96vw] flex-col overflow-hidden p-5 shadow-2xl"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <header className="mb-1 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-accent-strong">
                    {type === 'fatura' && <FileText size={15} />}
                    {type === 'arsiv' && <Archive size={15} />}
                    {type === 'irsaliye' && <Truck size={15} />}
                  </span>
                  <h2 className="text-[15px] font-bold">{DOC_TYPE_LABELS[type]} — Şablon Seç</h2>
                  <button
                    type="button"
                    onClick={() => setPickerType(null)}
                    className="icon-btn ml-auto"
                    title="Kapat"
                  >
                    <X size={15} />
                  </button>
                </header>
                <p className="text-secondary mb-4 text-[11.5px]">
                  Hazır şablonlardan birini seçin veya daha önce kaydettiğiniz tasarımlardan devam
                  edin.
                </p>

                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <p className="micro-label mb-2">Hazır Şablonlar</p>
                  <div className="mb-4 flex flex-col gap-1.5">
                    {BUILT_IN_TEMPLATES[type].map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleLoad(type, tpl.id)}
                        title={tpl.description}
                        className="template-row text-left"
                      >
                        <span className="font-semibold">{tpl.name}</span>
                        <span className="text-secondary text-[10.5px] font-medium">
                          {tpl.description}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-edge pt-4">
                    <p className="micro-label mb-2">
                      Kütüphanem
                      {filteredUserTpls.length > 0 ? ` · ${filteredUserTpls.length}` : ''}
                    </p>
                    {loadingUserTpls ? (
                      <p className="text-secondary text-[11px]">Yükleniyor…</p>
                    ) : filteredUserTpls.length === 0 ? (
                      <p className="text-secondary text-[10.5px] leading-relaxed opacity-70">
                        Bu tür için kayıtlı şablon yok. Tasarımınızı düzenleyip sol panelde
                        “Şablonlar → Kütüphanem” alanından kaydedebilirsiniz.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {filteredUserTpls.map((tpl) => (
                          <div key={tpl.fileName} className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleLoadUserTpl(type, tpl)}
                              className="template-row min-w-0 flex-1 text-left"
                              title={tpl.content.slice(0, 180)}
                            >
                              <span className="truncate font-semibold">{tpl.name}</span>
                              <span className="text-secondary truncate text-[10.5px] font-medium">
                                {tpl.content.slice(0, 80).replace(/\s+/g, ' ').trim()}…
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUserTpl(tpl.fileName)}
                              title="Sil"
                              aria-label={`${tpl.name} şablonunu sil`}
                              className="icon-btn h-7 w-7 shrink-0 hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end border-t border-edge pt-3">
                  <button type="button" onClick={() => setPickerType(null)} className="seg-btn is-active px-4">
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
    </div>
  )
}
