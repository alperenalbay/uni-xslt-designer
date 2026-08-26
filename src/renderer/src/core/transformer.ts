import { validateDocumentPair, type ValidationIssue } from './validation'
import { injectXsltIds, XSLT_ID_ATTR, XSLT_NS, type XsltIdMeta } from './xsltId'
import { uniApi } from '@/api/ipc'

/**
 * XSLT dönüşüm hattı.
 * Birincil motor: ana süreçte SaxonJS (XSLT 1.0/2.0/3.0 — GİB şablonlarıyla uyumlu).
 * Yedek motor: tarayıcı-içi XSLTProcessor (yalnızca 1.0).
 * Tüm işlem yereldir; hiçbir veri dışarı gönderilmez.
 */

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
])

export interface TransformResult {
  ok: boolean
  html: string
  issues: ValidationIssue[]
  /** İçinde xsl:* talimatı bulunan öğeler — statik düzenleme yasak */
  dynamicIds: string[]
  /** id → kaynak arama imzası (kod-satırı eşitleme) */
  meta: Record<string, XsltIdMeta>
}

/** Boş olmayan ama kendinden-kapanan yazılmış HTML etiketlerini açar (<div/> → <div></div>). */
export function expandNonVoidSelfClosing(html: string): string {
  return html.replace(
    /<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^<>]*?)?)\/>/g,
    (full, tag: string, attrs: string) => {
      const lower = tag.toLowerCase()
      if (VOID_ELEMENTS.has(lower)) return full
      return `<${tag}${attrs}></${tag}>`
    }
  )
}

/** <script> bloklarının içindeki XML kaçışlarını geri çözer (JS'in bozulmaması için). */
export function unescapeScriptBlocks(html: string): string {
  return html.replace(
    /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi,
    (_m, open: string, body: string, close: string) => {
      const restored = body
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
      return `${open}${restored}${close}`
    }
  )
}

function ensureDoctype(html: string): string {
  if (/<!doctype/i.test(html.slice(0, 300))) return html
  return `<!DOCTYPE html>\n${html}`
}

function collectDynamicIds(doc: Document): string[] {
  const ids: string[] = []
  doc.querySelectorAll(`[${XSLT_ID_ATTR}]`).forEach((el) => {
    const descendants = el.getElementsByTagName('*')
    for (const d of descendants) {
      if (d.namespaceURI === XSLT_NS) {
        ids.push(el.getAttribute(XSLT_ID_ATTR) ?? '')
        break
      }
    }
  })
  return ids
}

/** Yedek: tarayıcı-içi XSLT 1.0 işlemcisi. */
function transformNative(xmlDoc: Document, stylesheet: Document): string {
  const processor = new XSLTProcessor()
  processor.importStylesheet(stylesheet)
  const resultDoc = processor.transformToDocument(xmlDoc)
  if (!resultDoc?.documentElement) throw new Error('boş sonuç')
  let html = new XMLSerializer().serializeToString(resultDoc)
  html = expandNonVoidSelfClosing(html)
  html = unescapeScriptBlocks(html)
  return ensureDoctype(html)
}

export async function transformXmlWithXslt(
  xmlSrc: string,
  xsltSrc: string
): Promise<TransformResult> {
  const EMPTY: TransformResult = { ok: false, html: '', issues: [], dynamicIds: [], meta: {} }

  const issues = validateDocumentPair(xmlSrc, xsltSrc)
  if (xmlSrc.trim() === '' || xsltSrc.trim() === '') return EMPTY
  if (issues.some((i) => i.level === 'error')) return { ...EMPTY, issues }

  const injected = injectXsltIds(xsltSrc)
  if (!injected) {
    return { ...EMPTY, issues: [...issues, { level: 'error', message: 'XSLT ayrıştırılamadı.' }] }
  }
  const dynamicIds = collectDynamicIds(injected.doc)
  const meta = injected.meta

  const xmlDoc = new DOMParser().parseFromString(xmlSrc, 'application/xml')
  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    return { ...EMPTY, issues: [...issues, { level: 'error', message: 'XML ayrıştırılamadı.' }] }
  }

  // 1) Birincil motor: ana süreçte SaxonJS
  if (uniApi) {
    const res = await uniApi.renderXslt(injected.serialized, xmlSrc)
    if (res.html) {
      let html = expandNonVoidSelfClosing(res.html)
      html = unescapeScriptBlocks(html)
      html = ensureDoctype(html)
      return { ok: true, html, issues, dynamicIds, meta }
    }
    // Saxon başarısız → 1.0 şablonlarsa yerel motor kurtarabilir
    try {
      const html = transformNative(xmlDoc, injected.doc)
      return {
        ok: true,
        html,
        issues: [
          ...issues,
          { level: 'warn', message: `SaxonJS motoru başarısız, yerel 1.0 motoru kullanıldı: ${res.error?.slice(0, 120) ?? ''}` }
        ],
        dynamicIds,
        meta
      }
    } catch {
      return {
        ...EMPTY,
        issues: [...issues, { level: 'error', message: `Dönüşüm hatası: ${res.error ?? 'bilinmeyen'}` }]
      }
    }
  }

  // 2) Masaüstü köprüsü yok (web geliştirme) → doğrudan yerel motor
  try {
    const html = transformNative(xmlDoc, injected.doc)
    return { ok: true, html, issues, dynamicIds, meta }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      ...EMPTY,
      issues: [...issues, { level: 'error', message: `Dönüşüm hatası: ${message}` }]
    }
  }
}
