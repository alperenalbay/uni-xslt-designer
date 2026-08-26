import type { ElectronAPI } from '@electron-toolkit/preload'

export interface OpenResult {
  path?: string
  name?: string
  content?: string
  error?: string
}
export interface SaveResult {
  ok?: boolean
  path?: string
  canceled?: boolean
  fileName?: string
  error?: string
}

export interface UniApi {
  platform: NodeJS.Platform
  openFile(opts: { title?: string; extensions: string[] }): Promise<OpenResult | null>
  saveFile(opts: {
    defaultName: string
    content: string
    title?: string
    extensions: string[]
  }): Promise<SaveResult | null>
  listTemplates(): Promise<Array<{ fileName: string; name: string; content: string }>>
  saveTemplate(p: { name: string; content: string }): Promise<SaveResult>
  deleteTemplate(p: { fileName: string }): Promise<SaveResult>
  exportPdf(html: string): Promise<SaveResult>
  renderXslt(xslt: string, xml: string): Promise<{ html?: string; error?: string }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    uniApi: UniApi
  }
}

export {}
