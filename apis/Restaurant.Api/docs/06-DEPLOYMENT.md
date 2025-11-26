# Deployment & Infrastructure

## Kubernetes Architecture

```yaml
# Namespace structure
namespaces:
  - rms-production
  - rms-staging
  - rms-development
  - rms-monitoring
  - rms-data

# Service deployment pattern
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  namespace: rms-production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
        version: v1.2.0
    spec:
      containers:
      - name: order-service
        image: registry.asafarim.be/rms/order-service:1.2.0
        ports:
        - containerPort: 8081
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8081
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8081
          initialDelaySeconds: 5
          periodSeconds: 5
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "production"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
```

## CI/CD Pipeline (GitHub Actions)

```yaml
name: RMS Backend CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      
      - name: Run Tests
        run: ./mvnw verify -Ptest
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker Image
        run: |
          docker build -t rms/order-service:${{ github.sha }} .
          docker push registry.asafarim.be/rms/order-service:${{ github.sha }}

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        run: |
          kubectl set image deployment/order-service \
            order-service=registry.asafarim.be/rms/order-service:${{ github.sha }} \
            -n rms-staging

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Canary Deploy (10%)
        run: |
          kubectl apply -f k8s/canary-deployment.yaml
      
      - name: Wait for Metrics
        run: sleep 300
      
      - name: Check Error Rate
        run: |
          ERROR_RATE=$(curl -s prometheus/api/v1/query?query=error_rate)
          if [ "$ERROR_RATE" -gt "1" ]; then
            kubectl rollback deployment/order-service
            exit 1
          fi
      
      - name: Full Rollout
        run: |
          kubectl set image deployment/order-service \
            order-service=registry.asafarim.be/rms/order-service:${{ github.sha }} \
            -n rms-production
```

## Database Migration Strategy

```text
Flyway Migration Pattern:
═══════════════════════════════════════════════════════════════════════

migrations/
├── V1__initial_schema.sql
├── V2__add_loyalty_tables.sql
├── V3__add_delivery_tracking.sql
├── V4__optimize_order_indexes.sql
└── V5__add_multi_currency.sql

Rules:
1. Migrations are immutable once deployed
2. Backward compatible changes only (no column drops in prod)
3. Add columns as nullable, backfill, then add NOT NULL
4. Large data migrations run as background jobs
5. Test migrations against production snapshot

Rollback Strategy:
- Each migration has corresponding R__rollback script
- Automated rollback on deployment failure
- Manual approval required for data-altering rollbacks
```

---

# Observability & Operations

## Monitoring Stack

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Grafana Dashboard                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Service SLOs│  │ Order Flow  │  │  Inventory  │              │
│  │             │  │             │  │   Alerts    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
         ▲                  ▲                  ▲
         │                  │                  │
┌────────┴──────────────────┴──────────────────┴──────────────────┐
│                        Prometheus                                │
│  Metrics: http_requests_total, order_processing_seconds,         │
│           inventory_stock_level, payment_success_rate            │
└─────────────────────────────────────────────────────────────────┘
         ▲                  ▲                  ▲
         │                  │                  │
   ┌─────┴─────┐      ┌─────┴─────┐      ┌─────┴─────┐
   │Order Svc  │      │Payment Svc│      │Inventory  │
   │/metrics   │      │/metrics   │      │/metrics   │
   └───────────┘      └───────────┘      └───────────┘
```

## Key Metrics & SLOs

```yaml
SLOs:
  order_availability:
    target: 99.9%
    window: 30d
    indicator: successful_orders / total_orders
  
  order_latency_p99:
    target: 500ms
    window: 30d
    indicator: histogram_quantile(0.99, order_duration_seconds)
  
  payment_success_rate:
    target: 99.5%
    window: 7d
    indicator: successful_payments / total_payments

Alerts:
  - name: HighOrderLatency
    expr: histogram_quantile(0.99, order_duration_seconds) > 1
    severity: warning
    
  - name: LowStockCritical
    expr: inventory_stock_level < reorder_point * 0.5
    severity: critical
    
  - name: PaymentFailureSpike
    expr: rate(payment_failures_total[5m]) > 0.1
    severity: critical
```

## Logging (ELK Stack)

```json
{
  "timestamp": "2025-11-25T18:30:00.123Z",
  "level": "INFO",
  "service": "order-service",
  "traceId": "abc123def456",
  "spanId": "span789",
  "message": "Order placed successfully",
  "context": {
    "orderId": "order-uuid",
    "restaurantId": "restaurant-uuid",
    "customerId": "customer-uuid",
    "totalAmount": 45.00,
    "itemCount": 3
  },
  "duration_ms": 125
}
```

---

# Testing Strategy

```text
Test Pyramid:
═══════════════════════════════════════════════════════════════════════

                    ┌─────────────────┐
                    │   E2E Tests     │  ← 5% (Critical flows only)
                    │   (Playwright)  │
                    ├─────────────────┤
                    │ Integration     │  ← 20% (API contracts)
                    │ (Testcontainers)│
                    ├─────────────────┤
                    │   Unit Tests    │  ← 75% (Business logic)
                    │    (JUnit 5)    │
                    └─────────────────┘

Coverage Targets:
- Unit: 80% line coverage
- Integration: All API endpoints
- E2E: Order placement, payment, refund flows

Load Testing (k6):
- Baseline: 1000 orders/min for 10 min
- Stress: Ramp to 10,000 orders/min
- Spike: Sudden 5x traffic increase
- Soak: 1000 orders/min for 4 hours
```

---

# Implementation Roadmap

## Phase 1: Foundation (Weeks 1-4)

- [ ] Project scaffolding (Spring Boot, Maven)
- [ ] PostgreSQL schema and Flyway migrations
- [ ] Core domain models (Restaurant, Menu, Order)
- [ ] Order Service: CRUD + basic workflow
- [ ] Authentication with JWT
- [ ] Basic CI/CD pipeline

## Phase 2: Core Features (Weeks 5-8)

- [ ] Menu Service with Redis caching
- [ ] Inventory Service with stock tracking
- [ ] Customer Service with loyalty basics
- [ ] Kafka integration for async events
- [ ] Kitchen Display WebSocket API
- [ ] Integration tests with Testcontainers

## Phase 3: Payments & Finance (Weeks 9-12)

- [ ] Payment Service with Stripe integration
- [ ] Refund workflow
- [ ] Finance reporting endpoints
- [ ] PCI compliance review
- [ ] Load testing baseline

## Phase 4: Frontend MVP (Weeks 13-16)

- [ ] React app scaffolding
- [ ] POS interface (order placement)
- [ ] Kitchen display
- [ ] Basic admin dashboard
- [ ] Mobile-responsive design

## Phase 5: Advanced Features (Weeks 17-20)

- [ ] Multi-location support
- [ ] Advanced analytics
- [ ] Notification service (email/SMS)
- [ ] Delivery tracking
- [ ] Third-party integrations (Uber Eats, etc.)

## Phase 6: Production Readiness (Weeks 21-24)

- [ ] Security audit
- [ ] Performance optimization
- [ ] Disaster recovery testing
- [ ] Documentation finalization
- [ ] Production deployment
