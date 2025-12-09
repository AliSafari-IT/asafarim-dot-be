/**
 * Download a blob as a file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(d);
};

/**
 * Format date and time
 */
export const formatDateTime = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(d);
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (Math.abs(diffMins) < 1) return 'just now';
    if (Math.abs(diffMins) < 60) {
        return diffMins > 0 ? `in ${diffMins} minutes` : `${Math.abs(diffMins)} minutes ago`;
    }
    if (Math.abs(diffHours) < 24) {
        return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
    }
    return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

/**
 * Get status color for badges
 */
export const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
        // Proposal statuses
        Draft: '#6b7280',
        Sent: '#3b82f6',
        Accepted: '#10b981',
        Rejected: '#ef4444',

        // Invoice statuses
        Paid: '#10b981',
        Unpaid: '#f59e0b',
        Overdue: '#ef4444',
        Cancelled: '#6b7280',

        // Booking statuses
        Scheduled: '#3b82f6',
        Completed: '#10b981',
        Canceled: '#6b7280',
    };

    return statusColors[status] || '#6b7280';
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Calculate line item total
 */
export const calculateLineItemTotal = (
    quantity: number,
    unitPrice: number,
    discountPercent?: number
): number => {
    const subtotal = quantity * unitPrice;
    const discount = discountPercent ? (subtotal * discountPercent) / 100 : 0;
    return subtotal - discount;
};

/**
 * Calculate proposal/invoice totals
 */
export const calculateTotals = (
    lineItems: Array<{ quantity: number; unitPrice: number; discountPercent?: number }>,
    taxPercent?: number
): { subtotal: number; taxAmount: number; total: number } => {
    const subtotal = lineItems.reduce(
        (sum, item) => sum + calculateLineItemTotal(item.quantity, item.unitPrice, item.discountPercent),
        0
    );

    const taxAmount = taxPercent ? (subtotal * taxPercent) / 100 : 0;
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};
