/**
 * Hazır XSLT şablon fabrikaları.
 * Bölümler body altında ayrı kardeş bloklar halinde tasarlanmıştır ki
 * WYSIWYG modunda sürükleyerek yeniden sıralanabilsinler.
 */

const CAC = 'xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"'
const CBC = 'xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"'

const BASE_STYLE = `
    * { box-sizing: border-box; }
    body { margin: 0; background: #eef0f3; font-family: 'Segoe UI', Arial, sans-serif; color: #1c2733; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 14mm 13mm; background: #fff; }
    .accent-bar { height: 6px; background: #0d9488; border-radius: 3px; margin-bottom: 18px; }
    .doc-title { font-size: 22px; letter-spacing: 2px; color: #0d9488; margin: 0 0 4px 0; }
    .muted { color: #66707d; font-size: 11px; }
    .kv-table { border-collapse: collapse; font-size: 11px; }
    .kv-table td { padding: 2px 8px; vertical-align: top; }
    .kv-label { color: #7a8494; white-space: nowrap; }
    .kv-value { font-weight: 600; }
    .party-box { flex: 1; border: 1px solid #dde3ea; border-radius: 8px; padding: 10px 12px; font-size: 11.5px; }
    .party-box h3 { margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #0d9488; }
    .items { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
    .items th { background: #0d9488; color: #fff; text-align: left; padding: 7px 9px; font-weight: 600; }
    .items td { border-bottom: 1px solid #e5eaf0; padding: 6px 9px; }
    .items tr:nth-child(even) td { background: #f7fafc; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .totals-wrap { display: flex; justify-content: flex-end; margin-top: 14px; }
    .totals { width: 70mm; border-collapse: collapse; font-size: 11.5px; }
    .totals td { padding: 4px 8px; }
    .totals .grand td { border-top: 2px solid #0d9488; font-weight: 700; font-size: 13px; color: #0d9488; }
    .signatures { display: flex; gap: 24mm; margin-top: 26mm; }
    .sig { flex: 1; text-align: center; font-size: 11px; color: #55606e; }
    .sig-line { border-bottom: 1px dotted #98a2b0; height: 18mm; margin-bottom: 6px; }`

function headerBlock(docTitle: string): string {
  return `      <div class="doc-header">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="display:flex; gap:12px; align-items:center;">
            <img src="" alt="Logo" width="64" height="64" style="border-radius:8px; object-fit:contain;" data-role="logo"/>
            <div>
              <h1 class="doc-title">${docTitle}</h1>
              <div class="muted">e-Dönüşüm Belgesi · UBL-TR 1.2</div>
            </div>
          </div>
          <table class="kv-table">
            <tr><td class="kv-label">Belge No</td><td class="kv-value"><xsl:value-of select="/*/cbc:ID"/></td></tr>
            <tr><td class="kv-label">Tarih</td><td><xsl:value-of select="/*/cbc:IssueDate"/></td></tr>
            <tr><td class="kv-label">UUID</td><td class="muted"><xsl:value-of select="/*/cbc:UUID"/></td></tr>
          </table>
        </div>
      </div>`
}

function partyBoxes(sellerTitle: string, buyerTitle: string, buyerPath: string): string {
  return `      <div class="parties" style="display:flex; gap:10px; margin-top:14px;">
        <div class="party-box">
          <h3>${sellerTitle}</h3>
          <div style="font-weight:700;"><xsl:value-of select="/*/cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/></div>
          <div><xsl:value-of select="/*/cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:StreetName"/> No:<xsl:value-of select="/*/cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:BuildingNumber"/></div>
          <div><xsl:value-of select="/*/cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:CitySubdivisionName"/> / <xsl:value-of select="/*/cac:AccountingSupplierParty/cac:Party/cac:PostalAddress/cbc:City"/></div>
          <div class="muted">VKN: <xsl:value-of select="/*/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID"/></div>
        </div>
        <div class="party-box">
          <h3>${buyerTitle}</h3>
          <div style="font-weight:700;"><xsl:value-of select="${buyerPath}/cac:PartyName/cbc:Name"/></div>
          <div><xsl:value-of select="${buyerPath}/cac:PostalAddress/cbc:StreetName"/> No:<xsl:value-of select="${buyerPath}/cac:PostalAddress/cbc:BuildingNumber"/></div>
          <div><xsl:value-of select="${buyerPath}/cac:PostalAddress/cbc:CitySubdivisionName"/> / <xsl:value-of select="${buyerPath}/cac:PostalAddress/cbc:City"/></div>
          <div class="muted">VKN: <xsl:value-of select="${buyerPath}/cac:PartyIdentification/cbc:ID"/></div>
        </div>
      </div>`
}

