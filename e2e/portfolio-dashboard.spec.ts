import { test, expect } from '@playwright/test'

test.describe('Portfolio Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
  })

  test('displays all 7 patents in portfolio', async ({ page }) => {
    // Use more specific text to avoid matching multiple elements
    await expect(page.getByText('PA-1', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('PA-2', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('PA-3', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('PA-4', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('PA-5', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('PA-6', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('PA-7', { exact: true }).first()).toBeVisible()
  })

  test('PA-1 shows filed status with application number', async ({ page }) => {
    await expect(page.getByText('64/029,100').first()).toBeVisible()
  })

  test('PA-1 title is correct', async ({ page }) => {
    await expect(page.getByText('Voice-Controlled Database Query').first()).toBeVisible()
  })

  test('PA-5 VADI title is visible', async ({ page }) => {
    await expect(page.getByText('Voice-First Agentic Database Infrastructure').first()).toBeVisible()
  })

  test('PA-1 deadline information is displayed', async ({ page }) => {
    await expect(page.getByText(/PA-1 deadline/).first()).toBeVisible()
  })
})
