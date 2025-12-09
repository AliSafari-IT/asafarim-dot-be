// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const IDENTITY_API_URL = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5101';

// Status values
export const PROPOSAL_STATUSES = {
    DRAFT: 'Draft',
    SENT: 'Sent',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
} as const;

export const INVOICE_STATUSES = {
    UNPAID: 'Unpaid',
    PAID: 'Paid',
    OVERDUE: 'Overdue',
    CANCELLED: 'Cancelled',
} as const;

export const BOOKING_STATUSES = {
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
} as const;

// UI Constants
export const ITEMS_PER_PAGE = 10;
export const DEBOUNCE_DELAY = 300; // milliseconds
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Date formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy h:mm a';
export const ISO_DATE_FORMAT = 'yyyy-MM-dd';

// Currency
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_TAX_PERCENT = 0;

// Validation
export const MIN_LINE_ITEM_QUANTITY = 0.01;
export const MAX_LINE_ITEM_QUANTITY = 999999;
export const MIN_UNIT_PRICE = 0.01;
export const MAX_UNIT_PRICE = 999999999;
export const MAX_DISCOUNT_PERCENT = 100;
export const MAX_TAX_PERCENT = 100;

// Local Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    THEME: 'theme',
} as const;

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    CLIENTS: '/clients',
    PROPOSALS: '/proposals',
    INVOICES: '/invoices',
    CALENDAR: '/calendar',
    SETTINGS: '/settings',
} as const;
