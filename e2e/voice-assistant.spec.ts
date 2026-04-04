import { test, expect } from '@playwright/test'

test.describe('Voice Assistant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
  })

  test('floating voice button is visible', async ({ page }) => {
    const voiceBtn = page.locator('button[title="Patent AI Assistant"]')
    await expect(voiceBtn).toBeVisible()
  })

  test('clicking voice button opens assistant panel', async ({ page }) => {
    await page.locator('button[title="Patent AI Assistant"]').click()

    // Panel header — use exact match to avoid matching welcome message
    await expect(page.getByText('Patent Filing Assistant', { exact: true })).toBeVisible()
    await expect(page.getByText('Visionary AI Systems, Inc.', { exact: false })).toBeVisible()
  })

  test('welcome message is displayed on open', async ({ page }) => {
    await page.locator('button[title="Patent AI Assistant"]').click()

    await expect(page.getByText("Hi Milton! I'm your Patent Filing Assistant", { exact: false })).toBeVisible()
  })

  test('quick action pills are visible', async ({ page }) => {
    await page.locator('button[title="Patent AI Assistant"]').click()

    // Quick action buttons contain these labels
    await expect(page.locator('button:text("Deadlines")')).toBeVisible()
    await expect(page.locator('button:text("File PA-5")')).toBeVisible()
    await expect(page.locator('button:text("Prior Art")')).toBeVisible()
    await expect(page.locator('button:text("Legal Docs")')).toBeVisible()
    await expect(page.locator('button:text("Drawings")')).toBeVisible()
  })

  test('text input field is present and functional', async ({ page }) => {
    await page.locator('button[title="Patent AI Assistant"]').click()

    const input = page.getByPlaceholder('Ask about your patents...')
    await expect(input).toBeVisible()

    await input.fill('What is my next deadline?')
    expect(await input.inputValue()).toBe('What is my next deadline?')
  })

  test('send button is disabled when input is empty', async ({ page }) => {
    await page.locator('button[title="Patent AI Assistant"]').click()

    const sendBtn = page.locator('button:has-text("➤")')
    const bg = await sendBtn.evaluate(el => getComputedStyle(el).backgroundColor)
    expect(bg).toContain('226')
  })

  test('hands-free toggle button is visible', async ({ page }) => {
    await page.locator('button[title="Patent AI Assistant"]').click()

    await expect(page.locator('button:has-text("Hands-free")')).toBeVisible()
  })

  test('hands-free toggle changes state', async ({ page }) => {
    await page.locator('button[title="Patent AI Assistant"]').click()

    const handsFreeBtn = page.locator('button:has-text("Hands-free")')
    await expect(handsFreeBtn).toBeVisible()

    // Click to enable hands-free
    await handsFreeBtn.click()

    // Should show HANDS-FREE badge in header (use exact: true + first)
    await expect(page.getByText('HANDS-FREE', { exact: true }).first()).toBeVisible()
  })

  test('agent labels display correctly', async ({ page }) => {
    await page.locator('button[title="Patent AI Assistant"]').click()

    // The header shows the current agent label
    await expect(page.locator('span:text("USPTO")').first()).toBeVisible()
  })

  test('closing panel via button works', async ({ page }) => {
    const voiceBtn = page.locator('button[title="Patent AI Assistant"]')
    await voiceBtn.click()
    await expect(page.getByText('Patent Filing Assistant', { exact: true })).toBeVisible()

    await voiceBtn.click()
    // The panel header text should not be visible when closed
    await expect(page.getByText('Visionary AI Systems, Inc.', { exact: false }).locator('visible=true')).not.toBeVisible()
  })

  test('voice button shows correct icon states', async ({ page }) => {
    const voiceBtn = page.locator('button[title="Patent AI Assistant"]')

    await expect(voiceBtn).toContainText('🎙️')

    await voiceBtn.click()
    await expect(voiceBtn).toContainText('✕')
  })
})
