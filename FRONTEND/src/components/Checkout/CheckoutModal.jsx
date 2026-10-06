import { useState } from 'react';
import { createOrder } from '../../services/api';
import './CheckoutModal.css';

function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems = [], 
  onOrderSuccess,
  onTrackOrder
}) {
  if (!isOpen) return null;

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  // Calculate default delivery time: 3 hours in the future (meeting 2-hour min lead time)
  const defaultDeliveryDate = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const formattedDefault = defaultDeliveryDate.toISOString().slice(0, 16);
  const minDeliveryDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [requestedDeliveryTime, setRequestedDeliveryTime] = useState(formattedDefault);
  const [orderNotes, setOrderNotes] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Totals
  const grandTotal = cartItems.reduce((sum, item) => sum + (item.unitTotal || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate Lead Time client-side first
    const selectedTime = new Date(requestedDeliveryTime);
    const now = new Date();
    const hoursAhead = (selectedTime - now) / (1000 * 60 * 60);

    if (hoursAhead < 1.95) {
      setErrorMsg('Gracie\'s Kitchen requires at least 2 hours advance notice to source and prepare your dishes fresh to order.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg('Your order pot is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Map cart items to backend DTO payload
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        deliveryAddress: deliveryAddress.trim(),
        requestedDeliveryTime: selectedTime.toISOString(),
        orderNotes: orderNotes.trim() || null,
        items: cartItems.map(item => ({
          foodId: item.foodId,
          litres: item.litres,
          proteinOptionId: item.selectedProtein.id,
          pepperLevel: item.pepperLevel,
          spiceLevel: item.spiceLevel,
          extras: (item.extraProteins || []).map(extra => ({
            extraId: extra.id,
            quantity: extra.quantity
          }))
        }))
      };

      const result = await createOrder(orderPayload);
      setConfirmedOrder(result);
      if (onOrderSuccess) {
        onOrderSuccess(result);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate WhatsApp Order Slip text
  const generateWhatsAppUrl = () => {
    if (!confirmedOrder) return '#';
    
    const itemsList = confirmedOrder.items.map(i => {
      const extrasStr = i.extras && i.extras.length > 0 
        ? ` + ${i.extras.map(e => `${e.quantity}x ${e.extraProteinName}`).join(', ')}` 
        : '';
      return `• ${i.foodName} (${i.litres}L, ${i.proteinName}, ${i.pepperLevel} Pepper, ${i.spiceLevel} Spice)${extrasStr}`;
    }).join('\n');

    const msg = `*NEW ORDER CONFIRMATION — GRACIES KITCHEN*\n` +
      `*Order Code:* ${confirmedOrder.orderCode}\n` +
      `*Customer:* ${confirmedOrder.customerName}\n` +
      `*Phone:* ${confirmedOrder.customerPhone}\n` +
      `*Delivery Address:* ${confirmedOrder.deliveryAddress}\n` +
      `*Scheduled Delivery:* ${new Date(confirmedOrder.requestedDeliveryTime).toLocaleString()}\n\n` +
      `*Order Summary:*\n${itemsList}\n\n` +
      `*Authoritative Total:* ₦${confirmedOrder.grandTotal.toLocaleString()}\n` +
      (confirmedOrder.volumeDiscountSavings > 0 ? `*Volume Savings:* ₦${confirmedOrder.volumeDiscountSavings.toLocaleString()}\n` : '') +
      (confirmedOrder.orderNotes ? `*Notes:* ${confirmedOrder.orderNotes}\n` : '') +
      `\n_Please confirm receipt and preparation of this order._`;

    return `https://wa.me/2348000000000?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="checkout-overlay" onClick={confirmedOrder ? undefined : onClose}>
      <div className="checkout-modal" onClick={e => e.stopPropagation()}>
        
        {/* State A: Order Confirmation View */}
        {confirmedOrder ? (
          <div className="confirmation-view">
            <div className="confirmation-header">
              <span className="success-badge">✓ Order Confirmed</span>
              <h2 className="confirmation-title">Thank You, {confirmedOrder.customerName.split(' ')[0]}!</h2>
              <p className="confirmation-subtitle">
                Chef Gracie has received your private kitchen request.
              </p>
            </div>

            {/* Reference Badge Card */}
            <div className="ref-code-card">
              <span className="ref-label">Unique Order Ticket Code</span>
              <span className="ref-code">{confirmedOrder.orderCode}</span>
              <span className="ref-note">Keep this code to check your order progress anytime until complete</span>
            </div>

            {/* Email Dispatched Banner */}
            <div className="conf-email-alert">
              <span>📧 Tracking ticket link has been sent to <strong>{confirmedOrder.customerEmail}</strong></span>
            </div>

            {/* Authoritative Financial Breakdown */}
            <div className="confirmation-summary-card">
              <div className="conf-row">
                <span>Status</span>
                <span className="conf-status-tag">{confirmedOrder.status}</span>
              </div>
              <div className="conf-row">
                <span>Requested Delivery</span>
                <strong>{new Date(confirmedOrder.requestedDeliveryTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</strong>
              </div>
              <div className="conf-row">
                <span>Delivery Address</span>
                <span className="conf-address-text">{confirmedOrder.deliveryAddress}</span>
              </div>
              <div className="conf-divider"></div>
              
              {/* Items Breakdown */}
              <div className="conf-items-list">
                {confirmedOrder.items.map((oi, idx) => (
                  <div key={idx} className="conf-dish-item">
                    <div className="conf-dish-header">
                      <strong>{oi.litres}L {oi.foodName}</strong>
                      <span className="conf-dish-price">₦{oi.itemTotal.toLocaleString()}</span>
                    </div>
                    <span className="conf-dish-specs">
                      {oi.proteinName} • {oi.pepperLevel} Pepper • {oi.spiceLevel} Spice
                    </span>
                    {oi.extras && oi.extras.length > 0 && (
                      <div className="conf-extras-sub">
                        {oi.extras.map((ex, eIdx) => (
                          <span key={eIdx}>+{ex.quantity}x {ex.extraProteinName}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="conf-divider"></div>

              <div className="conf-row">
                <span>Subtotal</span>
                <span>₦{confirmedOrder.subtotal.toLocaleString()}</span>
              </div>
              {confirmedOrder.volumeDiscountSavings > 0 && (
                <div className="conf-row savings">
                  <span>🎉 10% Volume Savings Applied</span>
                  <span>-₦{confirmedOrder.volumeDiscountSavings.toLocaleString()}</span>
                </div>
              )}
              <div className="conf-row grand-total">
                <span>Authoritative Grand Total</span>
                <span className="conf-grand-price">₦{confirmedOrder.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="confirmation-actions">
              <button
                type="button"
                className="btn-track-live-now"
                onClick={() => {
                  onClose();
                  if (onTrackOrder) onTrackOrder(confirmedOrder.orderCode);
                }}
              >
                🔍 Track Ticket Live Now ({confirmedOrder.orderCode}) →
              </button>

              <a 
                href={generateWhatsAppUrl()} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-whatsapp-slip"
              >
                <span>Send Order Slip via WhatsApp 💬</span>
              </a>

              <button 
                type="button" 
                className="btn-return-menu"
                onClick={onClose}
              >
                Return to Menu
              </button>
            </div>
          </div>
        ) : (
          /* State B: Checkout Form */
          <div className="checkout-form-view">
            <header className="checkout-header">
              <div>
                <span className="section-subtitle">Secure Dispatch</span>
                <h3 className="checkout-title">Complete Your Order</h3>
              </div>
              <button 
                type="button" 
                className="btn-close-modal" 
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </button>
            </header>

            {/* Order Brief Strip */}
            <div className="checkout-cart-strip">
              <div className="strip-info">
                <strong>{cartItems.length} Pot{cartItems.length > 1 ? 's' : ''} in Order</strong>
                <span>Calculated Total: <strong>₦{grandTotal.toLocaleString()}</strong></span>
              </div>
              <span className="strip-notice">Authoritative price verified on server</span>
            </div>

            {errorMsg && (
              <div className="checkout-error-banner">
                <span>⚠️ {errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="checkout-form">
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="customerName">
                  Full Name <span className="req">*</span>
                </label>
                <input
                  id="customerName"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Adebayo Johnson"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                />
              </div>

              {/* Phone and Email row */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="customerPhone">
                    Phone Number <span className="req">*</span>
                  </label>
                  <input
                    id="customerPhone"
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +234 803 123 4567"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="customerEmail">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    id="customerEmail"
                    type="email"
                    className="form-input"
                    placeholder="e.g. adebayo@example.com"
                    required
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="form-group">
                <label className="form-label" htmlFor="deliveryAddress">
                  Delivery Address & Landmarks <span className="req">*</span>
                </label>
                <textarea
                  id="deliveryAddress"
                  className="form-textarea"
                  placeholder="Full street address, apartment / estate name, nearest landmark"
                  rows="2"
                  required
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                ></textarea>
              </div>

              {/* Requested Delivery Date & Time (Enforcing 2-24hr Lead Time) */}
              <div className="form-group">
                <div className="label-with-hint">
                  <label className="form-label" htmlFor="requestedDeliveryTime">
                    Requested Delivery Time <span className="req">*</span>
                  </label>
                  <span className="lead-time-pill">Min 2hr Lead Time</span>
                </div>
                <input
                  id="requestedDeliveryTime"
                  type="datetime-local"
                  className="form-input"
                  min={minDeliveryDate}
                  required
                  value={requestedDeliveryTime}
                  onChange={e => setRequestedDeliveryTime(e.target.value)}
                />
                <span className="form-hint">
                  Each dish is prepared fresh to order. Please allow at least 2 to 24 hours lead time.
                </span>
              </div>

              {/* Order Notes */}
              <div className="form-group">
                <label className="form-label" htmlFor="orderNotes">
                  Special Instructions / Dietary Notes (Optional)
                </label>
                <textarea
                  id="orderNotes"
                  className="form-textarea"
                  placeholder="Any dietary restrictions, gate access codes, or specific instructions for Chef Gracie"
                  rows="2"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                ></textarea>
              </div>

              {/* Submit CTA */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-submit-order"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="btn-loading-state">
                      <span className="spinner"></span>
                      Verifying & Placing Order...
                    </span>
                  ) : (
                    <span>Confirm & Place Order • ₦{grandTotal.toLocaleString()}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default CheckoutModal;
