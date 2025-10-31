import { isProduction } from "@asafarim/shared-ui-react"

// API configuration for development and production
export const API_BASE_URL = isProduction
  ? (import.meta.env.VITE_SMARTOPS_API_URL || 'https://smartops.asafarim.be/api/smartops')
  : (import.meta.env.VITE_SMARTOPS_API_URL || 'http://localhost:5105/api')

export const IDENTITY_API_URL = isProduction
  ? (import.meta.env.VITE_IDENTITY_API_URL || 'https://identity.asafarim.be/api/identity')
  : (import.meta.env.VITE_IDENTITY_API_URL || 'http://identity.asafarim.local:5101')

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Include cookies for auth
}

export const API_CONFIG_IDENTITY = {
  baseURL: IDENTITY_API_URL,
  timeout: 30000,
  withCredentials: true, // Include cookies for auth
}
