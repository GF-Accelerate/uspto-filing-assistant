import { test, expect } from '@playwright/test'

test.describe('Feature Flags', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage feature flags to get defaults
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('uspto-feature-flags-v1'))
    await page.reload()
  })

  test('default flags enable key features', async ({ page }) => {
    const flags = await page.evaluate(() => {
      const raw = localStorage.getItem('uspto-feature-flags-v1')
      return raw ? JSON.parse(raw) : null
    })

    // If no flags stored yet, defaults are used (all true except ODP)
    // Check that key nav items are visible (they depend on flags)
    await expect(page.getByRole('link', { name: 'Drawings' })).toBeVisible()
  })

  test('admin_console_enabled defaults to true', async ({ page }) => {
    await page.getByText('More ▾').click()
    // Admin section should be visible with default flags
    await expect(page.getByText('Admin')).toBeVisible()
  })

  test('filing package link visible (filing_package_enabled default true)', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Filing Pkg' })).toBeVisible()
  })

  test('More menu shows legal docs (legal_docs_enabled default true)', async ({ page }) => {
    await page.getByText('More ▾').click()
    await expect(page.getByRole('link', { name: 'Legal Docs' })).toBeVisible()
  })

  test('More menu shows trademarks (trademark_module_enabled default true)', async ({ page }) => {
    await page.getByText('More ▾').click()
    await expect(page.getByRole('link', { name: 'Trademarks' })).toBeVisible()
  })

  test('More menu shows prior art (prior_art_search_enabled default true)', async ({ page }) => {
    await page.getByText('More ▾').click()
    await expect(page.getByRole('link', { name: 'Prior Art' })).toBeVisible()
  })
})
