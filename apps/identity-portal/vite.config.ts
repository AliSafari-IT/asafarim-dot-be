import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'identity.asafarim.local',
    port: 5177,
  },
  define: {
    'import.meta.env.VITE_IDENTITY_API_URL': JSON.stringify('http://api.asafarim.local:5190')
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
