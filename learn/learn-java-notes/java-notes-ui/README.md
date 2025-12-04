# 📘 java-notes-ui of Study Notes App

**React 18 + TypeScript + Vite** frontend for the **Study Notes App** — a full-featured note-taking application with authentication and account management.

### Core Features:

* ✅ **Authentication** — Login/register with JWT tokens
* ✅ **Account Management** — Profile, display name, email, avatar uploads
* ✅ **Password Management** — Secure password changes
* ✅ **Account Security** — Session tracking, activity logs, account deletion
* ✅ **User Preferences** — Theme switching, language selection, notification settings
* ✅ **Notes CRUD** — Create, read, update, delete personal notes
* ✅ **Tag System** — Organize notes with tags
* ✅ **Search & Filtering** — Full-text search, tag filtering
* ✅ **Sorting** — Multiple sort modes (newest, oldest, A-Z, reading time, word count)
* ✅ **Metadata Display** — Reading time, word count, creation date
* ✅ **Data Export** — Download personal data as JSON
* ✅ **Responsive Design** — Mobile-friendly UI with shared design tokens
* ✅ **Notifications** — Toast notifications for user actions
* ✅ **i18n Support** — English and Dutch translations

---

## 🏗️ Project Structure

```
learn-java-notes/
├── java-notes-api/     # Backend: Spring Boot 3, Java 21
│   ├── pom.xml
│   ├── src/main/java/be/asafarim/learn/javanotesapi/
│   └── ...
└── java-notes-ui/      # Frontend: React + TypeScript + Vite
    ├── package.json
    └── src/
```

---

### 🚀 Features Completed So Far

### ✅ 1. Spring Boot Backend (java-notes-api)

#### ✔ Project setup

* Java 21
* Spring Boot 3.4.x
* Maven
* pnpm integration for unified monorepo tooling
* CORS enabled
* Custom health endpoint: `/api/health`

#### ✔ StudyNote CRUD

* `StudyNote` entity
* Create, read, update, delete
* DTO-based API
* Validation rules
* Error handling
* H2 → PostgreSQL persistent storage
* Automatic schema generation

#### ✔ Tag system (Many-to-Many)

* `Tag` entity
* Tags attached to notes
* Automatic tag creation
* Tag normalization
* Tag repository + service
* Endpoints:

  * `/api/tags` (used tags)
  * `/api/tags/all` (all tags)

#### ✔ Filtering & Search

* `GET /api/notes?query=...`
* Case-insensitive search over:

  * title
  * content

#### ✔ Sorting

* Backend sorting with:

  * newest
  * oldest
  * A–Z
  * Z–A
  * readingTime
  * wordCount

#### ✔ Metadata

* Automatic reading-time calculation
* Word count calculation
* Returned in DTOs
* Displayed in UI cards and details page

#### ✔ PostgreSQL Integration

* Docker Compose for database
* Persistent volumes
* Init scripts
* Spring Boot configured for PostgreSQL
* H2 disabled

---

### 🎨 2. React Frontend (java-notes-ui)

#### ✔ Frontend stack

* React 18 + TypeScript
* Vite
* React Router for navigation
* Axios for API calls
* Shared UI components from `@asafarim/shared-ui-react`
* Design tokens from `@asafarim/shared-tokens`
* i18n support via `@asafarim/shared-i18n`

#### ✔ Authentication Pages

* **Login Page** — JWT-based authentication
* **Register Page** — User registration with validation
* **Auth Context** — Global auth state management
* **Protected Routes** — Route guards for authenticated pages

#### ✔ Account Management Pages

* **Account Page** — Tabbed interface with 5 sections:
  * **Profile Tab** — Edit display name, email, upload avatar
  * **Security Tab** — Change password with validation
  * **Preferences Tab** — Theme, language, notification settings
  * **Activity Tab** — View account activity logs and sessions
  * **Danger Zone** — Account deactivation and deletion

* **Features:**
  * Avatar upload with preview
  * Display name persistence across re-login
  * Password change with current password verification
  * Session management (view active sessions)
  * Account activity tracking (login attempts, changes)
  * User preferences storage
  * Data export as JSON file
  * Account deletion with confirmation
  * Toast notifications for all actions
  * Loading states and error handling

#### ✔ Notes Pages

* **Notes List** — Display all notes with metadata
* **Create/Edit Note** — Rich text editing
* **Note Details** — View single note with tags
* **Tag System** — Filter and organize by tags
* **Search** — Full-text search with debounce
* **Sorting** — Multiple sort options

