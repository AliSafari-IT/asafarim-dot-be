import { useState } from 'react';
import { PlaceOrderForm } from '../components/PlaceOrderForm';
import { OrderResponse } from '../api/orderApi';
import './POSPage.css';

// Demo menu items (IDs must be valid UUIDs to match backend expectations)
const DEMO_MENU = [
  { id: '11111111-1111-1111-1111-111111111001', name: 'Margherita Pizza', price: 14.50, category: 'Pizza' },
  { id: '11111111-1111-1111-1111-111111111002', name: 'Pepperoni Pizza', price: 16.00, category: 'Pizza' },
  { id: '11111111-1111-1111-1111-111111111003', name: 'Caesar Salad', price: 9.50, category: 'Salads' },
  { id: '11111111-1111-1111-1111-111111111004', name: 'Grilled Salmon', price: 22.00, category: 'Mains' },
  { id: '11111111-1111-1111-1111-111111111005', name: 'Beef Burger', price: 15.50, category: 'Mains' },
  { id: '11111111-1111-1111-1111-111111111006', name: 'Pasta Carbonara', price: 13.50, category: 'Pasta' },
  { id: '11111111-1111-1111-1111-111111111007', name: 'Tiramisu', price: 7.50, category: 'Desserts' },
  { id: '11111111-1111-1111-1111-111111111008', name: 'Soft Drink', price: 3.00, category: 'Drinks' },
  { id: '11111111-1111-1111-1111-111111111009', name: 'House Wine', price: 6.50, category: 'Drinks' },
];

// Demo IDs
const DEMO_RESTAURANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const DEMO_LOCATION_ID = '660e8400-e29b-41d4-a716-446655440001';

export function POSPage() {
  const [recentOrders, setRecentOrders] = useState<OrderResponse[]>([]);

  const handleOrderPlaced = (order: OrderResponse) => {
    setRecentOrders((prev) => [order, ...prev.slice(0, 4)]);
  };

  return (
    <div className="pos-page">
      <header className="pos-header">
        <h1>Point of Sale</h1>
        <div className="pos-info">
          <span>Table: T5</span>
          <span>Server: John D.</span>
        </div>
      </header>

      <div className="pos-content">
        <PlaceOrderForm
          restaurantId={DEMO_RESTAURANT_ID}
          locationId={DEMO_LOCATION_ID}
          menuItems={DEMO_MENU}
          tableId="770e8400-e29b-41d4-a716-446655440002"
          onOrderPlaced={handleOrderPlaced}
        />

        {recentOrders.length > 0 && (
          <aside className="recent-orders">
            <h3>Recent Orders</h3>
            {recentOrders.map((order) => (
              <div key={order.id} className="recent-order-card">
                <div className="order-number">{order.orderNumber}</div>
                <div className="order-total">€{order.totalAmount.toFixed(2)}</div>
                <div className={`order-status status-${order.status.toLowerCase()}`}>
                  {order.status}
                </div>
              </div>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}
