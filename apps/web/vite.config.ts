import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'web.asafarim.local',
    port: 5175,
  },
  resolve: {
    alias: {
      '@asafarim/shared-ui-react': resolve(__dirname, '../../packages/shared-ui-react'),
    },
  },
  optimizeDeps: {
    // Ensure workspace packages are properly optimized
    include: ['@asafarim/shared-ui-react'],
    force: true, // Force dependency optimization on each build
  },
  build: {
    commonjsOptions: {
      include: [/shared-ui-react/],
    },
  },
})
