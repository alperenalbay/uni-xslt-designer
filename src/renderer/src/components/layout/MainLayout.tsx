import { useEffect, type ReactNode } from 'react'
import { redoEditor, undoEditor, useEditorStore } from '@/store/editorStore'
import { useUiStore } from '@/store/uiStore'
import { ToastContainer } from '@/components/common/ToastContainer'
import { TemplatePickerModal } from '@/components/common/TemplatePickerModal'
import { EmbedBanner } from '@/components/designer/EmbedBanner'
import { TopBar } from './TopBar'
import { LeftRail } from './LeftRail'
import { RightDock } from './RightDock'
import { StatusBar } from './StatusBar'

/** Global klavye kısayolları (Monaco/input odakları hariç). */
function useShortcuts(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const t = e.target as HTMLElement | null
      if (
        t &&
        (t.isContentEditable ||
          t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.closest('.monaco-editor'))
      ) {
        return
      }
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return

      if (e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redoEditor()
        else undoEditor()
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redoEditor()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export function MainLayout({ children }: { children: ReactNode }): React.JSX.Element {
  const theme = useUiStore((s) => s.theme)
  const hasDocument = useEditorStore((s) => s.hasDocument)
  useShortcuts()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar />
      <EmbedBanner />
      <div className="flex min-h-0 flex-1">
        {hasDocument && <LeftRail />}
        <main className="atelier-canvas relative min-w-0 flex-1">{children}</main>
        {hasDocument && <RightDock />}
      </div>
      <StatusBar />
      <ToastContainer />
      <TemplatePickerModal />
    </div>
  )
}
