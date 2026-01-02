import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
      $components: path.resolve('./src/components'),
      $stores: path.resolve('./src/stores')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts', 'src/stores/**/*.ts']
    }
  }
})
