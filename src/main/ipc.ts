import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { promises as fs } from 'node:fs'
import { join, basename } from 'node:path'
import { renderXslt } from './xsltEngine'

function templatesDir(): string {
  const dir = join(app.getPath('userData'), 'templates')
  void fs.mkdir(dir, { recursive: true }).catch(() => {})
  return dir
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ_\-\s]/g, '').trim().replace(/\s+/g, '_') || 'Sablon'
}

function registerFileIpc(getWin: () => BrowserWindow | null): void {
  ipcMain.handle('file:open', async (_e, opts: { title?: string; extensions: string[] }) => {
    const win = getWin()
    if (!win) return null
    const res = await dialog.showOpenDialog(win, {
      title: opts.title ?? 'Dosya Aç',
      properties: ['openFile'],
      filters: [{ name: 'Belgeler', extensions: opts.extensions }]
    })
    if (res.canceled || res.filePaths.length === 0) return null
    const p = res.filePaths[0]
    try {
      const content = await fs.readFile(p, 'utf-8')
      return { path: p, name: basename(p), content }
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle(
    'file:save',
    async (
      _e,
      opts: { defaultName: string; content: string; title?: string; extensions: string[] }
    ) => {
      const win = getWin()
      if (!win) return null
      const res = await dialog.showSaveDialog(win, {
        title: opts.title ?? 'Farklı Kaydet',
        defaultPath: opts.defaultName,
        filters: [{ name: 'Belgeler', extensions: opts.extensions }]
      })
      if (res.canceled || !res.filePath) return null
      try {
        await fs.writeFile(res.filePath, opts.content, 'utf-8')
        return { path: res.filePath }
      } catch (err) {
        return { error: String(err) }
      }
    }
  )
}

function registerTemplateIpc(): void {
  ipcMain.handle('template:list', async () => {
    try {
      const dir = templatesDir()
      const files = await fs.readdir(dir)
      const out = []
      for (const f of files) {
        if (!f.toLowerCase().endsWith('.xslt')) continue
        const content = await fs.readFile(join(dir, f), 'utf-8')
        out.push({ fileName: f, name: f.replace(/\.xslt$/i, ''), content })
      }
      return out
    } catch {
      return []
    }
  })

  ipcMain.handle('template:save', async (_e, p: { name: string; content: string }) => {
    try {
      const dir = templatesDir()
      const file = `${safeName(p.name)}.xslt`
      await fs.writeFile(join(dir, file), p.content, 'utf-8')
      return { ok: true, fileName: file }
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle('template:delete', async (_e, p: { fileName: string }) => {
    try {
      const safe = basename(p.fileName)
      await fs.unlink(join(templatesDir(), safe))
      return { ok: true }
    } catch (err) {
      return { error: String(err) }
    }
  })
}

function registerPdfIpc(getWin: () => BrowserWindow | null): void {
  ipcMain.handle('pdf:export', async (_e, html: string) => {
    const tmp = join(app.getPath('temp'), `uni-pdf-${Date.now()}.html`)
    await fs.writeFile(tmp, html, 'utf-8')
    let pdfWin: BrowserWindow | null = null
    try {
      pdfWin = new BrowserWindow({ show: false, webPreferences: { sandbox: true } })
      await pdfWin.loadFile(tmp)
      const buf = await pdfWin.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        preferCSSPageSize: false
      })
      const win = getWin()
      const res = win
        ? await dialog.showSaveDialog(win, {
            title: "PDF olarak Kaydet",
            defaultPath: 'tasarim.pdf',
            filters: [{ name: 'PDF', extensions: ['pdf'] }]
          })
        : null
      if (!res || res.canceled || !res.filePath) return { canceled: true }
      await fs.writeFile(res.filePath, buf)
      return { ok: true, path: res.filePath }
    } catch (err) {
      return { error: String(err) }
    } finally {
      pdfWin?.destroy()
      void fs.unlink(tmp).catch(() => {})
    }
  })
}

function registerXsltIpc(): void {
  ipcMain.handle('xslt:render', (_e, p: { xslt: string; xml: string }) =>
    renderXslt(p.xslt, p.xml)
  )
}

export function registerAllIpc(getWin: () => BrowserWindow | null): void {
  registerFileIpc(getWin)
  registerTemplateIpc()
  registerPdfIpc(getWin)
  registerXsltIpc()
}
