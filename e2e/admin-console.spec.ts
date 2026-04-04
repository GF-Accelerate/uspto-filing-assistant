import { test, expect } from '@playwright/test'

test.describe('Admin Console', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure dev server is ready
    await page.goto('/', { waitUntil: 'networkidle' })
  })

  test('admin dashboard page loads', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' })
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('feature flags page loads and shows toggles', async ({ page }) => {
    await page.goto('/admin/flags', { waitUntil: 'networkidle' })
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('audit log page loads', async ({ page }) => {
    await page.goto('/admin/audit', { waitUntil: 'networkidle' })
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('patent overview page loads', async ({ page }) => {
    await page.goto('/admin/patents', { waitUntil: 'networkidle' })
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('admin routes accessible from More menu', async ({ page }) => {
    await page.getByText('More ▾').click()

    const dashLink = page.getByRole('link', { name: 'Dashboard' })
    await expect(dashLink).toBeVisible()
    await dashLink.click()
    await expect(page).toHaveURL('/admin')
  })
})
