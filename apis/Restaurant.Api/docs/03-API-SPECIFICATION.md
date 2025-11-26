# API Specification (OpenAPI Style)

## Base URL

```text
Production: https://api.restaurant.asafarim.be/v1
Development: http://localhost:8080/api/v1
```

---

## Orders API

### POST /api/orders — Place Order

**Request:**

```json
{
  "restaurantId": "550e8400-e29b-41d4-a716-446655440000",
  "locationId": "660e8400-e29b-41d4-a716-446655440001",
  "type": "DINE_IN",
  "tableId": "770e8400-e29b-41d4-a716-446655440002",
  "customerId": "880e8400-e29b-41d4-a716-446655440003",
  "items": [
    {
      "menuItemId": "990e8400-e29b-41d4-a716-446655440004",
      "quantity": 2,
      "notes": "No onions",
      "modifiers": [
        { "modifierOptionId": "aa0e8400-e29b-41d4-a716-446655440005" }
      ]
    }
  ],
  "discountCode": "SUMMER20",
  "loyaltyPointsToUse": 100,
  "notes": "Birthday celebration",
  "paymentMethod": "CARD"
}
```

**Response (201 Created):**

```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440006",
  "orderNumber": "ORD-2025-001234",
  "status": "PENDING",
  "type": "DINE_IN",
  "subtotal": 45.00,
  "taxAmount": 4.05,
  "discountAmount": 9.00,
  "totalAmount": 40.05,
  "loyaltyPointsEarned": 40,
  "estimatedReadyAt": "2025-11-25T18:45:00Z",
  "createdAt": "2025-11-25T18:30:00Z"
}
```

### GET /api/orders/{id} — Get Order Details

**Response (200 OK):**

```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440006",
  "orderNumber": "ORD-2025-001234",
  "status": "IN_PROGRESS",
  "type": "DINE_IN",
  "table": { "id": "...", "tableNumber": "T5" },
  "customer": { "id": "...", "firstName": "John", "lastName": "Doe" },
  "items": [
    {
      "id": "...",
      "menuItem": { "id": "...", "name": "Margherita Pizza" },
      "quantity": 2,
      "unitPrice": 18.50,
      "total": 37.00,
      "status": "PREPARING",
      "modifiers": [{ "name": "Extra Cheese", "priceAdjustment": 2.50 }]
    }
  ],
  "subtotal": 45.00,
  "taxAmount": 4.05,
  "discountAmount": 9.00,
  "totalAmount": 40.05,
  "statusHistory": [
    { "status": "PENDING", "createdAt": "2025-11-25T18:30:00Z" },
    { "status": "CONFIRMED", "createdAt": "2025-11-25T18:31:00Z" },
    { "status": "IN_PROGRESS", "createdAt": "2025-11-25T18:32:00Z" }
  ]
}
```

### PATCH /api/orders/{id}/status — Update Order Status

**Request:**

```json
{
  "status": "READY",
  "notes": "Ready for pickup at counter"
}
```

---

## Inventory API

### POST /api/inventory/adjust — Adjust Stock

**Request:**

```json
{
  "ingredientId": "cc0e8400-e29b-41d4-a716-446655440007",
  "locationId": "660e8400-e29b-41d4-a716-446655440001",
  "type": "ADJUSTMENT",
  "quantity": -5.5,
  "reason": "Spillage during prep",
  "notes": "Accidental spill in kitchen"
}
```

**Response (200 OK):**

```json
{
  "id": "dd0e8400-e29b-41d4-a716-446655440008",
  "ingredientId": "cc0e8400-e29b-41d4-a716-446655440007",
  "previousStock": 25.0,
  "newStock": 19.5,
  "adjustment": -5.5,
  "type": "ADJUSTMENT",
  "createdAt": "2025-11-25T18:30:00Z"
}
```

### GET /api/inventory/low-stock — Get Low Stock Alerts

**Response:**

```json
{
  "items": [
    {
      "ingredientId": "...",
      "name": "Mozzarella Cheese",
      "currentStock": 2.5,
      "reorderPoint": 10.0,
      "unit": "kg",
      "suggestedOrderQty": 20.0,
      "preferredSupplier": { "id": "...", "name": "Dairy Direct" }
    }
  ],
  "totalAlerts": 3
}
```

---

## Customer API

### GET /api/customers/{id}/loyalty — Get Loyalty Status

**Response:**

```json
{
  "customerId": "880e8400-e29b-41d4-a716-446655440003",
  "currentPoints": 1250,
  "tier": "GOLD",
  "tierProgress": {
    "currentTier": "GOLD",
    "nextTier": "PLATINUM",
    "pointsToNextTier": 750,
    "progressPercent": 62.5
  },
  "expiringPoints": {
    "points": 200,
    "expiresAt": "2025-12-31T23:59:59Z"
  },
  "recentTransactions": [
    { "type": "EARN", "points": 45, "orderId": "...", "createdAt": "..." },
    { "type": "REDEEM", "points": -100, "orderId": "...", "createdAt": "..." }
  ],
  "availableRewards": [
    { "id": "...", "name": "Free Dessert", "pointsCost": 500 },
    { "id": "...", "name": "20% Off Order", "pointsCost": 1000 }
  ]
}
```

---

## Finance API

### GET /api/finance/reports?period=monthly — Get Sales Report

**Query Parameters:**
- `period`: daily | weekly | monthly
- `startDate`: ISO date
- `endDate`: ISO date
- `locationId`: Optional filter

**Response:**

```json
{
  "period": "monthly",
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "summary": {
    "totalRevenue": 125000.00,
    "totalOrders": 3250,
    "averageOrderValue": 38.46,
    "totalTax": 11250.00,
    "totalDiscounts": 5000.00,
    "netRevenue": 108750.00
  },
  "breakdown": {
    "byType": {
      "DINE_IN": { "revenue": 75000.00, "orders": 1950 },
      "TAKEOUT": { "revenue": 30000.00, "orders": 800 },
      "DELIVERY": { "revenue": 20000.00, "orders": 500 }
    },
    "byPaymentMethod": {
      "CARD": { "amount": 100000.00, "count": 2600 },
      "CASH": { "amount": 20000.00, "count": 550 },
      "DIGITAL_WALLET": { "amount": 5000.00, "count": 100 }
    },
    "topItems": [
      { "menuItemId": "...", "name": "Margherita Pizza", "quantity": 450, "revenue": 8325.00 }
    ]
  },
  "comparison": {
    "previousPeriod": {
      "revenue": 118000.00,
      "orders": 3100,
      "changePercent": 5.93
    }
  }
}
```

---

## Authentication

All endpoints require `Authorization: Bearer <JWT>` header except public menu endpoints.

### Error Response Format

```json
{
  "timestamp": "2025-11-25T18:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid order type",
  "path": "/api/orders",
  "traceId": "abc123def456"
}
```
