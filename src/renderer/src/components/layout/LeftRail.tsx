import {
  Heading1,
  Image as ImageIcon,
  LayoutTemplate,
  Minus,
  Shapes,
  Table as TableIcon,
  Trash2,
  Type
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { LeftTab } from '@/store/uiStore'
import { DOC_TYPE_LABELS, useUiStore } from '@/store/uiStore'
import { appendBlockToPage } from '@/core/xsltWrite'
import { useEditorStore } from '@/store/editorStore'
import { usePreviewStore } from '@/store/previewStore'
import { getSampleXml } from '@/samples'
import { BUILT_IN_TEMPLATES } from '@/samples/templates'
import { useToastStore } from '@/store/toastStore'
import {
  deleteUserTemplate,
  listUserTemplates,
  saveUserTemplate,
  type UserTemplate
} from '@/api/ipc'

const TABS: Array<{ id: LeftTab; icon: typeof LayoutTemplate; label: string }> = [
  { id: 'templates', icon: LayoutTemplate, label: 'Şablonlar' },
  { id: 'elements', icon: Shapes, label: 'Eleman Paleti' }
]

interface PaletteItem {
  id: string
  icon: LucideIcon
  label: string
  html: string
}

const PALETTE: PaletteItem[] = [
  {
    id: 'text',
    icon: Type,
    label: 'Metin Kutusu',
    html: '<div style="padding:4px 2px;"><p style="margin:0;font-size:12px;">Yeni metin — çift tıklayıp düzenleyin</p></div>'
  },
  {
    id: 'heading',
    icon: Heading1,
    label: 'Başlık',
    html: '<h2 style="margin:8px 0;font-size:16px;color:#0d9488;">Bölüm Başlığı</h2>'
  },
  {
    id: 'line',
    icon: Minus,
    label: 'Çizgi',
    html: '<hr style="border:none;border-top:1px solid #9aa4b2;margin:10px 0;"/>'
  },
  {
    id: 'image',
    icon: ImageIcon,
    label: 'Görsel Alanı',
    html: '<div style="text-align:center;padding:6px;"><img src="" alt="G&#246;rsel" width="140" height="90" style="object-fit:contain;"/></div>'
  },
  {
    id: 'table',
    icon: TableIcon,
    label: 'Tablo',
    html: '<table style="width:100%;border-collapse:collapse;font-size:11px;"><tr><th style="border:1px solid #cbd5e1;padding:4px;">Kolon A</th><th style="border:1px solid #cbd5e1;padding:4px;">Kolon B</th><th style="border:1px solid #cbd5e1;padding:4px;">Kolon C</th></tr><tr><td style="border:1px solid #e2e8f0;padding:4px;">&#160;</td><td style="border:1px solid #e2e8f0;padding:4px;">&#160;</td><td style="border:1px solid #e2e8f0;padding:4px;">&#160;</td></tr></table>'
  }
]

export function LeftRail(): React.JSX.Element {
  const leftTab = useUiStore((s) => s.leftTab)
  const setLeftTab = useUiStore((s) => s.setLeftTab)
  const uiDocType = useUiStore((s) => s.docType)
  const hasDocument = useEditorStore((s) => s.hasDocument)
  const editorDocType = useEditorStore((s) => s.docType)
  const docType = hasDocument ? editorDocType : uiDocType
  const [userTpls, setUserTpls] = useState<UserTemplate[]>([])
  const [saveName, setSaveName] = useState('')

  const refreshUserTpls = useCallback(async (): Promise<void> => {
    setUserTpls(await listUserTemplates())
  }, [])

  useEffect(() => {
    if (leftTab === 'templates') void refreshUserTpls()
  }, [leftTab, refreshUserTpls])

  const loadTemplate = (templateId: string): void => {
    const tpl = BUILT_IN_TEMPLATES[docType].find((t) => t.id === templateId)
    if (!tpl) return
    useEditorStore.getState().loadDocument(getSampleXml(docType), tpl.xslt, docType)
  }

  const loadUserTpl = (tpl: UserTemplate): void => {
    const s = useEditorStore.getState()
    if (!s.hasDocument) {
      useToastStore.getState().push('Önce hazır bir şablonla belge açın.', 'error')
      return
    }
    s.setXslt(tpl.content)
    useToastStore.getState().push(`"${tpl.name}" uygulandı.`)
  }

  const saveCurrentAsTemplate = async (): Promise<void> => {
    const { xslt, hasDocument } = useEditorStore.getState()
    if (!hasDocument || !xslt.trim()) {
      useToastStore.getState().push('Kaydedilecek tasarım yok.', 'error')
      return
    }
    const ok = await saveUserTemplate(saveName.trim() || 'Tasarim', xslt)
    if (ok) {
      setSaveName('')
      void refreshUserTpls()
    }
  }

  const removeUserTpl = async (fileName: string): Promise<void> => {
    await deleteUserTemplate(fileName)
    void refreshUserTpls()
  }

  const insertPalette = (item: PaletteItem): void => {
    const { xslt, hasDocument, setXslt } = useEditorStore.getState()
    if (!hasDocument) {
      useToastStore.getState().push('Önce bir şablon yükleyin.', 'error')
      return
    }
    const marker = `uni-i${Date.now()}`
    setXslt(appendBlockToPage(xslt, item.html, marker))
    usePreviewStore.setState({ pendingSelectMarker: marker })
    useToastStore.getState().push(
      `${item.label} eklendi — sürükleyerek taşıyın, ok tuşlarıyla ince ayar yapın.`
    )
  }

  return (
    <nav className="flex shrink-0 border-r border-edge bg-panel">
      <div className="flex w-12 flex-col items-center gap-1 py-3">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            onClick={() => setLeftTab(leftTab === id ? null : id)}
            className={`rail-btn ${leftTab === id ? 'is-active' : ''}`}
          >
            <Icon size={18} strokeWidth={1.7} />
          </button>
        ))}
      </div>

      {leftTab !== null && (
        <aside className="w-60 border-r border-edge bg-panel-2 p-3">
          {leftTab === 'templates' && (
            <>
              <p className="micro-label mb-3">{DOC_TYPE_LABELS[docType]} Şablonları</p>
              <div className="flex flex-col gap-1.5">
                {BUILT_IN_TEMPLATES[docType].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => loadTemplate(tpl.id)}
                    title={tpl.description}
                    className="template-row"
                  >
                    <span className="font-semibold">{tpl.name}</span>
                    <span className="text-secondary text-[10.5px] font-medium">
                      {tpl.description}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 border-t border-edge pt-3">
                <p className="micro-label mb-2">Kütüphanem</p>
                <div className="mb-2 flex gap-1">
                  <input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Şablon adı"
                    className="min-w-0 flex-1 rounded-md border border-edge bg-panel px-2 py-1.5 text-[11.5px] outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={saveCurrentAsTemplate}
                    title="Mevcut tasarımı kaydet"
                    className="rounded-md border border-edge px-2 text-[11px] font-semibold text-accent-strong hover:border-accent"
                  >
                    +
                  </button>
                </div>
                {userTpls.length === 0 ? (
                  <p className="text-secondary text-[10.5px] leading-relaxed opacity-70">
                    Henüz kayıtlı şablon yok. Tasarımınızı yukarıdaki alana ad vererek
                    saklayın.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {userTpls.map((tpl) => (
                      <div key={tpl.fileName} className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => loadUserTpl(tpl)}
                          className="template-row min-w-0 flex-1"
                          title={tpl.content.slice(0, 120)}
                        >
                          <span className="truncate font-semibold">{tpl.name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeUserTpl(tpl.fileName)}
                          title="Sil"
                          className="icon-btn h-7 w-7 shrink-0 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {leftTab === 'elements' && (
            <>
              <p className="micro-label mb-3">Tasarıma Ekle</p>
              <div className="grid grid-cols-1 gap-1.5">
                {PALETTE.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => insertPalette(item)}
                    className="template-row flex-row items-center gap-2"
                  >
                    <item.icon size={15} className="text-accent shrink-0" />
                    <span className="font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-secondary mt-3 text-[10.5px] leading-relaxed">
                Eklenen öğeler sayfanın sonuna gelir; sürükleyerek yeniden sıralayın.
              </p>
            </>
          )}
        </aside>
      )}
    </nav>
  )
}
