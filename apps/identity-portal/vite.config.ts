import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'identity.asafarim.local',
    port: 5177,
  },
  define: {
    'import.meta.env.VITE_IDENTITY_API_URL': JSON.stringify('http://api.asafarim.local:5190')
  }
})
