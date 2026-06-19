import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}', 'proxy.ts'],
      exclude: [
        'src/components/ui/**',
        'src/mocks/**',
        'src/test/**',
        'src/app/globals.css',
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        'src/app/(admin)/_components/admin-breadcrumb.tsx',
        'src/app/(admin)/_components/admin-nav-user.tsx',
        'src/app/(admin)/_components/admin-shell.tsx',
        'src/app/(admin)/_components/admin-sidebar.tsx',
        'src/providers/**',
        'src/supabase/client.ts',
        'src/supabase/server.ts',
        'src/components/theme-switcher.tsx',
        'src/components/auth-button.tsx',
        'proxy.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
