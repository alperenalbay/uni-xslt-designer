/** Monaco editor örneğine global erişim (kod-satırı eşitleme için). */
import type { editor } from 'monaco-editor'

let instance: editor.IStandaloneCodeEditor | null = null

export function setMonacoEditor(ed: editor.IStandaloneCodeEditor | null): void {
  instance = ed
}

export function revealXsltLine(line: number): void {
  if (!instance) return
  instance.revealLineInCenter(line)
  instance.setPosition({ lineNumber: line, column: 1 })
}
