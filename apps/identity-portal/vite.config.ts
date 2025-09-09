import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This allows connections from all network interfaces
    port: 5177,
    proxy: {
      '/api': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/auth': {
        target: 'http://localhost:5177',
        changeOrigin: true
      }
    }
  },
  // Do not hardcode VITE_IDENTITY_API_URL here; rely on .env files for dev/prod.
  // Keep only this convenience flag if needed by the app.
  define: {
    'import.meta.env.VITE_IS_PRODUCTION': JSON.stringify(process.env.NODE_ENV === 'production')
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
