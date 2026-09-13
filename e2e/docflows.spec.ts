import { expect, test } from '@playwright/test'

async function loadFirstCard(page: import('@playwright/test').Page, section: string): Promise<void> {
  await page.goto('/')
  const card = page.locator('section').filter({ hasText: section }).first()
  await card.getByText('Şablonları Gör').click()
  await page.locator('button.template-row').filter({ hasText: 'Kurumsal' }).first().click()
  await expect(page.frameLocator('#preview-frame').locator('.doc-title')).toBeVisible({ timeout: 15000 })
}

test('e-Arşiv kartı önizlemede dönüşür ve Doğrulandı rozeti görünür', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))
  await loadFirstCard(page, 'e-Arşiv')
  await expect(page.getByText('Doğrulandı')).toBeVisible({ timeout: 10000 })
  expect(errors).toEqual([])
})

test('e-İrsaliye kartı önizlemede dönüşür ve Doğrulandı rozeti görünür', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))
  await loadFirstCard(page, 'e-İrsaliye')
  await expect(page.getByText('Doğrulandı')).toBeVisible({ timeout: 10000 })
  expect(errors).toEqual([])
})
