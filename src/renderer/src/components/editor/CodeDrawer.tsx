import Editor, { type Monaco, type OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { setMonacoEditor } from './monacoRef'
import { useEditorStore } from '@/store/editorStore'
import { usePreviewStore } from '@/store/previewStore'
import { useUiStore } from '@/store/uiStore'

const handleMount: OnMount = (ed: editor.IStandaloneCodeEditor) => {
  setMonacoEditor(ed)
  ed.onDidDispose(() => setMonacoEditor(null))
}

function defineAtelierThemes(monaco: Monaco): void {
  monaco.editor.defineTheme('atelier-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [{ token: 'comment', foreground: '5a6472', fontStyle: 'italic' }],
    colors: {
      'editor.background': '#111417',
      'editor.lineHighlightBackground': '#191e25',
      'editorLineNumber.foreground': '#39414c',
      'editorLineNumber.activeForeground': '#14b8a6',
      'editorCursor.foreground': '#14b8a6',
      'editor.selectionBackground': '#14403b'
    }
  })
  monaco.editor.defineTheme('atelier-light', {
    base: 'vs',
    inherit: true,
    rules: [{ token: 'comment', foreground: '8a94a2', fontStyle: 'italic' }],
    colors: {
      'editor.background': '#faf9f7',
      'editor.lineHighlightBackground': '#f1efe9',
      'editorLineNumber.foreground': '#b8b2a6',
      'editorLineNumber.activeForeground': '#0d9488',
      'editorCursor.foreground': '#0d9488',
      'editor.selectionBackground': '#c9ebe6'
    }
  })
}

const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 11.5,
  fontFamily: "'JetBrains Mono', monospace",
  lineNumbersMinChars: 3,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  padding: { top: 8, bottom: 8 },
  renderLineHighlightOnlyWhenFocus: true,
  overviewRulerLanes: 0,
  scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
  folding: true,
  tabSize: 2
}

export function CodeDrawer(): React.JSX.Element | null {
  const activeTab = useUiStore((s) => s.activeCodeTab)
  const theme = useUiStore((s) => s.theme)
  const xml = useEditorStore((s) => s.xml)
  const xslt = useEditorStore((s) => s.xslt)
  const setXml = useEditorStore((s) => s.setXml)
  const setXslt = useEditorStore((s) => s.setXslt)
  const html = usePreviewStore((s) => s.html)

  if (activeTab === 'html') {
    return (
      <Editor
        key="html"
        language="html"
        theme={theme === 'dark' ? 'atelier-dark' : 'atelier-light'}
        value={html}
        beforeMount={defineAtelierThemes}
        onMount={handleMount}
        options={{ ...EDITOR_OPTIONS, readOnly: true }}
        className="h-full w-full"
      />
    )
  }

  const isXslt = activeTab === 'xslt'
  return (
    <Editor
      key={isXslt ? 'xslt' : 'xml'}
      language="xml"
      theme={theme === 'dark' ? 'atelier-dark' : 'atelier-light'}
      value={isXslt ? xslt : xml}
      onChange={(v) => (isXslt ? setXslt(v ?? '') : setXml(v ?? ''))}
      beforeMount={defineAtelierThemes}
      onMount={handleMount}
      options={EDITOR_OPTIONS}
      className="h-full w-full"
    />
  )
}
