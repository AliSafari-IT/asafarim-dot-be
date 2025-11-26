import './MenuManagementPage.css';

export function MenuManagementPage() {
  return (
    <div className="menu-page">
      <header className="menu-header">
        <h1>Menu Management</h1>
        <p>Manage categories, items, and pricing.</p>
      </header>

      <div className="menu-grid">
        <section className="menu-section">
          <h2>Menu Categories</h2>
          <ul>
            <li>Starters</li>
            <li>Mains</li>
            <li>Desserts</li>
            <li>Drinks</li>
          </ul>
        </section>

        <section className="menu-section">
          <h2>Popular Items</h2>
          <ul>
            <li>Margherita Pizza</li>
            <li>Beef Burger</li>
            <li>Pasta Carbonara</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
