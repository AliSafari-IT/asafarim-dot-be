/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_IDENTITY_API_URL: string;
    readonly VITE_SMARTPATH_API_URL: string;
    readonly VITE_IS_PRODUCTION: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
