import { test, expect } from '@playwright/test'

test.describe('App Navigation & Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
  })

  test('renders header with Patent Filing branding', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible()
    await expect(page.getByText('Patent Filing', { exact: true })).toBeVisible()
    await expect(page.getByText('PATENT PENDING', { exact: true })).toBeVisible()
  })

  test('shows HITL warning banner', async ({ page }) => {
    await expect(page.getByText('USPTO requires ID.me + MFA to file', { exact: false })).toBeVisible()
  })

  test('primary nav links render and navigate', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Portfolio' })).toBeVisible()

    const wizard = page.getByRole('link', { name: 'Wizard' })
    await expect(wizard).toBeVisible()
    await wizard.click()
    await expect(page).toHaveURL('/wizard')

    const calendar = page.getByRole('link', { name: 'Calendar' })
    await expect(calendar).toBeVisible()
    await calendar.click()
    await expect(page).toHaveURL('/calendar')

    const downloads = page.getByRole('link', { name: 'Downloads' })
    await expect(downloads).toBeVisible()
    await downloads.click()
    await expect(page).toHaveURL('/downloads')
  })

  test('More menu opens and shows secondary nav items', async ({ page }) => {
    await page.getByText('More ▾').click()

    await expect(page.getByRole('link', { name: 'Deadlines' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'USPTO Guide' })).toBeVisible()
  })

  test('More menu shows admin section (admin_console_enabled defaults true)', async ({ page }) => {
    await page.getByText('More ▾').click()
    await expect(page.getByText('Admin', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Feature Flags' })).toBeVisible()
  })

  test('dark mode toggle works', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Dark' })
    await expect(toggle).toBeVisible()
    await toggle.click()

    await expect(page.getByRole('button', { name: 'Light' })).toBeVisible()
    const hasDark = await page.locator('html').evaluate(el => el.classList.contains('dark'))
    expect(hasDark).toBe(true)

    await page.getByRole('button', { name: 'Light' }).click()
    await expect(page.getByRole('button', { name: 'Dark' })).toBeVisible()
  })
})
