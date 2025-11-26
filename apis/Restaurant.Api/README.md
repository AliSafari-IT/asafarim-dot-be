# Restaurant Management System API

Production-ready Restaurant Management System backend built with **Java 21** and **Spring Boot 3.3**.

## Quick Start

### Prerequisites

- Java 21+
- Maven 3.9+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Run Locally

```bash
# Start dependencies (PostgreSQL, Redis, Kafka)
docker-compose up -d

# Run the application
./mvnw spring-boot:run

# Or with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Access

- **API**: http://localhost:8081/api
- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **API Docs**: http://localhost:8081/api-docs
- **Health**: http://localhost:8081/actuator/health

## Project Structure

```text
apis/Restaurant.Api/
├── docs/                          # System design documentation
│   ├── 01-ARCHITECTURE.md         # Architecture overview
│   ├── 02-DATABASE-SCHEMA.sql     # PostgreSQL schema
│   ├── 03-API-SPECIFICATION.md    # OpenAPI-style endpoints
│   ├── 04-WORKFLOWS.md            # Sequence diagrams
│   ├── 05-SECURITY.md             # Security architecture
│   └── 06-DEPLOYMENT.md           # Deployment & operations
├── src/main/java/be/asafarim/rms/
│   ├── api/                       # REST controllers & DTOs
│   │   └── order/
│   │       ├── OrderController.java
│   │       └── dto/
│   ├── domain/                    # Domain entities
│   │   └── order/
│   ├── exception/                 # Exception handling
│   ├── repository/                # JPA repositories
│   ├── service/                   # Business logic
│   └── RestaurantApiApplication.java
├── src/main/resources/
│   ├── application.yml            # Configuration
│   └── db/migration/              # Flyway migrations
└── pom.xml
```

## API Examples

### Place Order

```bash
curl -X POST http://localhost:8081/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "550e8400-e29b-41d4-a716-446655440000",
    "locationId": "660e8400-e29b-41d4-a716-446655440001",
    "type": "DINE_IN",
    "tableId": "770e8400-e29b-41d4-a716-446655440002",
    "items": [
      {
        "menuItemId": "990e8400-e29b-41d4-a716-446655440004",
        "quantity": 2,
        "notes": "No onions"
      }
    ],
    "notes": "Birthday celebration"
  }'
```

### Get Order

```bash
curl http://localhost:8081/api/orders/{orderId}
```

### Update Order Status

```bash
curl -X PATCH http://localhost:8081/api/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED", "notes": "Confirmed by kitchen"}'
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_USERNAME` | rms_user | PostgreSQL username |
| `DB_PASSWORD` | rms_password | PostgreSQL password |
| `REDIS_HOST` | localhost | Redis host |
| `KAFKA_SERVERS` | localhost:9092 | Kafka bootstrap servers |

## Testing

```bash
# Unit tests
./mvnw test

# Integration tests
./mvnw verify -Pintegration-test

# With coverage
./mvnw verify jacoco:report
```

## Docker

```bash
# Build image
docker build -t rms/order-service:latest .

# Run container
docker run -p 8081:8081 \
  -e DB_USERNAME=rms_user \
  -e DB_PASSWORD=rms_password \
  rms/order-service:latest
```

## Documentation

See the `/docs` folder for complete system design:

1. **Architecture** - Microservice topology, tech stack, trade-offs
2. **Database Schema** - PostgreSQL DDL for all entities
3. **API Specification** - OpenAPI-style endpoint documentation
4. **Workflows** - Sequence diagrams for order lifecycle, inventory, loyalty
5. **Security** - JWT, RBAC, PCI compliance, audit logging
6. **Deployment** - Kubernetes, CI/CD, observability, testing strategy

## License

CC BY 4.0 - ASafariM
