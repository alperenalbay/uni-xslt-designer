import { expect, test } from '@playwright/test'

test('karşılama ekranı görünür ve üç belge türü listelenir', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Ne tasarlamak istersiniz?' })).toBeVisible()
  await expect(page.locator('section').filter({ hasText: 'e-Fatura' }).first()).toBeVisible()
  await expect(page.locator('section').filter({ hasText: 'e-Arşiv' })).toBeVisible()
  await expect(page.locator('section').filter({ hasText: 'e-İrsaliye' })).toBeVisible()
})

test('e-Fatura kurumsal şablon canlı önizlemede dönüştürülür', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/')
  const faturaCard = page.locator('section').filter({ hasText: 'e-Fatura' }).first()
  await faturaCard.getByText('Şablonları Gör').click()
  await page.locator('button.template-row').filter({ hasText: 'Kurumsal' }).first().click()

  const frame = page.frameLocator('#preview-frame')
  await expect(frame.locator('.doc-title')).toContainText('E-FATURA', { ignoreCase: true })
  await expect(frame.getByText('DEVATEK TEKNOLOJİ A.Ş.')).toBeVisible()
  await expect(frame.getByText('ÖRNEK TİCARET LTD. ŞTİ.')).toBeVisible()
  await expect(frame.getByText('LaserJet Kurumsal Yazıcı')).toBeVisible()
  await expect(frame.getByText('Genel Toplam')).toBeVisible()

  // Durum çubuğu doğrulama rozeti
  await expect(page.getByText('Doğrulandı')).toBeVisible({ timeout: 10000 })
  expect(errors).toEqual([])
})

test('e-İrsaliye kurumsal şablon çalışır', async ({ page }) => {
  await page.goto('/')
  const irsaliyeCard = page.locator('section').filter({ hasText: 'e-İrsaliye' })
  await irsaliyeCard.getByText('Şablonları Gör').click()
  await page.locator('button.template-row').filter({ hasText: 'Kurumsal' }).first().click()

  const frame = page.frameLocator('#preview-frame')
  await expect(frame.locator('.doc-title')).toContainText('E-İRSALİYE', { ignoreCase: true })
  await expect(frame.getByText('HIZLI LOJİSTİK TAŞIMACILIK A.Ş.')).toBeVisible()
  await expect(frame.getByText('Ofis Koltuğu Ergonomik Pro')).toBeVisible()
})

test('e-Arşiv sade şablon çalışır', async ({ page }) => {
  await page.goto('/')
  const arsivCard = page.locator('section').filter({ hasText: 'e-Arşiv' })
  await arsivCard.getByText('Şablonları Gör').click()
  await page.locator('button.template-row').filter({ hasText: 'Sade' }).first().click()

  const frame = page.frameLocator('#preview-frame')
  await expect(frame.locator('h1')).toContainText('Arşiv', { ignoreCase: true })
  await expect(frame.getByText('AYŞE YILMAZ')).toBeVisible()
})
