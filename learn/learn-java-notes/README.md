# 📘 learn-java-notes root-level README

*A fullstack Java + React TypeScript learning environment designed to grow from simple CRUD → to a production-grade knowledge app.*
This repository contains two main projects:

* **java-notes-api** → Spring Boot backend
* **java-notes-ui** → React TypeScript frontend

Together they form a clean, realistic fullstack system for experimenting, learning, and extending with modern backend & frontend features.

---

## 🏗️ Folder Structure

```
learn-java-notes/
├── java-notes-api/     # Backend (Spring Boot 3.x + Java 21)
│   ├── pom.xml
│   ├── src/
│   └── README.md (optional)
├── java-notes-ui/      # Frontend (React + TypeScript + Vite)
│   ├── package.json
│   ├── src/
│   └── README.md       # Detailed UI documentation
├── docker-compose.yml  # PostgreSQL database
└── README.md           # You are here (root overview)
```

---

## 🚀 Getting Started

This project uses:

* **pnpm** for frontend
* **maven** for backend
* **Docker** for PostgreSQL
* **Java 21**

---

### 1️⃣ Start the PostgreSQL Database (Docker)

Make sure Docker Desktop is running.

```
docker compose up -d
```

This starts:

* PostgreSQL 16 (Alpine)
* Database name: `notes_db`
* Persistent volume: `postgres_data`

Check logs:

```bash
docker logs notes-postgres
```

---

### 2️⃣ Start the Backend (Spring Boot API)

```bash
cd java-notes-api
pnpm start
```

This runs:

* Spring Boot
* Port: **8080**
* PostgreSQL connected
* Auto-create tables (notes, tags, join table)

Health check:

```
GET http://localhost:8080/api/health
```

---

### 3️⃣ Start the Frontend (React UI)

```bash
cd java-notes-ui
pnpm start
```

Opens the UI on:

```
http://localhost:5183
```

Supports:

* CRUD notes
* Tags
* Search
* Sorting
* Markdown
* Tag filtering
* Note details view
* Create/Edit note forms

For detailed UI features → see:
`java-notes-ui/README.md`

---

## 📡 API Summary

| Method | Endpoint          | Description                            |
| ------ | ----------------- | -------------------------------------- |
| GET    | `/api/notes`      | List (supports `query`, `tag`, `sort`) |
| GET    | `/api/notes/{id}` | Retrieve single note                   |
| POST   | `/api/notes`      | Create note                            |
| PUT    | `/api/notes/{id}` | Update note                            |
| DELETE | `/api/notes/{id}` | Delete note                            |
| GET    | `/api/tags`       | List used tags                         |
| GET    | `/api/tags/all`   | List all tags                          |

---

## 🧩 Current Features Implemented

### Backend

✔ Spring Boot 3 + Java 21
✔ PostgreSQL
✔ CRUD Notes
✔ Tag System (Many-to-Many)
✔ Search
✔ Tag Filtering
✔ Sorting
✔ Metadata (reading time + word count)
✔ Custom DTOs
✔ Services + Repositories
✔ Docker Compose
✔ Full REST API

### Frontend

✔ React 18 + TypeScript
✔ Vite
✔ Shared UI tokens & themes
✔ Notes list page
✔ Markdown-friendly note details
✔ Create/Edit note pages
✔ TagInput control
✔ Tag badges
✔ Search with debounce
✔ Sorting UI
✔ Combined filtering
✔ Improved metadata UI

---

## 🧭 Roadmap

You now have a **fully working mini Notion-style notes application**.

Next steps transform this playground into a near-production fullstack system.

### 🔮 **Phase 7 → Authentication + Users**

* Spring Security
* JWT
* Login/Register UI
* Per-user notes
* Role-based access

### 🏷 **Phase 8 → Tag Management UI**

* Manage tags in a dedicated page
* Rename tags
* Merge tags
* Colors (like Notion labels)

### ✍️ **Phase 9 → Rich Text Editing**

* TipTap / React Quill / CodeMirror
* Bold/italic
* Code blocks
* Link preview
* Inline formatting

### 📎 **Phase 10 → Attachments**

* Upload files
* S3 integration (optional)
* Preview images/pdfs
* Full attachment management

### 🔍 **Phase 11 → Advanced Search**

* PostgreSQL full-text search
* Ranking
* Highlights
* Filters across categories

### 🔁 **Phase 12 → Migrations**

* Flyway or Liquibase
* Versioned schema
* Repeatable migrations
* Rollbacks

### 🚀 **Phase 13 → Deployment**

* Docker-based deployment
* Reverse proxy (Traefik or Nginx)
* Systemd service
* Production builds

### 🤖 **Phase 14 → AI Smart Features**

* Auto-generate tags
* Summaries
* Flashcards
* Smart search

---

## 🎯 Summary

This repo is a **full learning journey**:
from “Hello CRUD” → to a complete, polished fullstack notes application.

The architecture now supports adding:

* authentication
* rich text editing
* attachments
* migrations
* deployment
* AI integrations

You’re building real industry-ready skills step by step.

---

If you'd like, I can also generate:

📄 `java-notes-api/README.md`
📄 `docker/README.md`
📄 scripts for DB reset, backup, or initial seed

Just tell me — *I’m ready.*
