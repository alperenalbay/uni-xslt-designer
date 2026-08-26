import { describe, expect, it } from 'vitest'
import { injectXsltIds, stripXsltIds, XSLT_ID_ATTR } from './xsltId'
import { checkTypeMismatch, parseWithIssues, validateSyntax } from './validation'

const SAMPLE_XSLT = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html"/>
  <xsl:template match="/">
    <html>
      <body>
        <h1>Fatura</h1>
        <table><tr><td>Toplam</td></tr></table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`

describe('injectXsltIds', () => {
  it('sonuç elemanlarına sıralı kimlik atar, xsl: talimatlarını atlar', () => {
    const res = injectXsltIds(SAMPLE_XSLT)
    expect(res).not.toBeNull()
    expect(res!.count).toBeGreaterThan(0)

    const ids = Array.from(res!.doc.querySelectorAll(`[${XSLT_ID_ATTR}]`)).map((el) =>
      el.getAttribute(XSLT_ID_ATTR)
    )
    // h1 ve table gibi literal çıktılar kimlik almalı
    expect(ids).toContain('1')
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('idempotenttir: tekrar enjeksiyon kimlik sayısını değiştirmez', () => {
    const first = injectXsltIds(SAMPLE_XSLT)!
    const second = injectXsltIds(first.serialized)!
    expect(second.count).toBe(first.count)
  })
})

describe('stripXsltIds', () => {
  it('tüm kimlikleri temizler', () => {
    const injected = injectXsltIds(SAMPLE_XSLT)!
    const stripped = stripXsltIds(injected.serialized)
    expect(stripped.includes('data-xslt-id')).toBe(false)
  })
})

describe('parseWithIssues', () => {
  it('geçerli XML için sorun bulamaz', () => {
    expect(parseWithIssues('<a><b/></a>', 'XML')).toHaveLength(0)
  })

  it('bozuk XML için hata üretir', () => {
    const issues = parseWithIssues('<a><b></a>', 'XML')
    expect(issues).toHaveLength(1)
    expect(issues[0].message.startsWith('XML:')).toBe(true)
  })
})

describe('validateSyntax', () => {
  it('boş içeriği hata olarak raporlar', () => {
    const rep = validateSyntax('   ', 'XSLT')
    expect(rep.ok).toBe(false)
  })
})

describe('checkTypeMismatch', () => {
  it('fatura xml + irsaliye şablonu için uyarı üretir', () => {
    const issue = checkTypeMismatch('fatura', 'irsaliye')
    expect(issue?.level).toBe('warn')
    expect(issue?.message).toContain('uyuşmazlığı')
  })

  it('eşleşen türlerde uyarı üretmez', () => {
    expect(checkTypeMismatch('fatura', 'fatura')).toBeNull()
    expect(checkTypeMismatch('bilinmiyor', 'fatura')).toBeNull()
  })
})
