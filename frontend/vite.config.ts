import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')
  const backendTarget = `http://localhost:${env.VITE_BACKEND_PORT ?? '8080'}`

  return {
    plugins: [react(), svgr()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/auth/refresh': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: 'tests/unit/setup-test.ts',
      globals: true,
      include: [
        'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
        'tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}',
      ],
      exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text-summary', 'text', 'html', 'lcov'],
        reportsDirectory: './.artifacts/unit/coverage',
        include: ['src/**/*.{js,jsx,ts,tsx}'],
        exclude: [
          'src/main.tsx',
          'src/**/*.test.{js,jsx,ts,tsx}',
          'src/**/*.spec.{js,jsx,ts,tsx}',
          'src/**/*.d.ts',
          'src/index.{js,jsx,ts,tsx}',
        ],
        thresholds: {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0,
        },
      },
    },
  }
})
