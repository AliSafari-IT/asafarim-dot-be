import { isProduction } from "@asafarim/shared-ui-react"

// API configuration for development and production
export const API_BASE_URL = isProduction
  ? 'http://smartops.asafarim.be/api'
  : 'http://smartops.asafarim.local:5105/api'

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Include cookies for auth
}
