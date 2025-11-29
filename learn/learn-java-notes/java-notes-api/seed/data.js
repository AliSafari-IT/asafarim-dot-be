export const notes = [
  {
    title: "Getting Started with Java for Web Apps",
    content:
      "This note walks through the core building blocks you need before touching any web framework: the JDK, a build tool (Maven/Gradle), and a basic understanding of packages, classes, and the JVM. We focus on setting up a clean dev environment so you can iterate quickly without fighting your tooling.",
    tags: ["java", "basics", "setup"],
    isPublic: true,
    visibility: "FEATURED",
  },
  {
    title: "Choosing a Java Web Stack in 2025",
    content:
      "There are many options for building web apps in Java: Spring Boot, Quarkus, Micronaut, Jakarta EE, and more. This note compares them briefly with a bias toward Spring Boot for productivity and ecosystem, and explains when you might pick something else.",
    tags: ["java", "web", "architecture"],
    isPublic: true,
    visibility: "PUBLIC",
  },
  {
    title: "First Spring Boot REST API",
    content:
      "We build a minimal REST API with Spring Boot: a single controller, one GET endpoint, and a simple JSON response. The focus is on understanding annotations like @RestController, @GetMapping, and how Spring Boot auto-configures Tomcat and JSON serialization for you.",
    tags: ["spring-boot", "rest", "api"],
    isPublic: true,
    visibility: "FEATURED",
  },
  {
    title: "Connecting Spring Boot to PostgreSQL",
    content:
      "This note shows how to connect a Spring Boot web app to PostgreSQL using Spring Data JPA. We configure the datasource URL, username, and password, then create a simple entity and repository to persist data. We also look at Flyway/Liquibase for schema migrations.",
    tags: ["spring-boot", "postgresql", "database"],
    isPublic: true,
    visibility: "PUBLIC",
  },
  {
    title: "Layering Your Java Web Application",
    content:
      "A clean Java web app usually has clear layers: controller, service, and repository. This note explains what belongs where, and gives a small example so you avoid putting business logic directly into controllers or JPA entities.",
    tags: ["architecture", "services", "repository"],
    isPublic: true,
    visibility: "PUBLIC",
  },
  {
    title: "Handling Configuration and Profiles",
    content:
      "Web apps need different configuration per environment (dev, test, prod). Here we use Spring Boot profiles and application-*.yml files to manage things like logging level, database URLs, and feature flags without hardcoding anything in the code.",
    tags: ["spring-boot", "configuration", "profiles"],
    isPublic: true,
    visibility: "PUBLIC",
  },
  {
    title: "Building and Running a Java Web App with Maven",
    content:
      "In this note we focus on the Maven lifecycle for a Spring Boot web app: mvn clean package, the Spring Boot Maven plugin, and how to run the fat JAR. We also cover how to configure the Java version and basic plugins.",
    tags: ["maven", "build", "deployment"],
    isPublic: true,
    visibility: "PUBLIC",
  },
  {
    title: "Adding Basic Validation to REST Endpoints",
    content:
      "Before going to production, your Java web app should validate incoming data. This note introduces Bean Validation (Jakarta Validation) with annotations like @NotNull, @Email, and @Size, and shows how Spring Boot automatically integrates it with your REST controllers.",
    tags: ["validation", "rest", "spring-boot"],
    isPublic: true,
    visibility: "PUBLIC",
  },
  {
    title: "Basic Security for Java Web APIs",
    content:
      "Here we add minimal security to a Spring Boot API using Spring Security. We start with HTTP basic auth, then point to how you can evolve to JWT-based authentication later. The goal is to understand the filter chain and where authentication actually happens.",
    tags: ["security", "spring-security", "auth"],
    isPublic: true,
    visibility: "UNLISTED",
  },
  {
    title: "Serving a React Frontend from a Java Backend",
    content:
      "Many modern Java web apps serve a React or other SPA frontend. This note explains the high-level options: serving the SPA from a separate Node dev server in development, then letting Spring Boot serve the built static assets in production, and how to configure CORS while developing.",
    tags: ["react", "spring-boot", "cors"],
    isPublic: true,
    visibility: "PRIVATE",
  },
];

export default notes;

