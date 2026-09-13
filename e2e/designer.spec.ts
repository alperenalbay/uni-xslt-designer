import { expect, test } from '@playwright/test'

async function loadKurumsalFatura(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/')
  const card = page.locator('section').filter({ hasText: 'e-Fatura' }).first()
  await card.getByText('Şablonları Gör').click()
  await page.locator('button.template-row').filter({ hasText: 'Kurumsal' }).first().click()
  await expect(page.frameLocator('#preview-frame').locator('.doc-title')).toBeVisible()
}

test('öğe seçimi: tıkla-seç halkası ve özellik paneli', async ({ page }) => {
  await loadKurumsalFatura(page)
  const frame = page.frameLocator('#preview-frame')

  await frame.locator('.doc-title').click()
  await expect(frame.locator('.doc-title.uni-selected')).toBeVisible()
  await expect(page.locator('aside').getByText('<h1>', { exact: false })).toBeVisible()
})

test("kalın butonu stili XSLT'ye yazar ve önizlemeye yansır", async ({ page }) => {
  await loadKurumsalFatura(page)
  const frame = page.frameLocator('#preview-frame')

  await frame.locator('.doc-title').click()
  await expect(frame.locator('.doc-title.uni-selected')).toBeVisible()

  await page.getByTitle('Kalın').click()

  // yeniden dönüşüm sonrası stil uygulanmış olmalı
  await expect(frame.locator('.doc-title')).toHaveCSS('font-weight', '700', {
    timeout: 10000
  })
})

test("çift tıkla metin düzenleme XSLT'ye yazılır", async ({ page }) => {
  await loadKurumsalFatura(page)
  const frame = page.frameLocator('#preview-frame')
  const title = frame.locator('.doc-title')

  await title.click()
  await title.dblclick()
  await expect(title).toHaveAttribute('contenteditable', /true/i)

  await page.keyboard.press('Control+a')
  await page.keyboard.type('ÖZEL BAŞLIK ALANI')
  await page.keyboard.press('Tab')

  await expect(title).toHaveText(/ÖZEL BAŞLIK ALANI/, { timeout: 10000 })
})

test('Delete ile öğe silme ve Ctrl+Z ile geri alma', async ({ page }) => {
  await loadKurumsalFatura(page)
  const frame = page.frameLocator('#preview-frame')

  const note = frame.locator('p.muted').first()
  await expect(note).toBeVisible()
  await note.click()
  await expect(note).toHaveClass(/uni-selected/, { timeout: 5000 })

  await page.getByTitle('Sil (Delete)').click()
  await expect(frame.locator('p.muted')).toHaveCount(0, { timeout: 10000 })

  await page.keyboard.press('Control+z')
  await expect(frame.locator('p.muted').first()).toBeVisible({ timeout: 10000 })
})

test("Alt+sürükle ile bölüm sırası değiştirme XSLT'ye yansır", async ({ page }) => {
  await loadKurumsalFatura(page)
  const frame = page.frameLocator('#preview-frame')

  const orderBefore = await frame
    .locator('.page > *')
    .evaluateAll((els) => els.map((e) => e.className))

  const totals = await frame.locator('.totals-wrap').boundingBox()
  const items = await frame.locator('table.items').boundingBox()
  expect(totals).toBeTruthy()
  expect(items).toBeTruthy()

  // wrapper'ın kendisini hedeflemek için dispatchEvent kullanılır (içi tablo dolu)
  await frame.locator('.totals-wrap').dispatchEvent('mousedown', {
    button: 0,
    clientX: totals!.x + 60,
    clientY: totals!.y + totals!.height / 2
  })
  await page.mouse.move(items!.x + items!.width / 2, items!.y + 8, { steps: 14 })
  await page.mouse.up()

  await expect
    .poll(
      async () => {
        return frame
          .locator('.page > *')
          .evaluateAll((els) => els.map((e) => e.className))
      },
      { timeout: 25000 }
    )
    .not.toEqual(orderBefore)

  const orderAfter = await frame
    .locator('.page > *')
    .evaluateAll((els) => els.map((e) => e.className))
  expect(orderAfter.indexOf('totals-wrap')).toBeGreaterThan(-1)
})

test('Alt+sürükle serbest konumlandırma logoyu kaydırır', async ({ page }) => {
  await loadKurumsalFatura(page)
  const frame = page.frameLocator('#preview-frame')
  const logo = frame.locator('[data-role="logo"]')

  const box = await logo.boundingBox()
  expect(box).toBeTruthy()

  await page.keyboard.down('Alt')
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  await page.mouse.move(box!.x + box!.width / 2 + 70, box!.y + box!.height / 2 + 20, {
    steps: 10
  })
  await page.mouse.up()
  await page.keyboard.up('Alt')

  await expect
    .poll(
      async () =>
        parseFloat(await logo.evaluate((el) => getComputedStyle(el).left || '0')),
      { timeout: 10000 }
    )
    .toBeGreaterThan(40)
})

test('Logo ile ana ekrana doner ve tur sekmesi ana sayfayi yonlendirir', async ({ page }) => {
  await loadKurumsalFatura(page)
  await page.getByTitle('Ana ekran / Yeni Belge').click()
  await expect(page.getByRole('heading', { name: 'Ne tasarlamak istersiniz?' })).toBeVisible()

  const faturaCard = page.locator('section').filter({ hasText: 'e-Fatura' }).first()
  await faturaCard.getByText('Şablonları Gör').click()
  await page.locator('button.template-row').filter({ hasText: 'Kurumsal' }).first().click()
  await expect(page.frameLocator('#preview-frame').locator('.doc-title')).toBeVisible({ timeout: 15000 })

  await page.getByTitle('Ana ekran / Yeni Belge').click()
  await expect(page.getByRole('heading', { name: 'Ne tasarlamak istersiniz?' })).toBeVisible()

  const irsaliyeCard = page.locator('section').filter({ hasText: 'e-İrsaliye' })
  await irsaliyeCard.getByText('Şablonları Gör').click()
  await expect(page.getByRole('heading', { name: 'e-İrsaliye — Şablon Seç' })).toBeVisible()
})

test('paletten eklenen metin kutusu Alt olmadan suruklenerek tasinir', async ({ page }) => {
  await page.goto('/')
  const card = page.locator('section').filter({ hasText: 'e-Fatura' }).first()
  await card.getByText('Şablonları Gör').click()
  await page.locator('button.template-row').filter({ hasText: 'Kurumsal' }).first().click()
  const frame = page.frameLocator('#preview-frame')
  await expect(frame.locator('.doc-title')).toBeVisible()

  await page.getByTitle('Eleman Paleti').click()
  await page.getByRole('button', { name: /Metin Kutusu/ }).click()

  // yeni öğe otomatik seçilmeli
  const sel = frame.locator('.uni-selected').first()
  await expect(sel).toBeVisible({ timeout: 10000 })

  const b = await sel.boundingBox()
  expect(b).toBeTruthy()

  await page.mouse.move(b!.x + b!.width / 2, b!.y + b!.height / 2)
  await page.mouse.down()
  await page.mouse.move(b!.x + b!.width / 2 + 90, b!.y + b!.height / 2 + 40, { steps: 8 })
  await page.mouse.up()

  await expect
    .poll(async () => parseFloat(await sel.evaluate((el) => getComputedStyle(el).left || '0')), {
      timeout: 10000
    })
    .toBeGreaterThan(50)
})
