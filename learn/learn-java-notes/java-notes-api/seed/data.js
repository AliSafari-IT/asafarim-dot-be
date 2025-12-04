export const notes = [
  {
    title: "Getting Started with Java for Web Apps",
    subtitle: "Setup your first Java development environment",
    content: `# Getting Started with Java for Web Apps

## Prerequisites

Before building web applications in Java, you need:

- **JDK 17+** - Download from [oracle.com](https://www.oracle.com/java/technologies/downloads/)
- **Maven 3.8+** - Build tool for managing dependencies
- **Git** - Version control
- **IDE** - IntelliJ IDEA or VS Code with Java extensions

## Installation Steps

### 1. Install JDK

\`\`\`bash
# Verify installation
java -version
javac -version
\`\`\`

### 2. Install Maven

\`\`\`bash
# Download and extract Maven
# Add to PATH
mvn --version
\`\`\`

### 3. Create Your First Project

\`\`\`bash
mvn archetype:generate -DgroupId=com.example -DartifactId=my-app
cd my-app
mvn clean package
\`\`\`

## Key Concepts

- **Packages**: Organize code into namespaces
- **Classes**: Blueprint for objects
- **JVM**: Java Virtual Machine executes bytecode
- **Classpath**: Where Java looks for compiled classes

## Next Steps

Once your environment is set up, move to building REST APIs with Spring Boot.`,
    noteType: "TUTORIAL",
    tags: ["java", "basics", "setup"],
    isPublic: true,
    visibility: "FEATURED",
    authors: JSON.stringify(["Ali Safari"]),
    publicationYear: 2025,
    keywords: JSON.stringify(["jdk", "maven", "gradle", "environment"]),
    favorite: true,
  },
  {
    title: "Choosing a Java Web Stack in 2025",
    subtitle: "Comparing Spring Boot, Quarkus, Micronaut, and more",
    content: `# Choosing a Java Web Stack in 2025

## Framework Comparison

| Framework | Startup Time | Memory | Ecosystem | Learning Curve |
|-----------|--------------|--------|-----------|-----------------|
| Spring Boot | 2-3s | 200MB | Excellent | Medium |
| Quarkus | <1s | 50MB | Growing | Medium |
| Micronaut | <1s | 80MB | Good | Medium |
| Jakarta EE | 2-3s | 150MB | Mature | High |

## Spring Boot (Recommended)

**Pros:**
- Largest ecosystem and community
- Excellent documentation
- Spring Cloud for microservices
- Industry standard

**Cons:**
- Larger memory footprint
- Slower startup time

## Quarkus (Cloud-Native)

**Pros:**
- Extremely fast startup
- Low memory usage
- Excellent for containers/serverless
- GraalVM native compilation

**Cons:**
- Smaller ecosystem
- Fewer third-party integrations

## Micronaut (Lightweight)

**Pros:**
- Fast and lightweight
- Compile-time dependency injection
- Good for microservices

**Cons:**
- Less mature than Spring Boot
- Smaller community

## Recommendation

**Choose Spring Boot if:**
- Building enterprise applications
- Need maximum ecosystem support
- Team familiar with Spring

**Choose Quarkus if:**
- Deploying to Kubernetes/serverless
- Memory and startup time critical
- Building microservices

**Choose Micronaut if:**
- Building lightweight microservices
- Want compile-time safety`,
    noteType: "ARTICLE",
    tags: ["java", "web", "architecture"],
    isPublic: true,
    visibility: "PUBLIC",
    authors: JSON.stringify(["Ali Safari"]),
    publicationYear: 2025,
    keywords: JSON.stringify(["spring-boot", "quarkus", "micronaut", "framework-comparison"]),
  },
  {
    title: "First Spring Boot REST API",
    subtitle: "Build your first endpoint in minutes",
    content:
      "We build a minimal REST API with Spring Boot: a single controller, one GET endpoint, and a simple JSON response. The focus is on understanding annotations like @RestController, @GetMapping, and how Spring Boot auto-configures Tomcat and JSON serialization for you.",
    noteType: "TUTORIAL",
    tags: ["spring-boot", "rest", "api"],
    isPublic: true,
    visibility: "FEATURED",
    authors: JSON.stringify(["Ali Safari"]),
    publicationYear: 2025,
    keywords: JSON.stringify(["rest-api", "controller", "spring-boot", "json"]),
    favorite: true,
  },
  {
    title: "Connecting Spring Boot to PostgreSQL",
    subtitle: "Database persistence with Spring Data JPA",
    content:
      "This note shows how to connect a Spring Boot web app to PostgreSQL using Spring Data JPA. We configure the datasource URL, username, and password, then create a simple entity and repository to persist data. We also look at Flyway/Liquibase for schema migrations.",
    noteType: "TECHNICAL_DOC",
    tags: ["spring-boot", "postgresql", "database"],
    isPublic: true,
    visibility: "PUBLIC",
    authors: JSON.stringify(["Ali Safari"]),
    publicationYear: 2025,
    keywords: JSON.stringify(["jpa", "postgresql", "datasource", "flyway"]),
  },
  {
    title: "Layering Your Java Web Application",
    subtitle: "Controller, Service, and Repository patterns",
    content:
      "A clean Java web app usually has clear layers: controller, service, and repository. This note explains what belongs where, and gives a small example so you avoid putting business logic directly into controllers or JPA entities.",
    noteType: "EXTENDED",
    tags: ["architecture", "services", "repository"],
    isPublic: true,
    visibility: "PUBLIC",
    authors: JSON.stringify(["Ali Safari"]),
    publicationYear: 2025,
    keywords: JSON.stringify(["architecture", "design-patterns", "separation-of-concerns"]),
  },
  {
    title: "Handling Configuration and Profiles",
    subtitle: "Environment-specific settings in Spring Boot",
    content:
      "Web apps need different configuration per environment (dev, test, prod). Here we use Spring Boot profiles and application-*.yml files to manage things like logging level, database URLs, and feature flags without hardcoding anything in the code.",
    noteType: "TECHNICAL_DOC",
    tags: ["spring-boot", "configuration", "profiles"],
    isPublic: true,
    visibility: "PUBLIC",
    authors: JSON.stringify(["Ali Safari"]),
    publicationYear: 2025,
    keywords: JSON.stringify(["profiles", "configuration", "environment", "yaml"]),
  },
  {
    title: "Building and Running a Java Web App with Maven",
    subtitle: "Maven lifecycle and Spring Boot plugin",
    content:
      "In this note we focus on the Maven lifecycle for a Spring Boot web app: mvn clean package, the Spring Boot Maven plugin, and how to run the fat JAR. We also cover how to configure the Java version and basic plugins.",
    noteType: "TUTORIAL",
    tags: ["maven", "build", "deployment"],
    isPublic: true,
    visibility: "PUBLIC",
    authors: JSON.stringify(["Ali Safari"]),
    publicationYear: 2025,
    keywords: JSON.stringify(["maven", "build", "jar", "deployment"]),
  },
  {
    title: "Adding Basic Validation to REST Endpoints",
    subtitle: "Jakarta Validation and Bean Validation",
    content:
      "Before going to production, your Java web app should validate incoming data. This note introduces Bean Validation (Jakarta Validation) with annotations like @NotNull, @Email, and @Size, and shows how Spring Boot automatically integrates it with your REST controllers.",
    noteType: "EXTENDED",
    tags: ["validation", "rest", "spring-boot"],
    isPublic: true,
    visibility: "PUBLIC",
    authors: JSON.stringify(["Ali Safari"]),
    publicationYear: 2025,
    keywords: JSON.stringify(["validation", "constraints", "jakarta-validation"]),
  },
  {
    title: "Basic Security for Java Web APIs",
    subtitle: "HTTP Basic Auth and Spring Security fundamentals",
    content:
      "Here we add minimal security to a Spring Boot API using Spring Security. We start with HTTP basic auth, then point to how you can evolve to JWT-based authentication later. The goal is to understand the filter chain and where authentication actually happens.",
    noteType: "TECHNICAL_DOC",
    tags: ["security", "spring-security", "auth"],
    isPublic: true,
    visibility: "UNLISTED",
    authors: JSON.stringify(["Ali Safari"]),
    publicationYear: 2025,
    keywords: JSON.stringify(["security", "authentication", "spring-security", "jwt"]),
  },
  {
    title: "Serving a React Frontend from a Java Backend",
    subtitle: "CORS, static assets, and SPA integration",
    content:
      "Many modern Java web apps serve a React or other SPA frontend. This note explains the high-level options: serving the SPA from a separate Node dev server in development, then letting Spring Boot serve the built static assets in production, and how to configure CORS while developing.",
    noteType: "ARTICLE",
    tags: ["react", "spring-boot", "cors"],
    isPublic: true,
    visibility: "PRIVATE",
    authors: JSON.stringify(["Ali Safari"]),
    publicationYear: 2025,
    keywords: JSON.stringify(["react", "cors", "spa", "frontend-integration"]),
  },
];

