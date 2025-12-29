import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as fs from 'fs';
import * as path from 'path';

function getWorkspaceAliases(appDir: string, packageJson: unknown): Record<string, string> {
    const aliases: Record<string, string> = {};
    const dependencies = (packageJson as { dependencies?: Record<string, string> }).dependencies || {};

    for (const [packageName, version] of Object.entries(dependencies)) {
        if (version === 'workspace:*') {
            const monorepoRoot = path.resolve(appDir, '../..');

            let packageDir: string | undefined;
            const packagesDir = path.join(monorepoRoot, 'packages');
            if (fs.existsSync(packagesDir)) {
                packageDir = fs.readdirSync(packagesDir).find(dir => {
                    const pkgPath = path.join(packagesDir, dir, 'package.json');
                    if (fs.existsSync(pkgPath)) {
                        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                        return pkg.name === packageName;
                    }
                    return false;
                });
            }

            if (!packageDir) {
                const libsDir = path.join(monorepoRoot, 'libs');
                if (fs.existsSync(libsDir)) {
                    packageDir = fs.readdirSync(libsDir).find(dir => {
                        const pkgPath = path.join(libsDir, dir, 'package.json');
                        if (fs.existsSync(pkgPath)) {
                            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                            return pkg.name === packageName;
                        }
                        return false;
                    });

                    if (packageDir) {
                        const srcPath = path.join(libsDir, packageDir, 'src');
                        aliases[packageName] = fs.existsSync(srcPath) ? srcPath : path.join(libsDir, packageDir);
                        continue;
                    }
                }
            }

            if (packageDir) {
                const srcPath = path.join(packagesDir, packageDir, 'src');
                aliases[packageName] = fs.existsSync(srcPath) ? srcPath : path.join(packagesDir, packageDir);
            }
        }
    }

    return aliases;
}

export default defineConfig({
    plugins: [react()],
    server: {
        host: 'smartpath.asafarim.local',
        port: 5195,
    },
    resolve: {
        alias: {
            ...getWorkspaceAliases(__dirname, JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'))),
        },
        dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            ...Object.keys(getWorkspaceAliases(__dirname, JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')))),
        ],
        force: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        commonjsOptions: {
            include: [/node_modules/],
        },
    },
});
