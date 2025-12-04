# 📘 java-notes-api of Study Notes App

**Spring Boot 3 + Java 21 REST API** for the **Study Notes App** — a full-featured note-taking application.

### Core Features:

* ✅ **Authentication** — JWT-based login/register with Spring Security
* ✅ **User Accounts** — Profile management, display name, email, avatar uploads
* ✅ **Password Management** — Secure password changes with validation
* ✅ **Account Security** — Session tracking, activity logging, account deactivation & deletion
* ✅ **User Preferences** — Theme, language, notifications settings
* ✅ **CRUD Notes** — Full note management with ownership
* ✅ **Tag System** — Many-to-many tags with normalization
* ✅ **Search + Filtering + Sorting** — Full-text search, tag filtering, multiple sort modes
* ✅ **Metadata** — Auto-calculated reading time, word count
* ✅ **Data Export** — Export user data as JSON
* ✅ **PostgreSQL Persistence** — Flyway migrations, clean schema
* ✅ **Clean Architecture** — DTOs, Services, Repositories, Controllers

This is a **production-ready backend** demonstrating enterprise Java patterns.

---

## 🏗️ Tech Stack

* **Java 21**
* **Spring Boot 3.4.x**
* **Spring Web**
* **Spring Data JPA**
* **PostgreSQL**
* **Docker Compose (DB)**
* **Maven**
* **pnpm wrapper for development workflow**
* **Lombok**

---

## 📁 Project Structure

```
java-notes-api/
├── pom.xml
└── src/main/java/be/asafarim/learn/javanotesapi/
    ├── controllers/
    ├── entities/
    ├── repositories/
    ├── services/
    ├── dto/
    └── JavaNotesApiApplication.java
```

### Key folders:

* **controllers** → REST endpoints
* **services** → business logic
* **repositories** → JPA interfaces
* **entities** → DB models
* **dto** → request/response models

---

## 🛢 Database Configuration

The backend uses **PostgreSQL** running via Docker.

### `application.properties`

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/notes_db
spring.datasource.username=USER
spring.datasource.password=PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

### Start DB

```bash
docker compose up -d
```

---

## 📦 Running the Backend

```bash
pnpm start
```

Which internally runs:

```bash
mvn spring-boot:run
```

API runs at:

```
http://localhost:8080
```

---

## 🧪 Health Check

```
GET /api/health
```

Response example:

```json
{
  "status": "OK",
  "service": "java-notes-api"
}
```

---

## 📚 REST API Overview

### � Authentication API

#### ➤ Register

```
POST /api/auth/signup
Content-Type: application/json
```

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "message": "User registered successfully!"
}
```

---

#### ➤ Login

```
POST /api/auth/signin
Content-Type: application/json
```

**Request:**
```json
{
  "username": "john_doe",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "type": "Bearer",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "john@example.com",
  "displayName": "John Doe",
  "roles": ["ROLE_USER"]
}
```

---

#### ➤ Get Current User

```
GET /api/auth/me
Authorization: Bearer {token}
```

---

### 👤 Account Management API

#### ➤ Get Profile

```
GET /api/account/profile
Authorization: Bearer {token}
```

---

#### ➤ Update Profile

```
PUT /api/account/profile
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "displayName": "John Doe",
  "email": "newemail@example.com"
}
```

---

#### ➤ Upload Avatar

```
POST /api/account/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form data:** `file` (image file)

---

#### ➤ Change Password

