var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as fs from 'fs';
import * as path from 'path';
function getWorkspaceAliases(baseDir, scope) {
    if (scope === void 0) { scope = '@asafarim'; }
    var packagesDir = path.resolve(baseDir, '../../../packages');
    var aliases = {};
    if (!fs.existsSync(packagesDir))
        return aliases;
    for (var _i = 0, _a = fs.readdirSync(packagesDir); _i < _a.length; _i++) {
        var pkgName = _a[_i];
        var pkgPath = path.join(packagesDir, pkgName);
        var pkgJsonPath = path.join(pkgPath, 'package.json');
        if (!fs.existsSync(pkgJsonPath))
            continue;
        var pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        var name_1 = pkgJson.name;
        if (name_1 === null || name_1 === void 0 ? void 0 : name_1.startsWith(scope)) {
            // Prefer src if it exists
            var srcPath = path.join(pkgPath, 'src');
            aliases[name_1] = fs.existsSync(srcPath) ? srcPath : pkgPath;
        }
    }
    return aliases;
}
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: 'smartops.asafarim.local',
        port: 5178,
        middlewareMode: false,
        hmr: {
            host: 'smartops.asafarim.local',
            port: 5178,
            protocol: 'http',
        },
        proxy: {
            '/api': {
                target: 'http://localhost:5105',
                changeOrigin: true,
                secure: false,
                configure: function (proxy) {
                    proxy.on('error', function (err) {
                        console.log('proxy error', err);
                    });
                }
            },
            '/auth': {
                target: 'http://identity.asafarim.local:5101',
                changeOrigin: true,
                secure: false,
                configure: function (proxy) {
                    proxy.on('error', function (err) {
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
        alias: __assign({}, getWorkspaceAliases(__dirname)),
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
});
