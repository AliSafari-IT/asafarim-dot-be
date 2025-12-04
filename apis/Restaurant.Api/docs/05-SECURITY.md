# Security Architecture

## Authentication & Authorization

### JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "rms-key-2025"
  },
  "payload": {
    "sub": "user-uuid",
    "iss": "https://auth.restaurant.asafarim.be",
    "aud": ["rms-api"],
    "exp": 1732567800,
    "iat": 1732564200,
    "roles": ["MANAGER", "POS_USER"],
    "restaurantId": "restaurant-uuid",
    "locationIds": ["loc-1", "loc-2"],
    "permissions": ["orders:create", "orders:read", "inventory:read"]
  }
}
```

### RBAC Matrix

| Role | Orders | Inventory | Customers | Finance | Admin |
|------|--------|-----------|-----------|---------|-------|
| OWNER | Full | Full | Full | Full | Full |
| MANAGER | Full | Full | Full | Read | Limited |
| SUPERVISOR | Full | Read/Write | Read | None | None |
| POS_USER | Create/Read | Read | Read | None | None |
| KITCHEN | Read | Read | None | None | None |
| DELIVERY | Read/Update | None | Read | None | None |

### Permission Scopes

```text
orders:create    - Place new orders
orders:read      - View order details
orders:update    - Modify order status
orders:cancel    - Cancel/void orders
orders:refund    - Process refunds

inventory:read   - View stock levels
inventory:write  - Adjust stock
inventory:order  - Create purchase orders

customers:read   - View customer profiles
customers:write  - Edit customer data
customers:loyalty - Manage loyalty points

finance:read     - View reports
finance:export   - Export financial data

admin:users      - Manage staff accounts
admin:settings   - Configure restaurant settings
```

---

## Security Controls

### API Security

```yaml
Rate Limiting:
  - Anonymous: 100 req/min
  - Authenticated: 1000 req/min
  - POS Devices: 5000 req/min (higher for peak hours)

Request Validation:
  - Input sanitization on all endpoints
  - Request size limit: 1MB
  - SQL injection prevention via parameterized queries
  - XSS prevention via output encoding

Transport Security:
  - TLS 1.3 required
  - HSTS enabled
  - Certificate pinning for mobile apps
```

### PCI DSS Compliance

```text
Payment Data Handling:
┌──────────────────────────────────────────────────────────────────┐
│                       PCI Scope Reduction                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Client ───► Payment Form (Stripe.js) ───► Stripe API            │
│     │                                           │                 │
│     │        Card data NEVER touches            │                 │
│     │        our servers                        │                 │
│     ▼                                           ▼                 │
│  RMS Backend ◄────────────────────────── Payment Token           │
│     │                                                             │
│     │  We only store:                                             │
│     │  • Payment token (stripe_pm_xxx)                            │
│     │  • Last 4 digits                                            │
│     │  • Card brand                                               │
│     │  • Transaction ID                                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Data Protection

```text
PII Handling:
- Customer emails/phones: Encrypted at rest (AES-256)
- Addresses: Encrypted at rest
- Payment tokens: Vault storage (HashiCorp Vault)
- Audit logs: Immutable, retained 7 years

Data Retention:
- Active customer data: Indefinite
- Deleted customer data: 30 days soft delete, then purge
- Order history: 7 years (tax compliance)
- Audit logs: 7 years
- Session data: 24 hours

GDPR Compliance:
- Right to access: Export endpoint
- Right to erasure: Anonymization workflow
- Data portability: JSON export
- Consent tracking: Preference center
```

---

## Infrastructure Security

### Network Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Public Internet                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                        ┌───────▼───────┐
                        │   WAF / DDoS  │
                        │   (Cloudflare)│
                        └───────┬───────┘
                                │
                        ┌───────▼───────┐
                        │ Load Balancer │
                        │   (HAProxy)   │
                        └───────┬───────┘
                                │
═══════════════════════════════════════════════════ DMZ
                                │
                        ┌───────▼───────┐
                        │  API Gateway  │
                        │ (Spring Cloud)│
                        └───────┬───────┘
                                │
═══════════════════════════════════════════════════ Private Subnet
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐
│  Service Mesh │       │  Service Mesh │       │  Service Mesh │
│   (Order Svc) │       │ (Inventory)   │       │  (Payment)    │
└───────────────┘       └───────────────┘       └───────────────┘
        │                       │                       │
═══════════════════════════════════════════════════ Data Subnet
        │                       │                       │
┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐
│  PostgreSQL   │       │    Redis      │       │    Kafka      │
│   (Primary)   │       │   Cluster     │       │   Cluster     │
└───────────────┘       └───────────────┘       └───────────────┘
```

### Secrets Management

```yaml
HashiCorp Vault Configuration:
  secrets:
    - path: rms/database
      keys: [username, password, connection_string]
    
    - path: rms/stripe
      keys: [api_key, webhook_secret]
    
    - path: rms/jwt
      keys: [private_key, public_key]
  
  policies:
    order-service:
      - path: rms/database/orders
        capabilities: [read]
      - path: rms/jwt
        capabilities: [read]
    
    payment-service:
      - path: rms/database/payments
        capabilities: [read]
      - path: rms/stripe
        capabilities: [read]
```

---

## Audit & Compliance

### Audit Log Schema

```json
{
  "id": "audit-uuid",
  "timestamp": "2025-11-25T18:30:00Z",
  "actor": {
    "userId": "user-uuid",
    "roles": ["MANAGER"],
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  },
  "action": "ORDER_REFUND",
  "resource": {
    "type": "ORDER",
    "id": "order-uuid"
  },
  "changes": {
    "before": { "status": "COMPLETED", "totalAmount": 45.00 },
    "after": { "status": "REFUNDED", "refundAmount": 45.00 }
  },
  "metadata": {
    "reason": "Customer complaint",
    "approvedBy": "manager-uuid"
  }
}
```

### Security Monitoring

```yaml
Alerts:
  - name: Failed Login Attempts
    threshold: 5 failures in 10 minutes
    action: Lock account, notify security

  - name: Unusual Refund Activity
    threshold: 10 refunds in 1 hour by same user
    action: Alert manager, require approval

  - name: After-Hours Access
    condition: Access outside business hours
    action: Log and notify owner

  - name: Bulk Data Export
    threshold: >1000 records exported
    action: Require manager approval
```
