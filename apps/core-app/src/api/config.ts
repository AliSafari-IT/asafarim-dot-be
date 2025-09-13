// Centralized API configuration for Core App
// Uses environment variables when provided, with sensible defaults.

import { isProduction } from "./currentHost";

interface ImportMetaEnv {
    readonly VITE_CORE_API_URL: string;
    readonly VITE_IS_PRODUCTION: string;
    readonly MODE: string;
}

const env = import.meta.env as unknown as ImportMetaEnv;
// /api/core/* -> http://127.0.0.1:5102/*
export const CORE_API_URL = (isProduction ? 'https://core.asafarim.be/api/core' : env?.VITE_CORE_API_URL || '/api/core');

// Helper to build endpoint URLs
export const coreApi = (path: string) => `${CORE_API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
