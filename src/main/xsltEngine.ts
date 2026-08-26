/**
 * XSLT motoru (ana süreç):
 * - Derleme: xslt3 CLI (XSLT 1.0/2.0/3.0 → SEF JSON), içerik özetine göre önbellekli
 * - Çalıştırma: saxon-js (SEF + kaynak XML → HTML dizisi)
 * Tamamen yereldir; hiçbir veri dışarı çıkmaz.
 */
import { app } from 'electron'
import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import SaxonJS from 'saxon-js'

const sefCache = new Map<string, string>()
const MAX_CACHE = 12

function hashOf(text: string): string {
  return createHash('sha1').update(text).digest('hex').slice(0, 20)
}

/**
 * GİB tarzı şablonlar `method="html" version="4.0"` + HTML4 doctype bildirir;
 * SaxonJS serileştirici yalnızca HTML5 destekler. Derleme öncesi çıktı
 * bildirimini normalize eder (belge içeriği değişmez, sadece serileştirme).
 */
export function normalizeOutputDeclaration(xslt: string): string {
  return xslt.replace(/<xsl:output\s[^>]*>/gi, (tag) => {
    if (!/method\s*=\s*["']html["']/i.test(tag)) return tag
    return tag
      .replace(/\s(doctype-public|doctype-system)="[^"]*"/gi, '')
      .replace(/\sversion="[^"]*"/i, ' version="5.0"')
  })
}

function xslt3CliPath(): string {
  const base = app.getAppPath()
  const root = base.replace(/app\.asar$/, 'app.asar.unpacked')
  return join(root, 'node_modules', 'xslt3', 'xslt3.js')
}

interface CompileResult {
  sef?: string
  stderr?: string
}

async function compileToSef(xsltText: string): Promise<CompileResult> {
  const normalized = normalizeOutputDeclaration(xsltText)
  const hash = hashOf(normalized)
  const cached = sefCache.get(hash)
  if (cached) return { sef: cached }

  const dir = join(app.getPath('temp'), 'uni-xslt')
  await fs.mkdir(dir, { recursive: true })
  const inPath = join(dir, `in-${hash}.xslt`)
  const outPath = join(dir, `out-${hash}.json`)
  await fs.writeFile(inPath, normalized, 'utf-8')

  return await new Promise<CompileResult>((resolve) => {
    const child = spawn(
      process.execPath,
      [xslt3CliPath(), `-xsl:${inPath}`, `-export:${outPath}`, '-nogo'],
      {
        env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
        windowsHide: true
      }
    )

    let stderr = ''
    const killer = setTimeout(() => child.kill('SIGKILL'), 60000)

    child.stderr.on('data', (d) => {
      stderr += String(d)
    })
    child.on('error', (err) => {
      clearTimeout(killer)
      resolve({ stderr: `Derleyici başlatılamadı: ${err.message}` })
    })
    child.on('exit', async (code) => {
      clearTimeout(killer)
      if (code !== 0) {
        resolve({ stderr: stderr.slice(-800) || `Derleyici kod=${code} ile çıktı` })
        return
      }
      try {
        const sef = await fs.readFile(outPath, 'utf-8')
        if (sefCache.size >= MAX_CACHE) {
          const first = sefCache.keys().next().value
          if (first !== undefined) sefCache.delete(first)
        }
        sefCache.set(hash, sef)
        void fs.unlink(inPath).catch(() => {})
        void fs.unlink(outPath).catch(() => {})
        resolve({ sef })
      } catch (err) {
        resolve({ stderr: `SEF okunamadı: ${String(err)}` })
      }
    })
  })
}

export interface RenderResult {
  html?: string
  error?: string
}

export async function renderXslt(xsltText: string, xmlText: string): Promise<RenderResult> {
  try {
    const compiled = await compileToSef(xsltText)
    if (!compiled.sef) {
      return { error: compiled.stderr ?? 'Derleme başarısız' }
    }
    const res = SaxonJS.transform(
      { stylesheetText: compiled.sef, sourceText: xmlText, destination: 'serialized' },
      'sync'
    )
    const html = (res.principalResult as string | undefined) ?? ''
    if (!html) return { error: 'Dönüşüm boş sonuç üretti' }
    return { html }
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    return { error: msg.slice(0, 500) }
  }
}
