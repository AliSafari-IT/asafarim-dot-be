import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sharedI18nSrc = path.resolve(__dirname, '..');

export default defineConfig({
  plugins: [react()],
  base: '/shared-i18n/',
  server: {
    port: 5185,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@asafarim/shared-i18n': sharedI18nSrc
    }
  }
});
