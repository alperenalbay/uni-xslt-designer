import { describe, expect, it } from 'vitest'
import { detectDocTypeFromXml, detectDocTypeFromXslt } from './docTypes'

const INVOICE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:ProfileID>TEMELFATURA</cbc:ProfileID>
  <cbc:ID>ABC123</cbc:ID>
</Invoice>`

const ARCHIVE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:ProfileID>EARSIVFATURA</cbc:ProfileID>
  <cbc:ID>XYZ789</cbc:ID>
</Invoice>`

const DESPATCH_XML = `<?xml version="1.0" encoding="UTF-8"?>
<DespatchAdvice xmlns="urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2">
  <cbc:ProfileID>TEMELIRSALIYE</cbc:ProfileID>
</DespatchAdvice>`

describe('detectDocTypeFromXml', () => {
  it('e-Fatura verisini tanır', () => {
    expect(detectDocTypeFromXml(INVOICE_XML)).toBe('fatura')
  })

  it('EARSIVFATURA profiliyle e-Arşiv tanır', () => {
    expect(detectDocTypeFromXml(ARCHIVE_XML)).toBe('arsiv')
  })

  it('DespatchAdvice kökü ile e-İrsaliye tanır', () => {
    expect(detectDocTypeFromXml(DESPATCH_XML)).toBe('irsaliye')
  })

  it('boş veya ilgisiz içerikte bilinmiyor döner', () => {
    expect(detectDocTypeFromXml('')).toBe('bilinmiyor')
    expect(detectDocTypeFromXml('<root/>')).toBe('bilinmiyor')
  })
})

describe('detectDocTypeFromXslt', () => {
  it('irsaliye şablonunu DespatchAdvice ipuçlarından tanır', () => {
    const xslt = '<xsl:template match="/"><span>DespatchAdvice</span></xsl:template>'
    expect(detectDocTypeFromXslt(xslt)).toBe('irsaliye')
  })

  it('fatura şablonunu tanır', () => {
    const xslt = '<xsl:template match="/"><h1>Fatura No</h1></xsl:template>'
    expect(detectDocTypeFromXslt(xslt)).toBe('fatura')
  })

  it('belirsiz şablonda bilinmiyor döner', () => {
    expect(detectDocTypeFromXslt('<html><body>x</body></html>')).toBe('bilinmiyor')
  })
})
