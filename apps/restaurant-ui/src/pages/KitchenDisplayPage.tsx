import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import './KitchenDisplayPage.css';

interface KitchenOrder {
  id: string;
  orderNumber: string;
  type: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY';
  table?: string;
  items: { name: string; quantity: number; notes?: string; status: string }[];
  createdAt: string;
  priority: 'normal' | 'rush';
}

// Demo orders for kitchen display
const DEMO_KITCHEN_ORDERS: KitchenOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-20251125-0001',
    type: 'DINE_IN',
    table: 'T5',
    items: [
      { name: 'Margherita Pizza', quantity: 2, status: 'PREPARING' },
      { name: 'Caesar Salad', quantity: 1, status: 'PENDING' },
    ],
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    priority: 'normal',
  },
  {
    id: '2',
    orderNumber: 'ORD-20251125-0002',
    type: 'TAKEOUT',
    items: [
      { name: 'Beef Burger', quantity: 1, notes: 'No onions', status: 'PENDING' },
      { name: 'Soft Drink', quantity: 2, status: 'READY' },
    ],
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    priority: 'rush',
  },
  {
    id: '3',
    orderNumber: 'ORD-20251125-0003',
    type: 'DELIVERY',
    items: [
      { name: 'Pasta Carbonara', quantity: 1, status: 'PREPARING' },
      { name: 'Tiramisu', quantity: 1, status: 'PENDING' },
    ],
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
    priority: 'normal',
  },
];

export function KitchenDisplayPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>(DEMO_KITCHEN_ORDERS);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getElapsedTime = (createdAt: string) => {
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return `${diff}m`;
  };

  const markItemReady = (orderId: string, itemIndex: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map((item, i) =>
                i === itemIndex ? { ...item, status: 'READY' } : item
              ),
            }
          : order
      )
    );
  };

  const completeOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  return (
    <div className="kitchen-page">
      <header className="kitchen-header">
        <h1>Kitchen Display</h1>
        <div className="kitchen-clock">
          <Clock size={20} />
          <span>{currentTime.toLocaleTimeString()}</span>
        </div>
      </header>

      <div className="kitchen-grid">
        {orders.map((order) => (
          <div
            key={order.id}
            className={`kitchen-order-card priority-${order.priority}`}
          >
            <div className="kitchen-order-header">
              <div className="order-info">
                <span className="order-number">{order.orderNumber}</span>
                <span className={`order-type type-${order.type.toLowerCase()}`}>
                  {order.type.replace('_', ' ')}
                </span>
                {order.table && <span className="order-table">{order.table}</span>}
              </div>
              <div className="order-time">
                <Clock size={16} />
                <span>{getElapsedTime(order.createdAt)}</span>
              </div>
            </div>

            <div className="kitchen-order-items">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className={`kitchen-item status-${item.status.toLowerCase()}`}
                >
                  <div className="item-info">
                    <span className="item-qty">{item.quantity}x</span>
                    <span className="item-name">{item.name}</span>
                    {item.notes && (
                      <span className="item-notes">
                        <AlertCircle size={14} /> {item.notes}
                      </span>
                    )}
                  </div>
                  {item.status !== 'READY' ? (
                    <button
                      className="mark-ready-btn"
                      onClick={() => markItemReady(order.id, index)}
                    >
                      Ready
                    </button>
                  ) : (
                    <CheckCircle size={20} className="ready-icon" />
                  )}
                </div>
              ))}
            </div>

            {order.items.every((item) => item.status === 'READY') && (
              <button
                className="complete-order-btn"
                onClick={() => completeOrder(order.id)}
              >
                Complete Order
              </button>
            )}
          </div>
        ))}

        {orders.length === 0 && (
          <div className="no-orders">
            <CheckCircle size={48} />
            <p>All caught up! No pending orders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
