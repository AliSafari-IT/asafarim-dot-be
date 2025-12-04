# Workflow Diagrams

## 1. Order Lifecycle

```text
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ PENDING │───►│CONFIRMED│───►│IN_PROG  │───►│  READY  │───►│COMPLETED│
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │              │
     └──────────────┴──────────────┴──────────────┴──────────────┘
                                   │
                                   ▼
                            ┌───────────┐
                            │ CANCELLED │
                            └───────────┘

Sequence: Place Order
═══════════════════════════════════════════════════════════════════════

Client              API Gateway         Order Svc         Inventory      Kafka
  │                     │                   │                 │           │
  │ POST /orders        │                   │                 │           │
  │────────────────────►│                   │                 │           │
  │                     │ validate JWT      │                 │           │
  │                     │──────────┐        │                 │           │
  │                     │◄─────────┘        │                 │           │
  │                     │                   │                 │           │
  │                     │ forward request   │                 │           │
  │                     │──────────────────►│                 │           │
  │                     │                   │ validate items  │           │
  │                     │                   │──────────┐      │           │
  │                     │                   │◄─────────┘      │           │
  │                     │                   │                 │           │
  │                     │                   │ check stock     │           │
  │                     │                   │────────────────►│           │
  │                     │                   │◄────────────────│           │
  │                     │                   │                 │           │
  │                     │                   │ save order      │           │
  │                     │                   │──────────┐      │           │
  │                     │                   │◄─────────┘      │           │
  │                     │                   │                 │           │
  │                     │                   │ publish event   │           │
  │                     │                   │────────────────────────────►│
  │                     │                   │                 │           │
  │                     │ OrderResponse     │                 │           │
  │◄────────────────────│◄──────────────────│                 │           │
  │                     │                   │                 │           │
```

## 2. Inventory Decrement & Restocking

```text
Sequence: Auto Stock Adjustment on Order
═══════════════════════════════════════════════════════════════════════

Order Svc           Kafka              Inventory Svc      Notification
    │                 │                      │                 │
    │ order.placed    │                      │                 │
    │────────────────►│                      │                 │
    │                 │ consume event        │                 │
    │                 │─────────────────────►│                 │
    │                 │                      │                 │
    │                 │                      │ get recipes     │
    │                 │                      │───────┐         │
    │                 │                      │◄──────┘         │
    │                 │                      │                 │
    │                 │                      │ decrement stock │
    │                 │                      │───────┐         │
    │                 │                      │◄──────┘         │
    │                 │                      │                 │
    │                 │                      │ check threshold │
    │                 │                      │───────┐         │
    │                 │                      │◄──────┘         │
    │                 │                      │                 │
    │                 │   [if low stock]     │                 │
    │                 │                      │ inventory.low   │
    │                 │◄─────────────────────│                 │
    │                 │                      │                 │
    │                 │ consume low-stock    │                 │
    │                 │─────────────────────────────────────────►│
    │                 │                      │                 │
    │                 │                      │                 │ send alert
    │                 │                      │                 │──────┐
    │                 │                      │                 │◄─────┘
```

## 3. Loyalty Points Flow

```text
Sequence: Earn & Redeem Points
═══════════════════════════════════════════════════════════════════════

Client          Order Svc         Customer Svc        Kafka
   │                │                   │               │
   │ place order    │                   │               │
   │ (use 100 pts)  │                   │               │
   │───────────────►│                   │               │
   │                │ validate points   │               │
   │                │──────────────────►│               │
   │                │◄──────────────────│               │
   │                │                   │               │
   │                │ deduct points     │               │
   │                │──────────────────►│               │
   │                │◄──────────────────│               │
   │                │                   │               │
   │                │ save order        │               │
   │                │──────┐            │               │
   │                │◄─────┘            │               │
   │                │                   │               │
   │                │ order.completed   │               │
   │                │──────────────────────────────────►│
   │                │                   │               │
   │                │           consume │◄──────────────│
   │                │                   │               │
   │                │                   │ calc earned   │
   │                │                   │──────┐        │
   │                │                   │◄─────┘        │
   │                │                   │               │
   │                │                   │ credit points │
   │                │                   │──────┐        │
   │                │                   │◄─────┘        │
   │◄───────────────│                   │               │
   │  (40 pts earned)                   │               │
```

## 4. Error Handling & Retry Flow

```text
Sequence: Payment Failure with Retry
═══════════════════════════════════════════════════════════════════════

Order Svc         Payment Svc        Stripe API       Dead Letter Q
    │                  │                  │                 │
    │ process payment  │                  │                 │
    │─────────────────►│                  │                 │
    │                  │ charge card      │                 │
    │                  │─────────────────►│                 │
    │                  │                  │                 │
    │                  │    [FAILURE]     │                 │
    │                  │◄─────────────────│                 │
    │                  │                  │                 │
    │                  │ retry (1/3)      │                 │
    │                  │─────────────────►│                 │
    │                  │◄─────────────────│ [FAILURE]       │
    │                  │                  │                 │
    │                  │ retry (2/3)      │                 │
    │                  │─────────────────►│                 │
    │                  │◄─────────────────│ [FAILURE]       │
    │                  │                  │                 │
    │                  │ retry (3/3)      │                 │
    │                  │─────────────────►│                 │
    │                  │◄─────────────────│ [FAILURE]       │
    │                  │                  │                 │
    │                  │ to dead letter   │                 │
    │                  │─────────────────────────────────────►│
    │                  │                  │                 │
    │ PaymentFailed    │                  │                 │
    │◄─────────────────│                  │                 │
    │                  │                  │                 │
    │ update status    │                  │                 │
    │ PAYMENT_FAILED   │                  │                 │
    │──────┐           │                  │                 │
    │◄─────┘           │                  │                 │


Retry Policy:
┌─────────────────────────────────────────────────────────────────┐
│ Max Retries: 3                                                  │
│ Backoff: Exponential (1s, 2s, 4s)                               │
│ Dead Letter Topic: payments.failed                              │
│ Alert: Notify ops team after DLQ                                │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Kitchen Display Flow

```text
Sequence: Kitchen Display Update
═══════════════════════════════════════════════════════════════════════

POS              Order Svc           Kafka           Kitchen Display
 │                   │                 │                   │
 │ submit order      │                 │                   │
 │──────────────────►│                 │                   │
 │                   │ save + publish  │                   │
 │                   │────────────────►│                   │
 │◄──────────────────│                 │                   │
 │                   │                 │ order.placed      │
 │                   │                 │──────────────────►│
 │                   │                 │                   │
 │                   │                 │                   │ display order
 │                   │                 │                   │───────┐
 │                   │                 │                   │◄──────┘
 │                   │                 │                   │
 │                   │                 │                   │ [chef marks
 │                   │                 │                   │  item ready]
 │                   │                 │                   │
 │                   │                 │ item.prepared     │
 │                   │◄────────────────│◄──────────────────│
 │                   │                 │                   │
 │                   │ update item     │                   │
 │                   │ status          │                   │
 │                   │──────┐          │                   │
 │                   │◄─────┘          │                   │
 │                   │                 │                   │
 │                   │ [all items done]│                   │
 │                   │ update order    │                   │
 │                   │ status = READY  │                   │
 │                   │────────────────►│                   │
 │                   │                 │                   │
 │                   │                 │ order.ready       │
 │ notification      │                 │──────────────────►│
 │◄──────────────────│◄────────────────│                   │
```
