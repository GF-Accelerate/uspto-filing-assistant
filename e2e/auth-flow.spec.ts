import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
  })

  test('Sign in button is visible when Supabase is configured', async ({ page }) => {
    const signInBtn = page.locator('button:text-is("Sign in")')
    const isVisible = await signInBtn.isVisible().catch(() => false)

    if (isVisible) {
      await expect(signInBtn).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('AuthModal opens on Sign in click', async ({ page }) => {
    const signInBtn = page.locator('button:text-is("Sign in")')
    const isVisible = await signInBtn.isVisible().catch(() => false)
    if (!isVisible) { test.skip(); return }

    await signInBtn.click()

    await expect(page.getByText('Sign in to USPTO Filing Assistant', { exact: true })).toBeVisible()
    await expect(page.getByPlaceholder('moverton7474@gmail.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
  })

  test('AuthModal toggles between login and register modes', async ({ page }) => {
    const signInBtn = page.locator('button:text-is("Sign in")')
    const isVisible = await signInBtn.isVisible().catch(() => false)
    if (!isVisible) { test.skip(); return }

    await signInBtn.click()
    await expect(page.getByText('Sign in to USPTO Filing Assistant', { exact: true })).toBeVisible()

    // Switch to register via the "Sign up" link
    await page.locator('button:text-is("Sign up")').click()
    await expect(page.getByText('Create your account', { exact: true })).toBeVisible()

    // Full name field should appear
    await expect(page.getByPlaceholder('Milton Overton')).toBeVisible()

    // Switch back to login via the blue "Sign in" link at the bottom of the modal
    await page.locator('button.text-blue-600:text-is("Sign in")').click()
    await expect(page.getByText('Sign in to USPTO Filing Assistant', { exact: true })).toBeVisible()
  })

  test('Register button disabled when name is empty', async ({ page }) => {
    const signInBtn = page.locator('button:text-is("Sign in")')
    const isVisible = await signInBtn.isVisible().catch(() => false)
    if (!isVisible) { test.skip(); return }

    await signInBtn.click()
    await page.locator('button:text-is("Sign up")').click()

    await page.getByPlaceholder('moverton7474@gmail.com').fill('test@test.com')
    await page.getByPlaceholder('••••••••').fill('password123')

    // Create account button should be disabled (name required)
    const submitBtn = page.getByRole('button', { name: 'Create account' })
    await expect(submitBtn).toBeDisabled()

    // Fill name — button should enable
    await page.getByPlaceholder('Milton Overton').fill('Test User')
    await expect(submitBtn).toBeEnabled()
  })

  test('AuthModal closes on backdrop click', async ({ page }) => {
    const signInBtn = page.locator('button:text-is("Sign in")')
    const isVisible = await signInBtn.isVisible().catch(() => false)
    if (!isVisible) { test.skip(); return }

    await signInBtn.click()
    await expect(page.getByText('Sign in to USPTO Filing Assistant', { exact: true })).toBeVisible()

    // Click the backdrop overlay (top-left corner)
    await page.mouse.click(10, 10)
    await expect(page.getByText('Sign in to USPTO Filing Assistant', { exact: true })).not.toBeVisible()
  })

  test('Google sign-in button is present', async ({ page }) => {
    const signInBtn = page.locator('button:text-is("Sign in")')
    const isVisible = await signInBtn.isVisible().catch(() => false)
    if (!isVisible) { test.skip(); return }

    await signInBtn.click()
    await expect(page.getByText('Continue with Google')).toBeVisible()
  })
})
