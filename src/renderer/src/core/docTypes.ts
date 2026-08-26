import type { DocType } from '@/store/uiStore'

export type DetectedDocType = DocType | 'bilinmiyor'

const DESPATCH_HINTS = [
  'DespatchAdvice',
  'DespatchLine',
  'DespatchSupplierParty',
  'DeliveryCustomerParty',
  'ActualDespatchDate',
  'ShipmentStage'
]

const ARCHIVE_PROFILE_HINTS = ['EARSIVFATURA', 'E_ARSIV', 'EARŞİV']

/**
 * XML içeriğinden belge türünü algılar.
 * - Kök eleman DespatchAdvice ise e-İrsaliye
 * - Invoice + EARSIVFATURA profili ise e-Arşiv
 * - Invoice ise e-Fatura
 */
export function detectDocTypeFromXml(xml: string): DetectedDocType {
  if (!xml.trim()) return 'bilinmiyor'

  const head = xml.slice(0, 4000)
  if (DESPATCH_HINTS.some((h) => head.includes(h))) return 'irsaliye'
  if (/<\s*DespatchAdvice[\s>]/.test(xml)) return 'irsaliye'
  if (!/<\s*Invoice[\s>]/.test(xml)) return 'bilinmiyor'

  const profileMatch = xml.match(/<\s*(?:cbc:)?ProfileID\s*>([^<]*)</)
  const profile = (profileMatch?.[1] ?? '').toUpperCase()
  if (ARCHIVE_PROFILE_HINTS.some((h) => profile.includes(h))) return 'arsiv'

  return 'fatura'
}

/** XSLT şablonunun hedeflediği belge türünü tahmin eder. */
export function detectDocTypeFromXslt(xslt: string): DetectedDocType {
  if (!xslt.trim()) return 'bilinmiyor'
  if (DESPATCH_HINTS.some((h) => xslt.includes(h))) return 'irsaliye'

  const archiveHints = ['EARSIVFATURA', 'e-Arşiv', 'E-Arşiv']
  if (archiveHints.some((h) => xslt.includes(h))) return 'arsiv'

  if (/Invoice|FATURA No|Fatura No/i.test(xslt)) return 'fatura'

  return 'bilinmiyor'
}
