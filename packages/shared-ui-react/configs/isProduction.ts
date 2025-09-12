// Determine if we're in production based on hostname and protocol
const isProduction = typeof window !== 'undefined' && (
    window.location.hostname.includes('asafarim.be') || 
    window.location.hostname.includes('asafarim.com')
);

export default isProduction;