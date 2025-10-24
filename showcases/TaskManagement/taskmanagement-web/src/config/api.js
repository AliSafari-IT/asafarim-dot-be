const isDevelopment = import.meta.env.DEV;
export const API_BASE_URL = isDevelopment
    ? 'http://tasks.asafarim.local:5104/api'
    : 'https://tasks.asafarim.be/api';
export const IDENTITY_API_URL = isDevelopment
    ? 'http://identity.asafarim.local:5101'
    : 'https://identity.asafarim.be';
