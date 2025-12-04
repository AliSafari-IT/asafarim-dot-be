# Roadmap for your Java + React TS Playground

We’ll build a **`learn-java-notes`** app under:

`D:\repos\asafarim-dot-be\learn`

with:

* Backend: `java-notes-api` (Java, Spring Boot)
* Frontend: `java-notes-ui` (React + TypeScript)

And one simple table to start: **`StudyNote`**
Fields: `id`, `title`, `content`, `createdAt`.

## Phase 0 – Setup & Skeleton

**Goal:** Get a minimal fullstack skeleton running.

* [ ] Create `learn` folder structure (api + ui)
* [ ] Spring Boot backend (`java-notes-api`) with:

  * Java 21, Maven
  * Simple `GET /api/health` endpoint
* [ ] React + TS frontend (`java-notes-ui`) with:

  * Vite
  * Simple page calling `GET /api/health`
* [ ] Basic CORS and dev proxy (frontend → backend)

## Phase 1 – One Table: `StudyNote` CRUD (Core Java & Spring)

**Backend**

* [ ] Add `StudyNote` JPA entity + `StudyNoteRepository`
* [ ] Use **H2 in-memory DB** for simplicity
* [ ] `StudyNoteController` with CRUD endpoints:

  * `GET /api/notes`
  * `GET /api/notes/{id}`
  * `POST /api/notes`
  * `PUT /api/notes/{id}`
  * `DELETE /api/notes/{id}`

**Frontend**

* [ ] Simple table (React) to list notes
* [ ] Form to create/update a note
* [ ] Delete button per row

## Phase 2 – Real DB + Better UX

* Switch from H2 → **PostgreSQL** or **MySQL**
* Add pagination & basic filtering on backend
* Add search/filter + basic loading/error states in React
* Introduce a simple **service layer** in Java (`StudyNoteService`)

## Phase 3 – Clean Architecture & Patterns

* Introduce:

  * DTOs and mappers (e.g. MapStruct)
  * Validation with **Jakarta Validation** (and later maybe FluentValidation equivalent concepts)
  * Clear package structure:

    * `controller`, `service`, `repository`, `domain`, `dto`
* On frontend:

  * Custom hooks (`useNotes`)
  * Separation of api layer vs UI components

## Phase 4 – Security & Auth

* Spring Security:

  * Basic auth → then JWT
  * Protect write operations
* React:

  * Login page
  * Store token, protected routes

## Phase 5 – Testing

* Java:

  * Unit tests with JUnit & Mockito
  * Integration tests with Spring Boot Test (maybe Testcontainers for DB)
* React:

  * Vitest + React Testing Library for components and hooks

## Phase 6 – Deploy & DevOps

* Dockerize backend and DB
* Dockerize frontend
* docker-compose setup
* Basic logging, profiles (dev/prod), and environment configs

## Phase 7 – Advanced Playground (optional later)

* Async / events (e.g. Kafka/RabbitMQ or just Spring events)
* File uploads
* WebSockets / Server-Sent Events
* Caching (Spring Cache + Redis)

We’ll go through this gradually; we start at **Phase 0 / Step 1** now.

---

## Step 1 – Backend Skeleton (what we do first)

**Goal:** Have a running Spring Boot app with a simple `GET /api/health` endpoint.

**What you’ll learn here:**

* Project structure for a Spring Boot API
* How `pom.xml`, `Application` class, and controller fit together
* How to run the app locally

**Concrete outcomes:**

* Folder: `D:\repos\asafarim-dot-be\learn\java-notes-api`
* A Spring Boot app (Java 21, Maven) with:

  * Main class: `JavaNotesApiApplication`
  * Controller: `HealthController` with `/api/health`

We’ll add DB + `StudyNote` in the next step.

---

## Copy-paste Prompt for Step 1

Here’s a prompt you can paste (even in a new chat) whenever you want to **execute Step 1** in detail and get exact code & commands:

> I’m building a Java + React TypeScript playground app to learn Java.
> The project lives in `D:\repos\asafarim-dot-be\learn`.
>
> Please help me with **Step 1: Backend Skeleton** only.
>
> **Constraints & context:**
>
> * Create a Spring Boot 3 app using **Java 21** and **Maven**.
> * Backend folder name: `java-notes-api` inside `D:\repos\asafarim-dot-be\learn`.
> * GroupId: `be.asafarim.learn`
> * ArtifactId: `java-notes-api`
> * Packaging: jar
> * Dependencies to include now:
>
>   * `spring-boot-starter-web`
>   * (You may add `spring-boot-starter-actuator` if useful, but don’t add JPA or DB yet.)
> * I’m on Windows, so give file paths using backslashes, but CLI commands should be copy-paste friendly in PowerShell / Git Bash.
>
> **What I want you to deliver in this step:**
>
> 1. A short explanation of the final folder structure under `D:\repos\asafarim-dot-be\learn\java-notes-api`.
> 2. The exact `mvn` or Spring Initializr commands I should run to generate the project in that folder (no GUI).
> 3. A complete `pom.xml` file for this minimal backend.
> 4. A full `JavaNotesApiApplication` main class.
> 5. A `HealthController` class under package `be.asafarim.learn.javanotesapi.controllers` with a `GET /api/health` endpoint returning a JSON object like `{ "status": "OK", "service": "java-notes-api" }`.
> 6. Instructions on how to start the app and how to test the health endpoint with `curl` or browser.
> 7. Brief explanations (1–2 sentences each) of what `pom.xml`, the main class, and the controller are responsible for.
>
> Don’t skip any files; whenever you show a file, show its full content so that it compiles. Keep explanations concise but clear.

---
