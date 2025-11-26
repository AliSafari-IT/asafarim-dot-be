import { useState } from 'react';
import { Search, Filter, Eye, MoreVertical } from 'lucide-react';
import './OrdersPage.css';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  type: string;
  status: string;
  total: number;
  items: number;
  createdAt: string;
}

const DEMO_ORDERS: Order[] = [
  { id: '1', orderNumber: 'ORD-20251125-0001', customer: 'John Doe', type: 'DINE_IN', status: 'COMPLETED', total: 45.50, items: 3, createdAt: '2025-11-25T17:30:00' },
  { id: '2', orderNumber: 'ORD-20251125-0002', customer: 'Jane Smith', type: 'TAKEOUT', status: 'READY', total: 28.00, items: 2, createdAt: '2025-11-25T17:45:00' },
  { id: '3', orderNumber: 'ORD-20251125-0003', customer: 'Guest', type: 'DELIVERY', status: 'IN_PROGRESS', total: 52.00, items: 4, createdAt: '2025-11-25T18:00:00' },
  { id: '4', orderNumber: 'ORD-20251125-0004', customer: 'Mike Johnson', type: 'DINE_IN', status: 'PENDING', total: 35.50, items: 2, createdAt: '2025-11-25T18:15:00' },
  { id: '5', orderNumber: 'ORD-20251125-0005', customer: 'Sarah Wilson', type: 'TAKEOUT', status: 'CONFIRMED', total: 19.00, items: 1, createdAt: '2025-11-25T18:20:00' },
];

export function OrdersPage() {
  const [orders] = useState<Order[]>(DEMO_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="orders-page">
      <header className="orders-header">
        <h1>Orders</h1>
        <div className="orders-stats">
          <div className="stat">
            <span className="stat-value">{orders.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat">
            <span className="stat-value">{orders.filter(o => o.status === 'PENDING').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat">
            <span className="stat-value">€{orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</span>
            <span className="stat-label">Revenue</span>
          </div>
        </div>
      </header>

      <div className="orders-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <Filter size={20} />
          {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED'].map((status) => (
            <button
              key={status}
              className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Status</th>
              <th>Items</th>
              <th>Total</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="order-number">{order.orderNumber}</td>
                <td>{order.customer}</td>
                <td>
                  <span className={`type-badge type-${order.type.toLowerCase()}`}>
                    {order.type.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td>{order.items}</td>
                <td className="total">€{order.total.toFixed(2)}</td>
                <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn" title="View Details">
                      <Eye size={16} />
                    </button>
                    <button className="action-btn" title="More Actions">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
