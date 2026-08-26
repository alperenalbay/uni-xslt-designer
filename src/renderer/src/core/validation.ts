import { detectDocTypeFromXslt, detectDocTypeFromXml, type DetectedDocType } from './docTypes'

export interface ValidationIssue {
  level: 'error' | 'warn'
  message: string
}

interface ParseErrorInfo {
  line?: number
  message: string
}

/** XML/XSLT metnini ayrıştırıp sözdizimi hatalarını toplar. */
export function parseWithIssues(src: string, label: string): ParseErrorInfo[] {
  if (!src.trim()) return []

  const doc = new DOMParser().parseFromString(src, 'application/xml')
  const errEl = doc.getElementsByTagName('parsererror')[0]
  if (!errEl) return []

  const raw = errEl.textContent ?? 'Bilinmeyen ayrıştırma hatası'
  const posMatch = raw.match(/@?\s*(?:line|satır)\s*:?\s*(\d+)/i)
  const clean = raw.split(/\n\s*@?/)[0]?.trim() ?? raw

  const info: ParseErrorInfo = { message: `${label}: ${clean}` }
  if (posMatch) info.line = Number(posMatch[1])
  return [info]
}

export interface SyntaxReport {
  ok: boolean
  issues: ValidationIssue[]
}

/** Tek bir kaynağın sözdizimi denetimi. */
export function validateSyntax(src: string, label: 'XML' | 'XSLT'): SyntaxReport {
  if (!src.trim()) {
    return { ok: false, issues: [{ level: 'error', message: `${label} içeriği boş.` }] }
  }
  const issues = parseWithIssues(src, label).map(
    (p): ValidationIssue => ({ level: 'error', message: p.message })
  )
  return { ok: issues.length === 0, issues }
}

/**
 * XML verisi ile XSLT şablonunun belge türü uyuşmazlığını denetler.
 * Örn: e-İrsaliye şablonu + e-Fatura verisi = kullanıcıyı uyaran uyarı.
 */
export function checkTypeMismatch(
  xmlType: DetectedDocType,
  xsltType: DetectedDocType
): ValidationIssue | null {
  if (xmlType === 'bilinmiyor' || xsltType === 'bilinmiyor') return null
  if (xmlType === xsltType) return null

  const label: Record<Exclude<DetectedDocType, 'bilinmiyor'>, string> = {
    fatura: 'e-Fatura',
    arsiv: 'e-Arşiv',
    irsaliye: 'e-İrsaliye'
  }

  return {
    level: 'warn',
    message: `Tür uyuşmazlığı: ${label[xsltType]} şablonu ${label[xmlType]} verisiyle dönüştürülüyor.`
  }
}

/** Tam doğrulama: her iki kaynak için sözdizimi + tür eşleşmesi. */
export function validateDocumentPair(xml: string, xslt: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [
    ...parseWithIssues(xml, 'XML').map((p): ValidationIssue => ({ level: 'error', message: p.message })),
    ...parseWithIssues(xslt, 'XSLT').map((p): ValidationIssue => ({ level: 'error', message: p.message }))
  ]

  if (issues.length === 0) {
    const mismatch = checkTypeMismatch(detectDocTypeFromXml(xml), detectDocTypeFromXslt(xslt))
    if (mismatch) issues.push(mismatch)
  }

  return issues
}