// Citations: Note-to-note relationships (knowledge graph)
// These will be created after notes are seeded
export const citations = [
  {
    // "First Spring Boot REST API" cites "Getting Started with Java for Web Apps"
    citingNoteIndex: 2,
    citedNoteIndex: 0,
    citationOrder: 1,
    inlineMarker: "@safari2025",
    pageReference: "p. 1",
    context: "Before building a REST API, ensure you have a working Java development environment.",
  },
  {
    // "Connecting Spring Boot to PostgreSQL" cites "First Spring Boot REST API"
    citingNoteIndex: 3,
    citedNoteIndex: 2,
    citationOrder: 1,
    inlineMarker: "@safari2025-api",
    pageReference: "p. 5",
    context: "Building on the REST API foundation, we now add database persistence.",
  },
  {
    // "Layering Your Java Web Application" cites "First Spring Boot REST API"
    citingNoteIndex: 4,
    citedNoteIndex: 2,
    citationOrder: 1,
    inlineMarker: "@safari2025-api",
    pageReference: "p. 8",
    context: "The controller pattern introduced in the REST API note is part of the larger layering strategy.",
  },
  {
    // "Layering Your Java Web Application" cites "Connecting Spring Boot to PostgreSQL"
    citingNoteIndex: 4,
    citedNoteIndex: 3,
    citationOrder: 2,
    inlineMarker: "@safari2025-db",
    pageReference: "p. 10",
    context: "The repository layer manages database interactions as shown in the PostgreSQL integration guide.",
  },
  {
    // "Adding Basic Validation to REST Endpoints" cites "First Spring Boot REST API"
    citingNoteIndex: 7,
    citedNoteIndex: 2,
    citationOrder: 1,
    inlineMarker: "@safari2025-api",
    pageReference: "p. 3",
    context: "Building on the REST API foundation, we add validation to incoming requests.",
  },
  {
    // "Basic Security for Java Web APIs" cites "First Spring Boot REST API"
    citingNoteIndex: 8,
    citedNoteIndex: 2,
    citationOrder: 1,
    inlineMarker: "@safari2025-api",
    pageReference: "p. 2",
    context: "REST APIs need security layers to protect endpoints from unauthorized access.",
  },
  {
    // "Serving a React Frontend from a Java Backend" cites "First Spring Boot REST API"
    citingNoteIndex: 9,
    citedNoteIndex: 2,
    citationOrder: 1,
    inlineMarker: "@safari2025-api",
    pageReference: "p. 4",
    context: "The REST API serves as the backend for the React frontend.",
  },
  {
    // "Serving a React Frontend from a Java Backend" cites "Basic Security for Java Web APIs"
    citingNoteIndex: 9,
    citedNoteIndex: 8,
    citationOrder: 2,
    inlineMarker: "@safari2025-security",
    pageReference: "p. 6",
    context: "CORS configuration is essential when serving a frontend from a separate origin.",
  },
];

// Tags (already exist in notes, but can be referenced separately)
export const tags = [
  { name: "java", description: "Java programming language" },
  { name: "spring-boot", description: "Spring Boot framework" },
  { name: "rest", description: "REST API design" },
  { name: "api", description: "API development" },
  { name: "database", description: "Database design and management" },
  { name: "postgresql", description: "PostgreSQL database" },
  { name: "architecture", description: "Software architecture patterns" },
  { name: "security", description: "Security and authentication" },
  { name: "react", description: "React frontend framework" },
  { name: "maven", description: "Maven build tool" },
  { name: "validation", description: "Data validation" },
  { name: "configuration", description: "Application configuration" },
  { name: "basics", description: "Beginner-friendly content" },
  { name: "setup", description: "Environment setup" },
  { name: "web", description: "Web development" },
  { name: "services", description: "Service layer patterns" },
  { name: "repository", description: "Repository pattern" },
  { name: "profiles", description: "Spring profiles" },
  { name: "build", description: "Build and deployment" },
  { name: "deployment", description: "Deployment strategies" },
  { name: "spring-security", description: "Spring Security framework" },
  { name: "auth", description: "Authentication" },
  { name: "cors", description: "CORS configuration" },
];

export default notes;

