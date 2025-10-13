
// Production check that happens at runtime, not build time
export const getIsProduction = (): boolean => {
  // During SSR/build, check NODE_ENV to determine if building for production
  if (typeof window === 'undefined') {
    // During build, use NODE_ENV to decide which URLs to bake in
    return process.env.NODE_ENV === 'production';
  }

  try {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Check for production domains
    const isProductionDomain = hostname.includes('asafarim.be') ||
                              hostname.includes('asafarim.com') ||
                              hostname.includes('blog.asafarim.be') ||
                              hostname.includes('web.asafarim.be') ||
                              hostname.includes('ai.asafarim.be') ||
                              hostname.includes('core.asafarim.be') ||
                              hostname.includes('identity.asafarim.be');

    // Also consider HTTPS as production (for cases where domain might be different)
    const isHttps = protocol === 'https:';

    const result = isProductionDomain || isHttps;

    // Log for debugging in development (check if hostname suggests dev environment)
    if (hostname.includes('local') || hostname.includes('localhost')) {
      console.log('isProduction check:', {
        hostname,
        protocol,
        isProductionDomain,
        isHttps,
        result
      });
    }

    return result;
  } catch (error) {
    // Fallback to false if there's any error accessing window.location
    console.warn('Error checking production status:', error);
    return false;
  }
};

// For backward compatibility, export a constant that calls the function
// This ensures the check happens at runtime when the module is first imported
export const isProduction = getIsProduction();

export default isProduction;