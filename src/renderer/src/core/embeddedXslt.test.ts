import { describe, expect, it } from 'vitest'
import { extractEmbeddedXslt } from './embeddedXslt'

const XSLT_B64 = Buffer.from(
  '<?xml version="1.0"?><xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><xsl:template match="/"><html><body>GOEMULU</body></html></xsl:template></xsl:stylesheet>'
).toString('base64')

const XML_WITH_EMBED = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ProfileID>EARSIVFATURA</cbc:ProfileID>
  <cac:AdditionalDocumentReference>
    <cbc:ID>EARSIV_PORTAL_FATURA_XSLT</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="application/xslt+xml" encoding="Base64">${XSLT_B64}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
</Invoice>`

describe('extractEmbeddedXslt', () => {
  it('base64 gömülü XSLT çıkarır ve etiketi okur', () => {
    const res = extractEmbeddedXslt(XML_WITH_EMBED)
    expect(res).not.toBeNull()
    expect(res!.label).toContain('XSLT')
    expect(res!.content).toContain('<xsl:stylesheet')
    expect(res!.content).toContain('GOEMULU')
  })

  it('gömülü tasarım yoksa null döner', () => {
    expect(extractEmbeddedXslt('<Invoice><cbc:ProfileID>TEMELFATURA</cbc:ProfileID></Invoice>')).toBeNull()
    expect(extractEmbeddedXslt('bozuk xml <<<')).toBeNull()
  })
})
