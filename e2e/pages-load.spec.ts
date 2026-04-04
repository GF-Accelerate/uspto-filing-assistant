import { test, expect } from '@playwright/test'

const pages = [
  { path: '/',               title: 'Portfolio' },
  { path: '/wizard',         title: 'Wizard' },
  { path: '/drawings',       title: 'Drawings' },
  { path: '/deadlines',      title: 'Deadlines' },
  { path: '/downloads',      title: 'Downloads' },
  { path: '/filing-package', title: 'Filing Package' },
  { path: '/calendar',       title: 'Calendar' },
  { path: '/settings',       title: 'Settings' },
  { path: '/legal',          title: 'Legal' },
  { path: '/trademark',      title: 'Trademark' },
  { path: '/prior-art',      title: 'Prior Art' },
  { path: '/guide',          title: 'Guide' },
  { path: '/admin',          title: 'Admin Dashboard' },
  { path: '/admin/patents',  title: 'Patent Overview' },
  { path: '/admin/audit',    title: 'Audit Log' },
  { path: '/admin/flags',    title: 'Feature Flags' },
]

test.describe('All Pages Load Without Errors', () => {
  for (const { path, title } of pages) {
    test(`${title} page (${path}) loads without console errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', err => errors.push(err.message))

      await page.goto(path)
      await page.waitForLoadState('networkidle')

      // Page should not be blank
      const body = await page.locator('body').textContent()
      expect(body?.length).toBeGreaterThan(0)

      // No uncaught JS errors
      expect(errors).toEqual([])
    })
  }
})
