import { expect, test } from '@playwright/test'

test.describe('Packet Atlas smoke flow', () => {
  test('loads the atlas and exposes the main journey UI', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText(/Packet Atlas/i).first()).toBeVisible()
    await expect(page.getByText(/Opening https:\/\/example\.com/i).first()).toBeVisible()
    await expect(page.getByText(/Layer Highlight Mode/i).first()).toBeVisible()
    await expect(page.getByText(/Route Timeline/i).first()).toBeVisible()
  })

  test('selecting DNS stage updates the visible active stage', async ({ page }) => {
    await page.goto('/')

    await page.getByText(/DNS query/i).first().click()
    await expect(page.getByText(/ACTIVE STAGE/i).first()).toBeVisible()
    await expect(page.getByText(/DNS query/i).first()).toBeVisible()
  })

  test('layer buttons are interactive', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: /Transport/i }).first().click()
    await expect(page.getByText(/Highlighting: transport/i).first()).toBeVisible()
  })
})
