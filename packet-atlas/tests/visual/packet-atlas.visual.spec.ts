import { expect, test } from '@playwright/test'

test.describe('Packet Atlas visual baselines', () => {
  test('journey workspace', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/Opening https:\/\/example\.com/i).first()).toBeVisible()
    await expect(page).toHaveScreenshot('journey-workspace.png', { fullPage: true })
  })

  test('diagnostics workspace', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: /Diagnostics/i }).click()
    await expect(page.getByText(/Failure model/i).first()).toBeVisible()
    await expect(page).toHaveScreenshot('diagnostics-workspace.png', { fullPage: true })
  })

  test('capture workspace', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('tab', { name: /Capture/i }).click()
    await expect(page.getByText(/Capture bridge/i).first()).toBeVisible()
    await expect(page).toHaveScreenshot('capture-workspace.png', { fullPage: true })
  })
})
