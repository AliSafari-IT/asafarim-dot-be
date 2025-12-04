# 🤝 Contributing to learn-java-notes

Thank you for your interest in contributing to this fullstack Java + React learning project! This guide will help you get set up and understand how to contribute effectively.

---

## 🎯 Project Overview

`learn-java-notes` is a step-by-step learning environment that evolves from a simple CRUD app to a production-grade knowledge management system. It consists of:

- **Backend**: Spring Boot 3 + Java 21 + PostgreSQL
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: PostgreSQL (Docker Compose)

---

## 🛠 Development Setup

### Prerequisites

- **Java 21**
- **Node.js** (latest LTS)
- **pnpm** (`npm install -g pnpm`)
- **Docker** & Docker Compose
- **Maven** (or use the wrapper)

### 1. Clone & Setup

```bash
git clone <your-fork-url>
cd learn-java-notes
```

### 2. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 3. Start Backend

```bash
cd java-notes-api
pnpm start
```

### 4. Start Frontend

```bash
cd java-notes-ui
pnpm start
```

The app will be available at:

- Backend: <http://localhost:8080>
- Frontend: <http://localhost:5183>

---

## 🧪 Running Tests

### Backend Tests

```bash
cd java-notes-api
mvn test
```

### Frontend Tests

```bash
cd java-notes-ui
pnpm test
```

---

## 📁 Project Structure

```
learn-java-notes/
├── java-notes-api/          # Spring Boot backend
│   ├── src/main/java/
│   │   └── be/asafarim/learn/javanotesapi/
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── repositories/
│   │       ├── entities/
│   │       └── dto/
│   └── pom.xml
├── java-notes-ui/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── styles/
│   └── package.json
├── docker-compose.yml       # PostgreSQL setup
└── README.md
```

---

## 🚀 How to Contribute

### 1. Pick an Issue

- Check the [Issues](../../issues) tab
- Look for `good first issue` or `help wanted` labels
- Comment on the issue to claim it

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Changes

#### Backend Changes

- Follow Spring Boot conventions
- Add tests for new endpoints
- Update DTOs if needed
- Document new API endpoints in the backend README

#### Frontend Changes

- Use TypeScript
- Follow existing component patterns
- Use shared design tokens
- Test UI changes

#### Database Changes

- Use `ddl-auto=update` for development
- For production changes, consider Flyway/Liquibase
- Update entity relationships carefully

### 4. Test Your Changes

- Backend: `mvn test`
- Frontend: `pnpm test`
- Manual testing in the browser
- Test with PostgreSQL running

### 5. Submit a Pull Request

- Push your branch
- Open a PR against `main`
- Fill out the PR template
- Wait for review

---

## 📝 Coding Standards

### Backend (Java/Spring)

- Use Java 21 features appropriately
- Follow Spring Boot best practices
- Use `@Service`, `@Repository`, `@RestController` correctly
- DTOs for API requests/responses
- Proper exception handling

### Frontend (React/TypeScript)

- Functional components with hooks
- TypeScript for all new code
- Use shared UI components from `@asafarim/shared-ui-react`
- Follow existing naming conventions
- Use semantic HTML

### General

- Write clear, concise commit messages
- Keep PRs focused and reasonably sized
- Update documentation as needed
- Add tests for new features

---

## 🏷 Labels Used

- `bug`: Bug fixes
- `enhancement`: New features
- `documentation`: Docs improvements
- `good first issue`: Good for newcomers
- `help wanted`: Community help needed
- `backend`: Backend-only changes
- `frontend`: Frontend-only changes
- `database`: Database/schema changes

---

## 🐛 Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Java version, Node version)
- Screenshots if applicable

---

## 💡 Feature Requests

For new features:

- Describe the use case
- Why it would be valuable
- Any implementation ideas
- Whether you're willing to implement it

---

## 📚 Learning Resources

This project is designed for learning. Helpful resources:

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

---

## 🙋‍♂️ Getting Help

- Ask questions in Issues
- Check existing documentation
- Look at past PRs for patterns
- Join discussions in the project discussions tab

---

## 📜 Code of Conduct

Be respectful, inclusive, and constructive. We're all here to learn and build together.

---

## 🎉 Recognition

Contributors will be recognized in:

- README contributors section
- Release notes
- Project history

---

Thank you for contributing to `learn-java-notes`! 🚀
