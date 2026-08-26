/** e-Fatura örnek verisi — UBL-TR 1.2 (TEMELFATURA profili). Hayali verilerdir. */
export const FATURA_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>TEMELFATURA</cbc:ProfileID>
  <cbc:ID>GIB2026000000001234</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:UUID>8f4a1c2e-77d3-4b5a-9c01-3e6f8a2b7d90</cbc:UUID>
  <cbc:IssueDate>2026-08-25</cbc:IssueDate>
  <cbc:IssueTime>10:30:00.000Z</cbc:IssueTime>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:Note>İyi iş birliği dileğiyle.</cbc:Note>
  <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
  <cac:AdditionalDocumentReference>
    <cbc:ID>ORDER-2026-00412</cbc:ID>
    <cbc:IssueDate>2026-08-18</cbc:IssueDate>
    <cac:Attachment><cac:ExternalReference/></cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:WebsiteURI>https://www.devatek.example</cbc:WebsiteURI>
      <cac:PartyIdentification><cbc:ID schemeID="VKN">1234567890</cbc:ID></cac:PartyIdentification>
      <cac:PartyName><cbc:Name>DEVATEK TEKNOLOJİ A.Ş.</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Teknopark Bulvarı</cbc:StreetName>
        <cbc:BuildingNumber>12</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>Pendik</cbc:CitySubdivisionName>
        <cbc:City>İstanbul</cbc:City>
        <cbc:PostalZone>34906</cbc:PostalZone>
        <cac:Country><cbc:Name>Türkiye</cbc:Name></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:TaxScheme><cbc:Name>Maliye</cbc:Name></cbc:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:Contact><cbc:Telephone>+90 216 000 00 00</cbc:Telephone><cbc:ElectronicMail>billing@devatek.example</cbc:ElectronicMail></cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification><cbc:ID schemeID="VKN">9876543210</cbc:ID></cac:PartyIdentification>
      <cac:PartyName><cbc:Name>ÖRNEK TİCARET LTD. ŞTİ.</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Cumhuriyet Caddesi</cbc:StreetName>
        <cbc:BuildingNumber>45</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>Kavaklıdere</cbc:CitySubdivisionName>
        <cbc:City>Ankara</cbc:City>
        <cbc:PostalZone>06680</cbc:PostalZone>
        <cac:Country><cbc:Name>Türkiye</cbc:Name></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme><cbc:TaxScheme><cbc:Name>Maliye</cbc:Name></cbc:TaxScheme></cac:PartyTaxScheme>
      <cac:Contact><cbc:Telephone>+90 312 000 00 00</cbc:Telephone><cbc:ElectronicMail>muhasebe@ornekticaret.example</cbc:ElectronicMail></cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>48</cbc:PaymentMeansCode>
    <cbc:PaymentDueDate>2026-09-09</cbc:PaymentDueDate>
  </cac:PaymentMeans>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="TRY">4460.00</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="TRY">22300.00</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="TRY">4460.00</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:Percent>20.00</cbc:Percent>
        <cac:TaxScheme><cbc:Name>KDV</cbc:Name></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="TRY">22300.00</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="TRY">22300.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="TRY">26760.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="TRY">26760.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">2.00</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">14000.00</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>LaserJet Kurumsal Yazıcı</cbc:Name>
    </cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="TRY">7000.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
  <cac:InvoiceLine>
    <cbc:ID>2</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">10.00</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">6000.00</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>Ofis Koltuğu Ergonomik Pro</cbc:Name>
    </cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="TRY">600.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
  <cac:InvoiceLine>
    <cbc:ID>3</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">5.00</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">2300.00</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>Akıllı LED Masa Lambası</cbc:Name>
    </cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="TRY">460.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`