function invoiceLinesBlock(): string {
  return `      <table class="items">
        <thead>
          <tr>
            <th style="width:8mm;">#</th>
            <th>Ürün / Hizmet</th>
            <th style="width:20mm;">Miktar</th>
            <th style="width:25mm;">Birim Fiyat</th>
            <th style="width:28mm;">Tutar</th>
          </tr>
        </thead>
        <tbody>
          <xsl:for-each select="/*/cac:InvoiceLine">
            <tr>
              <td><xsl:value-of select="cbc:ID"/></td>
              <td><xsl:value-of select="cac:Item/cbc:Name"/></td>
              <td class="num"><xsl:value-of select="cbc:InvoicedQuantity"/> <xsl:value-of select="cbc:InvoicedQuantity/@unitCode"/></td>
              <td class="num"><xsl:value-of select="cac:Price/cbc:PriceAmount"/></td>
              <td class="num"><xsl:value-of select="cbc:LineExtensionAmount"/></td>
            </tr>
          </xsl:for-each>
        </tbody>
      </table>`
}

function despatchLinesBlock(): string {
  return `      <table class="items">
        <thead>
          <tr>
            <th style="width:8mm;">#</th>
            <th>Mal / Hizmet</th>
            <th style="width:22mm;">Sevk Miktarı</th>
          </tr>
        </thead>
        <tbody>
          <xsl:for-each select="/*/cac:DespatchLine">
            <tr>
              <td><xsl:value-of select="cbc:ID"/></td>
              <td><xsl:value-of select="cac:Item/cbc:Name"/></td>
              <td class="num"><xsl:value-of select="cbc:DeliveredQuantity"/> <xsl:value-of select="cbc:DeliveredQuantity/@unitCode"/></td>
            </tr>
          </xsl:for-each>
        </tbody>
      </table>`
}

function totalsBlock(): string {
  return `      <div class="totals-wrap">
        <table class="totals">
          <tr>
            <td class="kv-label">Mal/Hizmet Toplamı</td>
            <td class="num"><xsl:value-of select="/*/cac:LegalMonetaryTotal/cbc:LineExtensionAmount"/></td>
          </tr>
          <tr>
            <td class="kv-label">KDV (<xsl:value-of select="/*/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:Percent"/>)</td>
            <td class="num"><xsl:value-of select="/*/cac:TaxTotal/cbc:TaxAmount"/></td>
          </tr>
          <tr class="grand">
            <td>Genel Toplam</td>
            <td class="num"><xsl:value-of select="/*/cac:LegalMonetaryTotal/cbc:PayableAmount"/></td>
          </tr>
        </table>
      </div>`
}

function shipmentInfoBlock(): string {
  return `      <table class="kv-table" style="margin-top:14px;">
        <tr>
          <td class="kv-label">Araç / Sevkiyat No</td>
          <td class="kv-value"><xsl:value-of select="/*/cac:Shipment/cbc:ID"/></td>
          <td class="kv-label">Taşıyıcı</td>
          <td class="kv-value"><xsl:value-of select="/*/cac:Shipment/cac:ShipmentStage/cac:CarrierParty/cac:PartyName/cbc:Name"/></td>
        </tr>
        <tr>
          <td class="kv-label">Sürücü</td>
          <td class="kv-value"><xsl:value-of select="/*/cac:Shipment/cac:ShipmentStage/cac:DriverPerson/cbc:FirstName"/> <xsl:value-of select="/*/cac:Shipment/cac:ShipmentStage/cac:DriverPerson/cbc:FamilyName"/></td>
          <td class="kv-label">Taşıma Şekli</td>
          <td class="kv-value"><xsl:value-of select="/*/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode"/></td>
        </tr>
      </table>`
}

function footerBlock(): string {
  return `      <div class="doc-footer">
        <p class="muted" style="margin-top:10px;"><xsl:value-of select="/*/cbc:Note"/></p>
        <div class="signatures">
          <div class="sig"><div class="sig-line"></div>Teslim Eden</div>
          <div class="sig"><div class="sig-line"></div>Teslim Alan</div>
        </div>
      </div>`
}

