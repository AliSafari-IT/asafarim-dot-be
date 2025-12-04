# Restaurant Management System - Architecture

## Executive Summary

Production-ready RMS designed to scale from single restaurants to large chains handling >100k orders/minute at peak.

### Key Design Principles
- **Domain-Driven Design (DDD):** Clear bounded contexts per service
- **Event Sourcing:** For order lifecycle and audit trails
- **CQRS:** Separate read/write models for high-throughput POS
- **Polyglot Persistence:** SQL for transactions, NoSQL for analytics

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Mobile App  │  │  POS Device  │  │  Admin Panel │     │
│  │  (React+TS)  │  │ (React Native)│  │   (Kiosk)   │  │   (React)    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼─────────────────┼─────────────────┼─────────────────┼─────────────┘
          └────────────────┬┴─────────────────┴─────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────────────┐
│                           GATEWAY LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     API Gateway (Spring Cloud Gateway)               │    │
│  │  • Rate Limiting  • JWT Validation  • Request Routing  • SSL Term   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                          MICROSERVICES LAYER                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Order Svc   │  │ Inventory   │  │ Customer    │  │ Finance Svc │         │
│  │ (POS Core)  │  │   Service   │  │   Service   │  │ (Reporting) │         │
│  │  Port 8081  │  │  Port 8082  │  │  Port 8083  │  │  Port 8084  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Menu Svc    │  │ Notification│  │ Payment Svc │  │ Analytics   │         │
│  │ (Catalog)   │  │   Service   │  │ (Gateway)   │  │   Service   │         │
│  │  Port 8085  │  │  Port 8086  │  │  Port 8087  │  │  Port 8088  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                          MESSAGING LAYER (Apache Kafka)                      │
│  Topics: orders.placed | inventory.updated | payments.processed              │
│          orders.completed | inventory.low-stock | notifications.send         │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                           DATA LAYER                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │   PostgreSQL        │  │   MongoDB           │  │   Redis             │  │
│  │   (Transactional)   │  │   (Analytics/Logs)  │  │   (Cache/Sessions)  │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Service Responsibilities

| Service | Port | Database | Key Entities |
|---------|------|----------|--------------|
| **Order Service** | 8081 | PostgreSQL | Orders, OrderItems, OrderStatus |
| **Menu Service** | 8085 | PostgreSQL + Redis | MenuItems, Categories, Modifiers |
| **Inventory Service** | 8082 | PostgreSQL | Ingredients, Stock, Recipes |
| **Customer Service** | 8083 | PostgreSQL | Customers, LoyaltyPoints |
| **Payment Service** | 8087 | PostgreSQL | Transactions, Refunds |
| **Finance Service** | 8084 | PostgreSQL + TimescaleDB | Reports, Expenses |
| **Notification Service** | 8086 | MongoDB | Templates, DeliveryLogs |
| **Analytics Service** | 8088 | MongoDB + Elasticsearch | Events, Aggregations |

---

## Design Trade-offs

| Decision | Trade-off | Rationale |
|----------|-----------|-----------|
| Microservices over Monolith | Operational complexity vs. scalability | Individual service scaling for POS peaks |
| PostgreSQL for transactions | Schema rigidity vs. ACID guarantees | Financial data requires strong consistency |
| Kafka over RabbitMQ | Learning curve vs. throughput | 100k+ orders/min requires Kafka's partitioning |
| Redis for caching | Memory cost vs. latency | Sub-second POS requires in-memory cache |
| Event Sourcing for Orders | Storage overhead vs. auditability | Complete order history for compliance |
