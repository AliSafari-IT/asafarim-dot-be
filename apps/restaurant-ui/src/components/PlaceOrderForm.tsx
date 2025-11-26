/**
 * Restaurant Management System - Place Order Form Component
 * React + TypeScript implementation using CSS variables from @asafarim/shared-tokens
 */

import { useState } from 'react';
import {
  orderApi,
  PlaceOrderRequest,
  OrderResponse,
  OrderType,
  OrderApiError,
} from '../api/orderApi';
import './PlaceOrderForm.css';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

interface PlaceOrderFormProps {
  restaurantId: string;
  locationId: string;
  menuItems: MenuItem[];
  customerId?: string;
  tableId?: string;
  onOrderPlaced?: (order: OrderResponse) => void;
  onError?: (error: OrderApiError) => void;
}

export function PlaceOrderForm({
  restaurantId,
  locationId,
  menuItems,
  customerId,
  tableId,
  onOrderPlaced,
  onError,
}: PlaceOrderFormProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [notes, setNotes] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.menuItem.id !== menuItemId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.menuItem.id === menuItemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      setError('Please add at least one item to your order');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const request: PlaceOrderRequest = {
      restaurantId,
      locationId,
      type: orderType,
      tableId: tableId || null,
      customerId,
      items: cart.map((item) => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        notes: item.notes,
      })),
      discountCode: discountCode || undefined,
      notes: notes || undefined,
    };

    try {
      const order = await orderApi.placeOrder(request);
      setCart([]);
      setNotes('');
      setDiscountCode('');
      onOrderPlaced?.(order);
    } catch (err) {
      if (err instanceof OrderApiError) {
        setError(err.message);
        onError?.(err);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="place-order-form">
      <div className="order-form-grid">
        {/* Menu Section */}
        <section className="menu-section">
          <h2>Menu</h2>
          <div className="menu-grid">
            {menuItems.map((item) => (
              <div key={item.id} className="menu-item-card">
                <div className="menu-item-info">
                  <h3>{item.name}</h3>
                  <span className="menu-item-category">{item.category}</span>
                  <span className="menu-item-price">
                    €{item.price.toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  className="add-to-cart-btn"
                  onClick={() => addToCart(item)}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Cart Section */}
        <section className="cart-section">
          <h2>Your Order</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Order Type */}
            <div className="form-group">
              <label>Order Type</label>
              <div className="order-type-buttons">
                {(['DINE_IN', 'TAKEOUT', 'DELIVERY'] as OrderType[]).map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      className={`order-type-btn ${
                        orderType === type ? 'active' : ''
                      }`}
                      onClick={() => setOrderType(type)}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Cart Items */}
            <div className="cart-items">
              {cart.length === 0 ? (
                <p className="empty-cart">Your cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.menuItem.id} className="cart-item">
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.menuItem.name}</span>
                      <span className="cart-item-price">
                        €{(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.menuItem.id, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.menuItem.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discount Code */}
            <div className="form-group">
              <label htmlFor="discountCode">Discount Code</label>
              <input
                id="discountCode"
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Enter code"
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="notes">Special Instructions</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests?"
                rows={3}
              />
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>€{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (9%)</span>
                <span>€{(calculateSubtotal() * 0.09).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>€{(calculateSubtotal() * 1.09).toFixed(2)}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-order-btn"
              disabled={isSubmitting || cart.length === 0}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default PlaceOrderForm;
