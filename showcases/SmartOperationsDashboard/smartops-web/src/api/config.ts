import { isProduction } from "@asafarim/shared-ui-react"

// API configuration for development and production
export const API_BASE_URL = isProduction
  ? 'http://smartops.asafarim.be/api'
  : 'http://smartops.asafarim.local:5105'

export const API_BASE_URL_ADMIN = isProduction
  ? 'http://asafarim.be/api'
  : 'http://identity.asafarim.local:5101'

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Include cookies for auth
}

export const API_CONFIG_ADMIN = {
  baseURL: API_BASE_URL_ADMIN,
  timeout: 30000,
  withCredentials: true, // Include cookies for auth
}
