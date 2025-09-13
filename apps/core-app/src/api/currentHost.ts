
// Determine if we're in production based on hostname and protocol
export const isProduction = typeof window !== 'undefined' && (
    // Check for production domains
    window.location.hostname.includes('asafarim.be') || 
    window.location.hostname.includes('asafarim.com') ||
    // Also consider HTTPS as production
    window.location.protocol === 'https:' ||
    // Force production mode for specific hostnames
    window.location.hostname === 'blog.asafarim.be'
  );

