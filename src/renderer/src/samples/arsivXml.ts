/** e-Arşiv Fatura örnek verisi — UBL-TR 1.2 (EARSIVFATURA profili). Hayali verilerdir. */
export const ARSIV_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>EARSIVFATURA</cbc:ProfileID>
  <cbc:ID>GIB2026000000005678</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:UUID>c2b9e4f1-05aa-4d38-b7c2-91f6de0a4b83</cbc:UUID>
  <cbc:IssueDate>2026-08-25</cbc:IssueDate>
  <cbc:IssueTime>14:05:00.000Z</cbc:IssueTime>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:Note>E-Arşiv fatura örneğidir.</cbc:Note>
  <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
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
      <cac:PartyTaxScheme><cbc:TaxScheme><cbc:Name>Maliye</cbc:Name></cbc:TaxScheme></cac:PartyTaxScheme>
      <cac:Contact><cbc:Telephone>+90 216 000 00 00</cbc:Telephone><cbc:ElectronicMail>billing@devatek.example</cbc:ElectronicMail></cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification><cbc:ID schemeID="VKN">1122334455</cbc:ID></cac:PartyIdentification>
      <cac:PartyName><cbc:Name>AYŞE YILMAZ</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Sahil Yolu</cbc:StreetName>
        <cbc:BuildingNumber>7</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>Kadıköy</cbc:CitySubdivisionName>
        <cbc:City>İstanbul</cbc:City>
        <cbc:PostalZone>34710</cbc:PostalZone>
        <cac:Country><cbc:Name>Türkiye</cbc:Name></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme><cbc:TaxScheme><cbc:Name>Maliye</cbc:Name></cbc:TaxScheme></cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="TRY">360.00</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="TRY">1800.00</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="TRY">360.00</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:Percent>20.00</cbc:Percent>
        <cac:TaxScheme><cbc:Name>KDV</cbc:Name></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="TRY">1800.00</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="TRY">1800.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="TRY">2160.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="TRY">2160.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">1.00</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">1800.00</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>Kablosuz Kulaklık ANC Max</cbc:Name>
    </cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="TRY">1800.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`
