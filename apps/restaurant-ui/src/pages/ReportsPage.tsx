import './ReportsPage.css';

export function ReportsPage() {
  return (
    <div className="reports-page">
      <header className="reports-header">
        <h1>Reports</h1>
        <p>Sales, performance, and finance overview.</p>
      </header>

      <div className="reports-grid">
        <section className="report-card">
          <h2>Today&apos;s Sales</h2>
          <p className="value">€1,245.50</p>
          <p className="delta positive">+12% vs yesterday</p>
        </section>

        <section className="report-card">
          <h2>Orders</h2>
          <p className="value">86</p>
          <p className="delta">Average ticket: €14.49</p>
        </section>

        <section className="report-card">
          <h2>Top Category</h2>
          <p className="value">Pizza</p>
          <p className="delta">38% of revenue</p>
        </section>
      </div>
    </div>
  );
}
