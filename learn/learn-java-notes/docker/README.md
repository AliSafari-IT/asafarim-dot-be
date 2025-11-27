# 🐳 Docker Setup for `learn-java-notes`

This folder documents the **Docker setup** used by the `learn-java-notes` project,
specifically the **PostgreSQL database** that backs the `java-notes-api` Spring Boot app.

The goal is to have a **repeatable, persistent, isolated DB** for your Java playground.

## 📁 Folder & File Layout

Typical structure:

```txt
learn-java-notes/
├── docker-compose.yml      # Main compose file (at repo root)
├── docker/
│   ├── README.md           # You are here
│   └── init.sql            # (optional) initial SQL script
├── java-notes-api/
└── java-notes-ui/
````

> Note: Your `docker-compose.yml` may mount `./init.sql` from the repo root
> or `./docker/init.sql`. Both are fine as long as the path matches.

## 🧱 PostgreSQL Service

The compose file (simplified) looks like this:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: notes-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: notes_db
      POSTGRES_USER: USER
      POSTGRES_PASSWORD: PASSWORD
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro

volumes:
  postgres_data:
```

### 🔑 Environment variables

* `POSTGRES_DB` → database name (e.g. `notes_db`)
* `POSTGRES_USER` → database user (e.g. `postgres` or `notes_user`)
* `POSTGRES_PASSWORD` → strong local dev password

> For safety, you can move real credentials into a `.env` file and reference them in compose.

---

## 🚀 Starting & Stopping the Database

From the **root** of `learn-java-notes`:

### Start (detached)

```bash
docker compose up -d
```

### Stop (containers only)

```bash
docker compose down
```

### Stop & remove containers + network, keep data

```bash
docker compose down
```

The `postgres_data` volume keeps your data across restarts.

---

## 📋 Verifying the Database Is Running

Check container status:

```bash
docker ps
```

You should see something like:

```txt
notes-postgres   postgres:16-alpine   Up ...   0.0.0.0:5432->5432/tcp
```

Check logs:

```bash
docker logs notes-postgres
```

---

## 🔗 Connecting from Spring Boot

Your `java-notes-api` should use a JDBC URL like:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/notes_db
spring.datasource.username=USER
spring.datasource.password=PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.show-sql=true
```

Once the container is running and Spring Boot is started:

```bash
cd java-notes-api
pnpm start
```

The API will talk to the PostgreSQL container on `localhost:5432`.

---

## 🧪 Connecting with psql (CLI)

If you have `psql` installed:

```bash
psql -h localhost -U USER -d notes_db
```

You’ll be prompted for the password you set in `POSTGRES_PASSWORD`.

Example queries:

```sql
\dt                     -- list tables
SELECT * FROM study_note;
SELECT * FROM tag;
SELECT * FROM study_note_tags;
```

---

## 🧾 init.sql (Optional Seed Script)

The `init.sql` file (mounted via `docker-compose.yml`) is executed **once** on first startup of the container.

Example `docker/init.sql`:

```sql
-- Example: enable useful extension (if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Optional: insert a default tag
INSERT INTO tag (name)
VALUES ('general')
ON CONFLICT DO NOTHING;
```

> Important: `init.sql` runs only when the database **data directory is empty**
> (i.e., first container startup or after volume removal).

---

## 🔄 Resetting the Database (Dev Only)

If you want a fresh DB (danger: deletes all data):

```bash
docker compose down
docker volume rm learn-java-notes_postgres_data   # volume name may differ
docker compose up -d
```

Or list volumes and pick the right one:

```bash
docker volume ls
docker volume rm <volume-name>
```

---

## 🧰 Common Commands Summary

```bash
# Start DB
docker compose up -d

# Stop DB
docker compose down

# See running containers
docker ps

# See logs
docker logs notes-postgres

# Open psql shell
psql -h localhost -U USER -d notes_db
```

---

## 🌱 Next Steps (Docker Side)

Later you can extend this Docker setup with:

* `pgadmin` service for a web-based DB UI
* Backups (cron-based or manual `pg_dump`)
* Separate networks for API + DB
* Environment-specific compose files:

  * `docker-compose.dev.yml`
  * `docker-compose.prod.yml`
