// Vitest configuration — excludes the e2e/ directory because those
// files use Playwright's test API (@playwright/test), which is
// incompatible with vitest's runner. Run Playwright tests via
// `npm run test:e2e` instead.

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'e2e', 'dist'],
    environment: 'node',
  },
})
