import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs'
import * as path from 'path'

function getWorkspaceAliases(baseDir: string, scope = '@asafarim') {
    const packagesDir = path.resolve(baseDir, '../../packages');
    const libsDir = path.resolve(baseDir, '../../libs');
    const aliases: Record<string, string> = {}

    // Scan packages directory
    if (fs.existsSync(packagesDir)) {
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
    }

    // Scan libs directory
    if (fs.existsSync(libsDir)) {
        for (const pkgName of fs.readdirSync(libsDir)) {
            const pkgPath = path.join(libsDir, pkgName)
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
    }

    return aliases
}

export default defineConfig({
    plugins: [react()],
    server: {
        host: 'freelance-toolkit.asafarim.local',
        port: 5185,
        middlewareMode: false,
        hmr: {
            host: 'freelance-toolkit.asafarim.local',
            port: 5185,
            protocol: 'http',
        },
        proxy: {
            '/api': {
                target: 'http://freelance-toolkit.asafarim.local:5107',
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
    define: {
        'import.meta.env.VITE_IS_PRODUCTION': JSON.stringify(process.env.NODE_ENV === 'production')
    },
    resolve: {
        alias: {
            '@': '/src',
            ...getWorkspaceAliases(__dirname)
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
