import type { DocType } from '@/store/uiStore'
import { ARSIV_XML } from './arsivXml'
import { FATURA_XML } from './faturaXml'
import { IRSALIYE_XML } from './irsaliyeXml'

/** Her belge türü için eşleşen örnek UBL verisi. */
export function getSampleXml(docType: DocType): string {
  switch (docType) {
    case 'arsiv':
      return ARSIV_XML
    case 'irsaliye':
      return IRSALIYE_XML
    default:
      return FATURA_XML
  }
}
