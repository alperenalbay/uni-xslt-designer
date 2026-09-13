import type { DocType } from '@/store/uiStore'

export type DetectedDocType = DocType | 'bilinmiyor'

const DESPATCH_HINTS = [
  'despatchadvice',
  'despatchline',
  'despatchsupplierparty',
  'deliverycustomerparty',
  'actualdespatchdate',
  'shipmentstage'
]

const ARCHIVE_PROFILE_HINTS = ['EARSIVFATURA', 'E_ARSIV', 'EARŞİV', 'E-ARSIV']
const IRSALIYE_PROFILE_HINTS = ['TEMELIRSALIYE', 'IRSALIYE', 'IRSALIYE', 'DESPATCH']

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s
}

/**
 * XML içeriğinden belge türünü algılar — DOMParser öncelikli, string fallback.
 * - Kök eleman DespatchAdvice ise e-İrsaliye
 * - Invoice + EARSIVFATURA profili ise e-Arşiv
 * - Invoice ise e-Fatura
 * - ProfileID içinde IRSALIYE geçiyorsa e-İrsaliye (hatalı kök durumunu kurtarır)
 */
export function detectDocTypeFromXml(xml: string): DetectedDocType {
  const raw = stripBom(xml)
  if (!raw.trim()) return 'bilinmiyor'

  // 1) DOMParser ile kök eleman tespiti — en güvenilir
  try {
    const doc = new DOMParser().parseFromString(raw, 'application/xml')
    const parserErr = doc.getElementsByTagName('parsererror')[0]
    if (!parserErr && doc.documentElement) {
      const local = (doc.documentElement.localName ?? doc.documentElement.tagName).toLowerCase()
      if (local === 'despatchadvice') return 'irsaliye'
      if (local === 'invoice') {
        const profileEl =
          doc.getElementsByTagName('cbc:ProfileID')[0] ?? doc.getElementsByTagName('ProfileID')[0]
        const profile = (profileEl?.textContent ?? '').toUpperCase()
        if (profile) {
          if (IRSALIYE_PROFILE_HINTS.some((h) => profile.includes(h))) return 'irsaliye'
          if (ARCHIVE_PROFILE_HINTS.some((h) => profile.includes(h))) return 'arsiv'
        }
        return 'fatura'
      }
      // Bilinmeyen kök — despatch ipuçları var mı diye devam et
    }
  } catch {
    /* DOMParser hatası -> string fallback */
  }

  const lower = raw.toLowerCase()
  // İrsaliye ipuçları — case-insensitive, tüm dokümanda ara
  if (DESPATCH_HINTS.some((h) => lower.includes(h))) return 'irsaliye'
  if (/<\s*despatchadvice[\s>]/i.test(raw)) return 'irsaliye'

  const profileMatch = raw.match(/<\s*(?:cbc:)?ProfileID\s*>([^<]*)</i)
  const profile = (profileMatch?.[1] ?? '').toUpperCase()
  if (profile) {
    if (IRSALIYE_PROFILE_HINTS.some((h) => profile.includes(h))) return 'irsaliye'
    if (ARCHIVE_PROFILE_HINTS.some((h) => profile.includes(h))) return 'arsiv'
  }

  if (/<\s*invoice[\s>]/i.test(raw)) return 'fatura'

  return 'bilinmiyor'
}

/** XSLT şablonunun hedeflediği belge türünü tahmin eder — case-insensitive. */
export function detectDocTypeFromXslt(xslt: string): DetectedDocType {
  const raw = stripBom(xslt)
  if (!raw.trim()) return 'bilinmiyor'
  // 'İ'.toLowerCase() → 'i̇' (i + birleşen nokta) olur ve 'e-arşiv' ipucunu kaçırır;
  // normalize et ki 'E-ARŞİV' başlıklı şablonlar e-Arşiv tanınsın.
  const lower = raw.toLowerCase().replace(/i̇/g, 'i')
  if (DESPATCH_HINTS.some((h) => lower.includes(h))) return 'irsaliye'

  const archiveHints = ['earsivfatura', 'e-arşiv', 'e-arsiv']
  if (archiveHints.some((h) => lower.includes(h))) return 'arsiv'

  if (/invoice|fatura no/i.test(raw)) return 'fatura'

  return 'bilinmiyor'
}
