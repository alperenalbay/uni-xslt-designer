import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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

const api = {
  platform: process.platform,
  openFile: (opts: { title?: string; extensions: string[] }): Promise<OpenResult | null> =>
    ipcRenderer.invoke('file:open', opts),
  saveFile: (opts: {
    defaultName: string
    content: string
    title?: string
    extensions: string[]
  }): Promise<SaveResult | null> => ipcRenderer.invoke('file:save', opts),
  listTemplates: (): Promise<Array<{ fileName: string; name: string; content: string }>> =>
    ipcRenderer.invoke('template:list'),
  saveTemplate: (p: {
    name: string
    content: string
  }): Promise<SaveResult> => ipcRenderer.invoke('template:save', p),
  deleteTemplate: (p: { fileName: string }): Promise<SaveResult> =>
    ipcRenderer.invoke('template:delete', p),
  exportPdf: (html: string): Promise<SaveResult> => ipcRenderer.invoke('pdf:export', html),
  renderXslt: (xslt: string, xml: string): Promise<{ html?: string; error?: string }> =>
    ipcRenderer.invoke('xslt:render', { xslt, xml })
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('uniApi', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).uniApi = api
}
