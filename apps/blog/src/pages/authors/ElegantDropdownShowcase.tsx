import React from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "@asafarim/shared-ui-react";

const ElegantDropdownShowcase = () => {
  const handleNavClick = (path: string) => {
    console.log("Navigate to:", path);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafbfc",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px 40px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "700",
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
          }}
        >
          Elegant Dropdown Menus
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            opacity: 0.9,
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          Minimal, beautiful, and highly customizable dropdown components for
          modern web applications
        </p>
      </div>

      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}
      >
        {/* Modern Navbar Example */}
        <section style={{ marginBottom: "60px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "20px",
            }}
          >
            Modern Navigation Bar
          </h2>

          <div
            style={{
              background: "#ffffff",
              padding: "16px 24px",
              borderRadius: "12px",
              marginBottom: "20px",
              boxShadow:
                "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #e5e7eb",
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                ✨
              </div>
              <span
                style={{
                  fontWeight: "700",
                  fontSize: "20px",
                  color: "#1f2937",
                }}
              >
                Acme Corp
              </span>
            </div>

            {/* Navigation */}
            {/* Navigation Menu */}
            <Dropdown
              placement="bottom-end"
              items={
                <>
                  <DropdownItem
                    icon="🏠"
                    label="Dashboard"
                    onClick={() => handleNavClick("/dashboard")}
                  />
                  <DropdownItem
                    icon="📁"
                    label="Projects"
                    onClick={() => handleNavClick("/projects")}
                  />
                  <DropdownItem
                    icon="👥"
                    label="Team"
                    onClick={() => handleNavClick("/team")}
                  />
                  <DropdownItem
                    icon="📊"
                    label="Analytics"
                    onClick={() => handleNavClick("/analytics")}
                  />
                </>
              }
            >
              <button>Menu</button>
            </Dropdown>
          </div>

          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
              fontStyle: "italic",
            }}
          >
            Perfect for application headers and navigation bars with clean,
            professional styling
          </p>
        </section>


        {/* Custom Styling Examples */}
        <section style={{ marginBottom: "60px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "20px",
            }}
          >
            Custom Styling
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {/* Custom Button Style */}
            <div
              style={{
                background: "#ffffff",
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "16px",
                }}
              >
                Custom Button
              </h3>
            </div>

            {/* Icon Button */}
            <div
              style={{
                background: "#ffffff",
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "16px",
                }}
              >
                Icon Button
              </h3>
              <Dropdown
                items={
                  <>
                    <DropdownItem
                      label="Dashboard"
                      icon="🏠"
                      onClick={() => {}}
                    />
                    <DropdownItem
                      label="Settings"
                      icon="⚙️"
                      onClick={() => {}}
                    />
                    <DropdownDivider />
                    <DropdownItem
                      label="Logout"
                      icon="🚪"
                      danger
                      onClick={() => {}}
                    />
                  </>
                }
              >
                <button>Menu</button>
              </Dropdown>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#6b7280",
          }}
        >
          <p style={{ fontSize: "14px" }}>
            Made with ❤️ using <strong>@asafarim/dd-menu</strong> v1.1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default ElegantDropdownShowcase;
