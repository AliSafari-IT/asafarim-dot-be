/**
 * Restaurant Management System - Order API Client
 * React + TypeScript implementation
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// Types
export type OrderType = 'DINE_IN' | 'TAKEOUT' | 'DELIVERY';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type OrderItemStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

export interface ModifierRequest {
  modifierOptionId: string;
}

export interface OrderItemRequest {
  menuItemId: string;
  quantity: number;
  notes?: string;
  modifiers?: ModifierRequest[];
}

export interface PlaceOrderRequest {
  restaurantId: string;
  locationId: string;
  type: OrderType;
  tableId?: string | null;
  customerId?: string;
  items: OrderItemRequest[];
  discountCode?: string;
  loyaltyPointsToUse?: number;
  notes?: string;
  paymentMethod?: string;
}

export interface ModifierResponse {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface OrderItemResponse {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  status: OrderItemStatus;
  modifiers: ModifierResponse[];
}

export interface StatusHistoryResponse {
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  type: OrderType;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  tipAmount: number;
  deliveryFee: number;
  totalAmount: number;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  estimatedReadyAt: string;
  createdAt: string;
  items: OrderItemResponse[];
  statusHistory: StatusHistoryResponse[];
}

export interface UpdateStatusRequest {
  status: OrderStatus;
  notes?: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  traceId: string;
  details?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// API Client
class OrderApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new OrderApiError(error);
    }

    return response.json();
  }

  // Place a new order
  async placeOrder(request: PlaceOrderRequest): Promise<OrderResponse> {
    return this.request<OrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/orders/${orderId}`);
  }

  // Get order by order number
  async getOrderByNumber(orderNumber: string): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/orders/number/${orderNumber}`);
  }

  // List orders with pagination
  async getOrders(
    restaurantId: string,
    options: {
      status?: OrderStatus;
      page?: number;
      size?: number;
    } = {}
  ): Promise<PaginatedResponse<OrderResponse>> {
    const params = new URLSearchParams({
      restaurantId,
      page: String(options.page ?? 0),
      size: String(options.size ?? 20),
    });

    if (options.status) {
      params.set('status', options.status);
    }

    return this.request<PaginatedResponse<OrderResponse>>(`/orders?${params}`);
  }

  // Update order status
  async updateOrderStatus(
    orderId: string,
    request: UpdateStatusRequest
  ): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  // Cancel order
  async cancelOrder(orderId: string, reason: string): Promise<OrderResponse> {
    return this.request<OrderResponse>(
      `/orders/${orderId}/cancel?reason=${encodeURIComponent(reason)}`,
      { method: 'POST' }
    );
  }
}

// Custom error class
export class OrderApiError extends Error {
  public readonly status: number;
  public readonly errorCode: string;
  public readonly traceId: string;
  public readonly details?: Record<string, string>;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'OrderApiError';
    this.status = apiError.status;
    this.errorCode = apiError.error;
    this.traceId = apiError.traceId;
    this.details = apiError.details;
  }
}

// Singleton instance
export const orderApi = new OrderApiClient();

// React Query hooks (optional - requires @tanstack/react-query)
export const orderQueryKeys = {
  all: ['orders'] as const,
  lists: () => [...orderQueryKeys.all, 'list'] as const,
  list: (restaurantId: string, status?: OrderStatus) =>
    [...orderQueryKeys.lists(), { restaurantId, status }] as const,
  details: () => [...orderQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderQueryKeys.details(), id] as const,
};
