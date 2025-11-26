import './InventoryPage.css';

export function InventoryPage() {
  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <h1>Inventory</h1>
        <p>Ingredient stock levels and alerts.</p>
      </header>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>Ingredient</th>
            <th>In Stock</th>
            <th>Unit</th>
            <th>Reorder Level</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tomato Sauce</td>
            <td>12</td>
            <td>kg</td>
            <td>5</td>
            <td className="status-ok">OK</td>
          </tr>
          <tr>
            <td>Mozzarella</td>
            <td>3</td>
            <td>kg</td>
            <td>5</td>
            <td className="status-low">Low</td>
          </tr>
          <tr>
            <td>Burger Buns</td>
            <td>40</td>
            <td>pcs</td>
            <td>30</td>
            <td className="status-ok">OK</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
