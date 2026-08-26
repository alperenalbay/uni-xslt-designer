import { MainLayout } from '@/components/layout/MainLayout'
import { LandingScreen } from '@/components/landing/LandingScreen'
import { PreviewCanvas } from '@/components/preview/PreviewCanvas'
import { useTransform } from '@/hooks/useTransform'
import { useAutosave } from '@/hooks/useAutosave'
import { useEditorStore } from '@/store/editorStore'

function App(): React.JSX.Element {
  useTransform()
  useAutosave()
  const hasDocument = useEditorStore((s) => s.hasDocument)

  return <MainLayout>{hasDocument ? <PreviewCanvas /> : <LandingScreen />}</MainLayout>
}

export default App