function wrapDocument(bodyInner: string, style: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  ${CAC} ${CBC}>
  <xsl:output method="html" indent="yes"/>
  <xsl:template match="/">
    <html lang="tr">
      <head>
        <meta charset="utf-8"/>
        <style>${style}
    </style>
      </head>
      <body>
        <div class="page">
${bodyInner}
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`
}

/** Kurumsal fatura/e-arşiv tasarımı. */
export function makeCorporateInvoice(docTitle: string): string {
  const inner = [
    '<div class="accent-bar"></div>',
    headerBlock(docTitle),
    partyBoxes('Satıcı', 'Alıcı', '/*/cac:AccountingCustomerParty/cac:Party'),
    invoiceLinesBlock(),
    totalsBlock(),
    footerBlock()
  ].join('\n')
  return wrapDocument(inner, BASE_STYLE)
}

/** Kurumsal irsaliye tasarımı. */
export function makeCorporateDespatch(docTitle: string): string {
  const inner = [
    '<div class="accent-bar"></div>',
    headerBlock(docTitle),
    partyBoxes(
      'Sevk Eden',
      'Teslim Alan',
      '/*/cac:DeliveryCustomerParty/cac:Party'
    ),
    shipmentInfoBlock(),
    despatchLinesBlock(),
    footerBlock()
  ].join('\n')
  return wrapDocument(inner, BASE_STYLE)
}

/** Sade fatura/e-arşiv tasarımı. */
export function makeSimpleInvoice(docTitle: string): string {
  const style = `
    body { margin:0; font-family: Arial, sans-serif; color:#222; }
    .page { width:210mm; min-height:297mm; margin:0 auto; padding:15mm; }
    h1 { font-size:18px; border-bottom:2px solid #333; padding-bottom:6px; }
    table { border-collapse:collapse; width:100%; font-size:12px; margin-top:10px; }
    th, td { border:1px solid #999; padding:5px 7px; text-align:left; }
    th { background:#f0f0f0; }
    .num { text-align:right; }
    .grand { font-weight:bold; }`
  const inner = `        <h1>${docTitle}</h1>
        <table>
          <tr><th>Belge No</th><td><xsl:value-of select="/*/cbc:ID"/></td><th>Tarih</th><td><xsl:value-of select="/*/cbc:IssueDate"/></td></tr>
          <tr><th>Satıcı</th><td colspan="3"><xsl:value-of select="/*/cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/></td></tr>
          <tr><th>Alıcı</th><td colspan="3"><xsl:value-of select="/*/cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/></td></tr>
        </table>
${invoiceLinesBlock()}
${totalsBlock()}`
  return wrapDocument(inner, style)
}

/** Sade irsaliye tasarımı. */
export function makeSimpleDespatch(docTitle: string): string {
  const style = `
    body { margin:0; font-family: Arial, sans-serif; color:#222; }
    .page { width:210mm; min-height:297mm; margin:0 auto; padding:15mm; }
    h1 { font-size:18px; border-bottom:2px solid #333; padding-bottom:6px; }
    table { border-collapse:collapse; width:100%; font-size:12px; margin-top:10px; }
    th, td { border:1px solid #999; padding:5px 7px; text-align:left; }
    th { background:#f0f0f0; }`
  const inner = `        <h1>${docTitle}</h1>
        <table>
          <tr><th>İrsaliye No</th><td><xsl:value-of select="/*/cbc:ID"/></td><th>Tarih</th><td><xsl:value-of select="/*/cbc:IssueDate"/></td></tr>
          <tr><th>Sevk Eden</th><td><xsl:value-of select="/*/cac:DespatchSupplierParty/cac:Party/cac:PartyName/cbc:Name"/></td><th>Teslim Alan</th><td><xsl:value-of select="/*/cac:DeliveryCustomerParty/cac:Party/cac:PartyName/cbc:Name"/></td></tr>
        </table>
${despatchLinesBlock()}`
  return wrapDocument(inner, style)
}

/** Boş tasarım iskeleti — kullanıcıya başlangıç noktası. */
export function makeBlank(docTitle: string): string {
  const inner = `        <!-- Tasarımınızı buraya kurun. Sol bölümleri çoğaltabilir,
             sağdaki özellik paneliyle biçimlendirebilirsiniz. -->
        <div data-role="baslik">
          <h1 style="font-family:Arial;">${docTitle}</h1>
        </div>
        <div data-role="icerik" style="min-height:120mm; border:1px dashed #bbb;"></div>`
  return wrapDocument(inner, '')
}
