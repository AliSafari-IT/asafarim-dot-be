export default function About() {
  return (
    <section className="web-about">
      <div className="web-about-container">
        {/* Hero */}
        <div className="web-about-hero">
          <h1 className="web-about-title">Fullstack .NET & React Developer</h1>
          <p className="web-about-subtitle">
            I build scalable, maintainable, and interactive applications — from
            backend APIs in <strong>ASP.NET Core</strong> to modern UIs in{" "}
            <strong>React & TypeScript</strong>. Passionate about performance,
            clean code, and data-driven solutions.
          </p>
          <div className="web-about-actions">
            <a href="https://asafarim.be/portfolio/my-react-dotnet-cv-10-10-2025/public" className="btn-primary">
              View Resume
            </a>
            <a href="/contact" className="btn-secondary">
              Contact Me
            </a>
          </div>
        </div>

        <section className="web-about-section">
          <h2 className="web-about-heading">What I Do</h2>
          <div className="web-about-section-grid">
            <div className="web-about-section-card">
              <h3>Backend with .NET</h3>
              <p>
                Building secure and scalable REST APIs with ASP.NET Core, EF
                Core, and SQL databases.
              </p>
            </div>
            <div className="web-about-section-card">
              <h3>Frontend with React</h3>
              <p>
                Creating interactive, responsive UIs with React, TypeScript, and
                TailwindCSS.
              </p>
            </div>
            <div className="web-about-section-card">
              <h3>Fullstack Delivery</h3>
              <p>
                Combining backend + frontend into production-ready solutions,
                with CI/CD pipelines and cloud deployment.
              </p>
            </div>
          </div>
        </section>

        {/* Key Skills */}
        <div className="web-about-section">
          <h2 className="web-about-heading">Key Skills</h2>
          <ul className="web-about-skills-list">
            <li className="web-about-skill">
              <strong>Frontend:</strong> React (TypeScript), Redux, Tailwind,
              Syncfusion
            </li>
            <li className="web-about-skill">
              <strong>Backend:</strong> ASP.NET Core, Entity Framework, SignalR,
              REST APIs
            </li>
            <li className="web-about-skill">
              <strong>Databases:</strong> SQL Server, MySQL, MongoDB
            </li>
            <li className="web-about-skill">
              <strong>Data & Visualization:</strong> D3.js, R, R.Net
            </li>
            <li className="web-about-skill">
              <strong>DevOps & Tools:</strong> Git, Azure DevOps, Docker,
              Swagger, TestCafe
            </li>
          </ul>
        </div>

        {/* Experience */}
        <div className="web-about-section">
          <h2 className="web-about-heading">Recent Experience</h2>
          <div className="web-about-cards">
            <div className="web-about-card">
              <h3 className="web-about-card-title">XiTechniX (2020–2023)</h3>
              <p>
                Fullstack Scientific App Developer. Delivered .NET Core + React
                applications for scientific and business domains.
              </p>
            </div>
            <div className="web-about-card">
              <h3 className="web-about-card-title">IRC Engineering (2020)</h3>
              <p>
                Internship – Developed energy consumption visualizations using
                C# and R.Net.
              </p>
            </div>
            <div className="web-about-card">
              <h3 className="web-about-card-title">Flanders Environment Agency (2018–2019)</h3>
              <p>
                Internship – Enhanced hydrologic models (FORTRAN, WetSpa) for
                river flow simulations.
              </p>
            </div>
          </div>
        </div>

        {/* Academic */}
        <div className="web-about-section">
          <h2 className="web-about-heading">Background</h2>
          <div className="web-about-cards">
            <div className="web-about-education-card">
              <div className="web-about-education-icon" aria-hidden="true">🎓</div>
              <div className="web-about-education-content">
                <span className="web-about-education-title">
                  Applied Information Technology - Programming<br/>
                  <span className="web-about-education-school">Thomas More, Sint-Katelijne-Waver</span>
                </span>
                <span className="web-about-education-desc">
                  Transitioned into software engineering with a focus on fullstack development and data development.
                </span>
              </div>
            </div>
            <div className="web-about-education-card">
              <div className="web-about-education-icon" aria-hidden="true">🔬</div>
              <div className="web-about-education-content">
                <span className="web-about-education-title">
                  PhD in Engineering Hydrology<br/>
                  <span className="web-about-education-school">VUB, Brussels</span>
                </span>
                <span className="web-about-education-desc">
                  Strong expertise in modeling and data analysis. 
                  Transitioned into scientific software development with a focus on numerical modeling.
                </span>
              </div>
            </div>
            <div className="web-about-education-card">
              <div className="web-about-education-icon" aria-hidden="true">🌊</div>
              <div className="web-about-education-content">
                <span className="web-about-education-title">
                  B.Sc. & M.Sc. in Natural Resources Engineering<br/>
                  <span className="web-about-education-school">Tehran University</span>
                </span>
                <span className="web-about-education-desc">
                  Solid foundation in environmental science and engineering.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
