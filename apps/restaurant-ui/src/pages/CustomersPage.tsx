import './CustomersPage.css';

export function CustomersPage() {
  return (
    <div className="customers-page">
      <header className="customers-header">
        <h1>Customers</h1>
        <p>Loyalty, profiles, and order history.</p>
      </header>

      <div className="customers-grid">
        <section className="customers-section">
          <h2>Top Customers</h2>
          <ul>
            <li>
              <span className="name">John Doe</span>
              <span className="points">1,250 pts</span>
            </li>
            <li>
              <span className="name">Jane Smith</span>
              <span className="points">980 pts</span>
            </li>
          </ul>
        </section>

        <section className="customers-section">
          <h2>Segments</h2>
          <ul>
            <li>Regulars</li>
            <li>High Spenders</li>
            <li>First Timers</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
