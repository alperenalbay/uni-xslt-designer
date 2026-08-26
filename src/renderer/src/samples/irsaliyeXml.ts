/** e-İrsaliye örnek verisi — UBL-TR 1.2 DespatchAdvice (TEMELIRSALIYE). Hayali verilerdir. */
export const IRSALIYE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<DespatchAdvice xmlns="urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2"
                xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
                xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>TEMELIRSALIYE</cbc:ProfileID>
  <cbc:ID>IRS2026000000000987</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:UUID>41d7a0f6-9c2b-4e15-88ad-6b03fa7c52e1</cbc:UUID>
  <cbc:IssueDate>2026-08-25</cbc:IssueDate>
  <cbc:IssueTime>09:15:00.000Z</cbc:IssueTime>
  <cbc:Note>Mal teslim edilirken hasar kontrolü yapılmalıdır.</cbc:Note>
  <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
  <cac:OrderReference><cbc:ID>ORDER-2026-00412</cbc:ID></cac:OrderReference>
  <cac:DespatchSupplierParty>
    <cac:Party>
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
      <cac:Contact><cbc:Telephone>+90 216 000 00 00</cbc:Telephone></cac:Contact>
    </cac:Party>
  </cac:DespatchSupplierParty>
  <cac:DeliveryCustomerParty>
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
      <cac:Contact><cbc:Telephone>+90 312 000 00 00</cbc:Telephone></cac:Contact>
    </cac:Party>
  </cac:DeliveryCustomerParty>
  <cac:Shipment>
    <cbc:ID>SHP-00931</cbc:ID>
    <cbc:GoodsItemCount>2</cbc:GoodsItemCount>
    <cac:ShipmentStage>
      <cbc:ID>1</cbc:ID>
      <cbc:TransportModeCode>Road</cbc:TransportModeCode>
      <cac:CarrierParty>
        <cac:PartyIdentification><cbc:ID schemeID="VKN">5554443332</cbc:ID></cac:PartyIdentification>
        <cac:PartyName><cbc:Name>HIZLI LOJİSTİK TAŞIMACILIK A.Ş.</cbc:Name></cac:PartyName>
      </cac:CarrierParty>
      <cac:DriverPerson>
        <cbc:FirstName>Mehmet</cbc:FirstName>
        <cbc:FamilyName>Demir</cbc:FamilyName>
        <cbc:Title>Sürücü</cbc:Title>
      </cac:DriverPerson>
    </cac:ShipmentStage>
    <cac:TransportHandlingUnit>
      <cbc:ID>PALET-001</cbc:ID>
    </cac:TransportHandlingUnit>
  </cac:Shipment>
  <cac:DespatchLine>
    <cbc:ID>1</cbc:ID>
    <cbc:DeliveredQuantity unitCode="C62">2.00</cbc:DeliveredQuantity>
    <cac:OrderLineReference><cbc:LineID>1</cbc:LineID></cac:OrderLineReference>
    <cac:Item><cbc:Name>LaserJet Kurumsal Yazıcı</cbc:Name></cac:Item>
  </cac:DespatchLine>
  <cac:DespatchLine>
    <cbc:ID>2</cbc:ID>
    <cbc:DeliveredQuantity unitCode="C62">10.00</cbc:DeliveredQuantity>
    <cac:OrderLineReference><cbc:LineID>2</cbc:LineID></cac:OrderLineReference>
    <cac:Item><cbc:Name>Ofis Koltuğu Ergonomik Pro</cbc:Name></cac:Item>
  </cac:DespatchLine>
</DespatchAdvice>`
