import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs'
import * as path from 'path'

function getWorkspaceAliases(baseDir: string, scope = '@asafarim') {
  const packagesDir = path.resolve(baseDir, '../../packages')
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

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'web.asafarim.local',
    port: 5175,
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
      ...Object.keys(getWorkspaceAliases(__dirname)),
    ],
    force: true,
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
})
