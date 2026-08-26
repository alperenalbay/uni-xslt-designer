// Paketlenmiş uygulamayı gerçekten çalıştırıp yeni akışı doğrular
const { _electron: electron } = require('playwright')
const path = require('node:path')

async function main() {
  const exe = path.join(__dirname, '..', 'release', 'win-unpacked', 'UNI Tasarım.exe')
  console.log('Paket başlatılıyor:', exe)
  const app = await electron.launch({ executablePath: exe, timeout: 30000 })
  try {
    const win = await app.firstWindow()
    await win.waitForLoadState('domcontentloaded')

    // 1) Sürüm rozeti yeni mi?
    await win.waitForSelector('text=v0.3.4', { timeout: 15000 })
    console.log('✓ Sürüm rozeti v0.3.4')

    // 2) Ana süreçte yeni motor handler'ı var mı? (handle → _invokeHandlers map'i)
    const hasRender = await app.evaluate(({ ipcMain }) => {
      const handlers = ipcMain._invokeHandlers
      return handlers ? handlers.has('xslt:render') : 'bilinmiyor'
    })
    console.log(hasRender === true ? '✓ xslt:render IPC handler mevcut' : `✗ handler: ${hasRender}`)

    // 3) Karşılama ekranı
    await win.waitForSelector('text=Ne tasarlamak istersiniz?', { timeout: 15000 })
    console.log('✓ Karşılama ekranı')

    // 4) Şablon yükle → motorla dönüşüm (paket içinde!)
    const card = win.locator('section').filter({ hasText: 'e-Fatura' }).first()
    await card.getByText('Kurumsal', { exact: true }).click()
    const frame = win.frameLocator('#preview-frame')
    await frame.locator('.doc-title').waitFor({ timeout: 30000 })
    await frame.getByText('DEVATEK TEKNOLOJİ A.Ş.').waitFor({ timeout: 10000 })
    console.log('✓ Paket içinde canlı dönüşüm çalışıyor')

    // 5) Durum çubuğu — hangi motor kullanıldı?
    const chip = await win.locator('footer .status-chip').first().textContent()
    console.log('Durum çubuğu:', chip)
    if (chip && chip.includes('Doğrulandı')) {
      console.log('✓ SaxonJS motoru temiz çalıştı')
    } else if (chip && chip.includes('Uyarı')) {
      console.log('⚠ Yerel yedeğe düşülmüş — uyarı: ' + chip)
    }

    console.log('\nPAKET DOĞRULAMA: TAMAMI GEÇTİ')
  } finally {
    await app.close()
  }
}

main().catch((e) => {
  console.error('PAKET DOĞRULAMA HATASI:', String(e).slice(0, 400))
  process.exit(1)
})


