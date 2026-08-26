import { useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { CodeDrawer } from '@/components/editor/CodeDrawer'
import { revealXsltLine, setMonacoEditor } from '@/components/editor/monacoRef'
import { PropertiesPanel } from '@/components/designer/PropertiesPanel'
import { findLineByMeta } from '@/core/codeSync'
import type { CodeTab } from '@/store/uiStore'
import { useUiStore } from '@/store/uiStore'
import { useEditorStore } from '@/store/editorStore'
import { usePreviewStore } from '@/store/previewStore'

const CODE_TABS: Array<{ id: CodeTab; label: string }> = [
  { id: 'xslt', label: 'XSLT' },
  { id: 'xml', label: 'XML Verisi' },
  { id: 'html', label: 'HTML Çıktısı' }
]

/** Seçili öğeyi XSLT kaynağındaki satırına eşitler (imza özellik). */
function useCodeSync(): void {
  const selectedId = useEditorStore((s) => s.selectedXsltId)
  const meta = usePreviewStore((s) => s.meta)
  const setActiveCodeTab = useUiStore((s) => s.setActiveCodeTab)

  useEffect(() => {
    if (!selectedId) return
    const m = meta[selectedId]
    if (!m) return
    const loc = findLineByMeta(useEditorStore.getState().xslt, m)
    if (loc) {
      setActiveCodeTab('xslt')
      // Monaco'nun mount olması için tek kare beklet
      window.setTimeout(() => revealXsltLine(loc.line), 60)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])
}

export function RightDock(): React.JSX.Element {
  useCodeSync()

  const codeDrawerOpen = useUiStore((s) => s.codeDrawerOpen)
  const setCodeDrawerOpen = useUiStore((s) => s.setCodeDrawerOpen)
  const activeCodeTab = useUiStore((s) => s.activeCodeTab)
  const setActiveCodeTab = useUiStore((s) => s.setActiveCodeTab)

  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-l border-edge bg-panel">
      <section className="min-h-0 flex-1 overflow-y-auto p-3">
        <p className="micro-label mb-3">Özellikler</p>
        <PropertiesPanelOrHint />
      </section>

      <section className="flex h-[42%] min-h-0 flex-col border-t border-edge">
        <div className="flex h-9 shrink-0 items-center gap-1 border-b border-edge px-2">
          <button
            type="button"
            aria-label={codeDrawerOpen ? 'Kod çekmecesini kapat' : 'Kod çekmecesini aç'}
            onClick={() => setCodeDrawerOpen(!codeDrawerOpen)}
            className="icon-btn"
          >
            {codeDrawerOpen ? (
              <ChevronDown size={15} strokeWidth={1.8} />
            ) : (
              <ChevronRight size={15} strokeWidth={1.8} />
            )}
          </button>
          <div className="flex items-center gap-0.5">
            {CODE_TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveCodeTab(id)}
                className={`drawer-tab ${
                  activeCodeTab === id && codeDrawerOpen ? 'is-active' : ''
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {codeDrawerOpen && (
          <div className="min-h-0 flex-1 overflow-hidden">
            <CodeDrawer />
          </div>
        )}
      </section>
    </aside>
  )
}

function PropertiesPanelOrHint(): React.JSX.Element {
  const hasSelection = useEditorStore((s) => s.selectedXsltId !== null)
  if (!hasSelection) {
    return (
      <div className="empty-hint">
        Önizlemede bir öğeye tıklayın — yazı, renk ve hizalama kontrolleri burada açılır.
      </div>
    )
  }
  return <PropertiesPanel />
}

// CodeDrawer mount olduğunda monaco örneğini eşitlemek için yardımcı export
export { setMonacoEditor }
