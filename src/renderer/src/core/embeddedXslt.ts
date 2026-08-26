/**
 * XML içine base64 ile gömülü tasarım (XSLT/HTML) tespiti.
 * GİB portal indirmelerinde AdditionalDocumentReference altındaki
 * EmbeddedDocumentBinaryObject alanlarında bulunur.
 */

export interface EmbeddedDesign {
  label: string
  content: string
}

function looksLikeDesign(text: string): boolean {
  return /<xsl:stylesheet[\s>]/i.test(text) || /<html[\s>]/i.test(text)
}

function base64DecodeUtf8(raw: string): string | null {
  try {
    const bin = atob(raw)
    try {
      return decodeURIComponent(escape(bin))
    } catch {
      return bin
    }
  } catch {
    return null
  }
}

function findLabel(el: Element): string {
  let p: Element | null = el.parentElement
  while (p) {
    for (const c of Array.from(p.children)) {
      const name = (c.localName ?? c.tagName).toUpperCase()
      if (name === 'ID') {
        const txt = c.textContent?.trim()
        if (txt) return txt
      }
    }
    p = p.parentElement
  }
  return 'Gömülü Tasarım'
}

/** XML'deki ilk anlamlı gömülü tasarımı döndürür; yoksa null. */
export function extractEmbeddedXslt(xmlSrc: string): EmbeddedDesign | null {
  let doc: Document
  try {
    doc = new DOMParser().parseFromString(xmlSrc, 'application/xml')
    if (doc.getElementsByTagName('parsererror').length > 0) return null
  } catch {
    return null
  }

  const containers = Array.from(doc.getElementsByTagName('*')).filter(
    (el) => /EmbeddedDocumentBinaryObject$/i.test(el.localName ?? '')
  )

  let weak: EmbeddedDesign | null = null
  for (const el of containers) {
    const raw = (el.textContent ?? '').replace(/\s+/g, '')
    if (raw.length < 64) continue
    const decoded = base64DecodeUtf8(raw)
    if (!decoded || !looksLikeDesign(decoded)) continue

    const label = findLabel(el)
    const strong = /<xsl:stylesheet[\s>]/i.test(decoded) || /xslt/i.test(label)
    const item: EmbeddedDesign = { label, content: decoded }
    if (strong) return item
    weak ??= item
  }
  return weak
}
