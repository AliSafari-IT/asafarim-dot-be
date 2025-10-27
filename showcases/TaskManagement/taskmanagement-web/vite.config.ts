import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs'
import * as path from 'path'

function getWorkspaceAliases(baseDir: string, scope = '@asafarim') {
  const packagesDir = path.resolve(baseDir, '../../../packages')
  const aliases: Record<string, string> = {}

  if (!fs.existsSync(packagesDir)) return aliases

  for (const pkgName of fs.readdirSync(packagesDir)) {
    const pkgPath = path.join(packagesDir, pkgName)
    const pkgJsonPath = path.join(pkgPath, 'package.json')

    if (!fs.existsSync(pkgJsonPath)) continue

    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
    const name = pkgJson.name

    if (name?.startsWith(scope)) {
      // Prefer src if it exists
      const srcPath = path.join(pkgPath, 'src')
      aliases[name] = fs.existsSync(srcPath) ? srcPath : pkgPath
    }
  }

  return aliases
}
// https://vite.dev/config/
export default defineConfig(
  {
  plugins: [react()],
  server: {
    host: 'taskmanagement.asafarim.local',
    port: 5176,
    middlewareMode: false,
    hmr: {
      host: 'taskmanagement.asafarim.local',
      port: 5176,
      protocol: 'http',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5104',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
        }
      },
      '/auth': {
        target: 'http://identity.asafarim.local:5101',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
        }
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
      ...getWorkspaceAliases(__dirname),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
    ],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
})