#### ✔ Reusable Components

* **TagInput** — Add/remove tags
* **TagBadge** — Display tags
* **Avatar Component** — User avatar display
* **Notification Toast** — User feedback
* **Loading Spinner** — Loading states
* **Error Boundary** — Error handling
* React Router
* Axios
* Shared UI libraries:

  * `@asafarim/shared-ui-react`
  * `@asafarim/react-themes`
  * `@asafarim/shared-i18n`

### ✔ Notes listing page

* Beautiful card layout
* Responsive styling
* Shared token system
* Metadata display:

  * reading time
  * word count
  * date
* Tag badges
* Search bar with debounce
* Sort dropdown
* Tag filters
* Combined query + tag + sorting

### ✔ Create & Edit Note Pages

* Using shared Layout
* Markdown-friendly textarea
* TagInput component
* validation
* navigation via `useNavigate`
* Async save + loading states

### ✔ Note Details Page

* Clean layout using design tokens
* Markdown rendering
* Tag badges (clickable)
* Metadata shown inside header
* Edit + Back buttons

### ✔ Reusable UI Components

* `TagInput`
* `TagBadge`
* Nice hover/focus behaviors
* Accessible and keyboard-friendly
* Reused across multiple pages

### ✔ Custom Hooks

* `useDebounce`
* `useQueryParams` (if applied later)

---

### 🗄️ 3. Docker Compose (PostgreSQL)

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

Run with:

```bash
docker compose up -d
```

---

### 🧪 API Overview

#### 💚 Health

```
GET /api/health
```

#### 📝 Notes

```
GET    /api/notes
GET    /api/notes/{id}
POST   /api/notes
PUT    /api/notes/{id}
DELETE /api/notes/{id}
```

Supports:

* `?query=text`
* `?tag=java`
* `?sort=newest`

#### 🏷 Tags

```
GET /api/tags
GET /api/tags/all
```

---

### 🧭 Roadmap — Where We’re Heading Next

You now have a **mini Notion-like note system** with:

* CRUD
* tags
* search
* filtering
* sorting
* markdown
* metadata
* PostgreSQL

The backend and frontend foundations are strong.
Now we can move to **real-world application architecture concepts**.

---

### 🔮 **Phase 7 → Authentication + Users**

* Add Spring Security
* Add JWT (or OAuth2 later)
* Users can log in
* Each user has their own notes
* Public vs private notes
* Role-based endpoints
* UI login/register pages

---

### 🏷 **Phase 8 → Tag Management UI**

* Tag list page
* Rename tags
* Merge tags
* Delete tags
* Tag colors (like Notion)

---

### 🧵 **Phase 9 → Rich Text Editing**

Choose editor:

* React Quill
* TipTap
* CodeMirror (Markdown editor)
  Add:
* Bold, italic, headings
* Code blocks
* Inline code
* Link previews

---

### 🗂 **Phase 10 → File Uploads / Attachments**

* Upload PDFs, images, files
* Save in PostgreSQL or S3 bucket
* Add attachment previews
* Add file service in backend

---

### 🔍 **Phase 11 → Advanced Search**

* Full-text search
* PostgreSQL `tsvector`
* Weighted queries
* Ranking
* Highlighting results

---

### 🔁 **Phase 12 → Migrations**

* Introduce Flyway or Liquibase
* Versioned DB schema
* SQL migration files
* Rollbacks

---

### 🛸 **Phase 13 → Deploy to Production**

* Build frontend with Vite
* Package backend as Docker image
* Use Traefik or Nginx
* Host on VPS or Render
* CI/CD via GitHub or GitLab

---

### 🧠 **Phase 14 → AI Integration (optional but fun)**

* Use OpenAI to:

  * summarize notes
  * convert notes to flashcards
  * add auto-tags
  * improve content
* Create a “Smart Notes” assistant

---

### 🎯 The Path Ahead (Summary)

| Phase | Focus            | Outcome                    |
| ----- | ---------------- | -------------------------- |
| 7     | Auth + Users     | Personal per-user notes    |
| 8     | Tag management   | Mature tagging system      |
| 9     | Rich text editor | Modern note taking         |
| 10    | Attachments      | Real-world functionality   |
| 11    | Full-text search | High-quality search        |
| 12    | Migrations       | Enterprise-quality backend |
| 13    | Deployment       | Full cloud deployment      |
| 14    | AI               | Smart Notes assistant      |

You are building a **full-stack, production-grade knowledge app** step by step.
This roadmap covers 90% of what real companies expect from a junior → medior → senior developer.
