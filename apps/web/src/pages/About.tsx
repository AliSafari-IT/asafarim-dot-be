export default function About() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="mb-4">About ASafariM</h1>
        <p className="text-lg mb-8">
          Full-stack developer (.NET + React/Angular). This site is part of a
          monorepo with shared design tokens and SSO.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-8">
          <div className="p-4 bg-background shadow-sm rounded-lg">
            <h2 className="text-primary mb-2">Our Mission</h2>
            <p>
              Building scalable, maintainable applications with modern frameworks and best practices.
              We focus on developer experience and code quality.
            </p>
          </div>
          <div className="p-4 bg-background shadow-sm rounded-lg">
            <h2 className="text-primary mb-2">Technologies</h2>
            <p>
              We use .NET Core, React, Angular, and TypeScript to build robust applications.
              Our monorepo approach ensures consistency across projects.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
