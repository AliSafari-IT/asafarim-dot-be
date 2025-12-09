export default function Dashboard() {
  return (
    <div>
      <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "1rem" }}>
        Dashboard
      </h1>
      <p style={{ color: "var(--color-text-secondary)" }}>
        Welcome to your Freelance Toolkit! Your dashboard will show key metrics
        and recent activity.
      </p>
      <div
        style={{
          marginTop: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem",
        }}
      >
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--color-surface)",
            borderRadius: "0.5rem",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
            }}
          >
            Total Revenue
          </h3>
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "var(--color-primary)",
            }}
          >
            €0.00
          </p>
        </div>
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--color-surface)",
            borderRadius: "0.5rem",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
            }}
          >
            Active Proposals
          </h3>
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "var(--color-primary)",
            }}
          >
            0
          </p>
        </div>
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--color-surface)",
            borderRadius: "0.5rem",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
            }}
          >
            Pending Invoices
          </h3>
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "var(--color-primary)",
            }}
          >
            0
          </p>
        </div>
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--color-surface)",
            borderRadius: "0.5rem",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
            }}
          >
            Total Clients
          </h3>
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "var(--color-primary)",
            }}
          >
            0
          </p>
        </div>
      </div>
    </div>
  );
}
