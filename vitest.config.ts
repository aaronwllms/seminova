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
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,prettier}.config.*',
      '**/eslint.config.{js,mjs,cjs,ts,mts,cts}',
    ],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/components/ui/**',
        'src/mocks/**',
        'src/test/**',
        'src/app/globals.css',
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        'src/app/**/opengraph-image.tsx', // debt: thin OG segment files; cover via og-image util tests if threshold pressure returns
        'src/app/(marketing)/workflow/_components/workflow-conventions-section.tsx',
        'src/app/(marketing)/workflow/_components/workflow-documents-section.tsx',
        'src/app/(marketing)/workflow/_components/workflow-guide-cta.tsx',
        'src/app/(marketing)/workflow/_components/workflow-plan-review-section.tsx',
        'src/app/(marketing)/workflow/_components/workflow-section-nav.tsx',
        'src/app/(marketing)/workflow/_components/workflow-two-environments-section.tsx', // static marketing sections excluded; workflow-diagram.tsx is measured
        'src/app/(marketing)/reference/_components/**', // pattern-page demo shells; reference/_lib helpers stay measured
        'src/providers/**',
        'src/supabase/client.ts',
        'src/supabase/server.ts',
        'src/proxy.ts',
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
      'server-only': path.resolve(__dirname, './src/test/server-only-stub.ts'),
    },
  },
})
