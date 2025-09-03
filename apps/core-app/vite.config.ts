import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'core.asafarim.local',
    port: 5174,
  },
  resolve: {
    alias: {
      '@asafarim/shared-ui-react': resolve(__dirname, '../../packages/shared-ui-react'),
      '@asafarim/shared-tokens': resolve(__dirname, '../../packages/shared-tokens'),
    },
  },
  optimizeDeps: {
    // Ensure workspace packages are properly optimized
    include: ['@asafarim/shared-ui-react', '@asafarim/shared-tokens'],
  },
})