```
POST /api/account/password
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

---

#### ➤ Get User Sessions

```
GET /api/account/sessions
Authorization: Bearer {token}
```

---

#### ➤ Get Account Activity

```
GET /api/account/activity
Authorization: Bearer {token}
```

---

#### ➤ Get Preferences

```
GET /api/account/preferences
Authorization: Bearer {token}
```

---

#### ➤ Update Preferences

```
PUT /api/account/preferences
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "theme": "dark",
  "language": "en",
  "emailNotifications": true,
  "defaultEditor": "markdown"
}
```

---

#### ➤ Export User Data

```
GET /api/account/export/{uuid}
Authorization: Bearer {token}
```

**Response:** Base64-encoded JSON data URL for download

---

#### ➤ Deactivate Account

```
POST /api/account/deactivate
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "password": "CurrentPassword123!"
}
```

---

#### ➤ Delete Account

```
DELETE /api/account/delete
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "password": "CurrentPassword123!"
}
```

---

### �📝 Notes API

### ➤ Get all notes

```
GET /api/notes
```

Supports optional parameters:

| Parameter | Example     | Meaning          |
| --------- | ----------- | ---------------- |
| `query`   | ?query=java | full-text search |
| `tag`     | ?tag=spring | filter by tag    |
| `sort`    | ?sort=az    | sorting mode     |

Sorting options:

* `newest`
* `oldest`
* `az`
* `za`
* `readingTime`
* `wordCount`

---

### ➤ Get a single note

```
GET /api/notes/{id}
```

---

### ➤ Create note

```
POST /api/notes
Content-Type: application/json
```

**Request example**

```json
{
  "title": "Spring Boot Basics",
  "content": "Introduction to Spring Boot...",
  "tags": ["spring", "java", "backend"]
}
```

---

### ➤ Update note

```
PUT /api/notes/{id}
```

---

### ➤ Delete note

```
DELETE /api/notes/{id}
```

---

### 🏷 Tag API

### ➤ Get all used tags

```
GET /api/tags
```

### ➤ Get all tags in the system

```
GET /api/tags/all
```

---

### 🔬 Entities

### StudyNote

```java
id: UUID
title: String
content: String
tags: Set<Tag>
createdAt: LocalDateTime
updatedAt: LocalDateTime
readingTimeMinutes: int
wordCount: int
```

## Tag

```java
id: UUID
name: String (lowercase normalized)
notes: Set<StudyNote>
```

Many-to-many mapping:

```
study_note_tags
 ├─ note_id
 └─ tag_id
```

---

### 🧠 Service Layer Highlights

### StudyNoteService:

* create/update with tag resolution
* compute reading time
* compute word count
* search + tag filtering
* backend sorting
* DTO mapping

### TagService:

* find or create tags
* list used tags
* list all tags

---

### 🧩 Data Transfer Objects

### StudyNoteRequest

```json
{
  "title": "string",
  "content": "string",
  "tags": ["tag1", "tag2"]
}
```

### StudyNoteResponse

```json
{
  "id": "...",
  "title": "...",
  "content": "...",
  "tags": ["java", "spring"],
  "createdAt": "...",
  "updatedAt": "...",
  "readingTimeMinutes": 3,
  "wordCount": 540
}
```

---

### 🔧 Development Utilities

### Rebuild backend

```bash
mvn clean package
```

### Run with logs

```bash
mvn spring-boot:run -X
```

### Test PostgreSQL connection

```bash
psql -h localhost -U USER -d notes_db
```

---

### 🧭 Backend Roadmap

### **Phase 7 → Authentication (Spring Security + JWT)**

* Users & roles
* Ownership: notes belong to users
* Secure endpoints
* Login / Register API

### **Phase 8 → Tag Management API**

* Rename tag
* Merge tags
* Delete tag (cascade rules)

### **Phase 9 → Rich Content**

* Full Markdown rendering backend support
* Optional HTML sanitizing

### **Phase 10 → Attachments API**

* Upload files
* Store in DB or S3
* Attach to notes

### **Phase 11 → Advanced Search**

* PostgreSQL full-text search
* Search across titles, content, tags
* Ranking & weights
* Suggestions

### **Phase 12 → DB Migrations**

* Flyway or Liquibase
* Versioned schema
* Repeatable migrations

### **Phase 13 → Production Deployment**

* Dockerized Spring Boot app
* Nginx or Traefik reverse proxy
* CI/CD pipeline

---

### 🎯 Summary

The `java-notes-api` backend now supports:

✔ CRUD Notes
✔ Tags (many-to-many)
✔ Search
✔ Filtering
✔ Sorting
✔ Reading time & word count
✔ PostgreSQL persistence
✔ Clean architecture
✔ Ready for real-world extensions

This backend is now a strong foundation for learning **enterprise Java development**, and for gradually extending into authentication, attachments, migrations, full-text search, and deployment.
