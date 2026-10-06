import { useState, useEffect, useCallback } from 'react';
import { fetchOrderByCode } from '../../services/api';
import './TicketTrackingModal.css';

const STATUS_STEPS = [
  { key: 'Confirmed', label: 'Order Placed & Confirmed', description: 'Order reviewed by Chef Gracie and logged in kitchen system.' },
  { key: 'Preparing', label: 'In the Kitchen', description: 'Handmade palm oil reduction, custom seasonings, and fresh protein simmering.' },
  { key: 'Out for Delivery', label: 'Out for Dispatch', description: 'Packaged in insulated thermal pots and on route to your delivery address.' },
  { key: 'Delivered', label: 'Delivered & Complete', description: 'Dispatched and delivered. Enjoy your royal feast!' }
];

function getStatusIndex(status = '') {
  const norm = status.toLowerCase().replace(/[^a-z]/g, '');
  if (norm.includes('cancel')) return -1;
  if (norm.includes('deliver')) return 3;
  if (norm.includes('out') || norm.includes('dispatch')) return 2;
  if (norm.includes('prepar') || norm.includes('cook')) return 1;
  return 0; // Default: Confirmed / Pending
}

function TicketTrackingModal({ isOpen, onClose, initialOrderCode = '' }) {
  const [ticketInput, setTicketInput] = useState(initialOrderCode);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  const loadTicket = useCallback(async (code) => {
    if (!code || !code.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await fetchOrderByCode(code.trim().toUpperCase());
      setCurrentOrder(data);
      setTicketInput(data.orderCode);
      setLastRefreshedAt(new Date());
    } catch (err) {
      setErrorMsg(err.message || 'Unable to find ticket with this reference code.');
      setCurrentOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // When opened with an initial code, load immediately
  useEffect(() => {
    if (isOpen && initialOrderCode) {
      setTicketInput(initialOrderCode);
      loadTicket(initialOrderCode);
    }
  }, [isOpen, initialOrderCode, loadTicket]);

  // Auto-refresh interval (every 15s) while order is active and not yet delivered
  useEffect(() => {
    if (!isOpen || !currentOrder || !autoRefresh) return;
    
    // Stop auto-refresh if delivered or cancelled
    const currentIndex = getStatusIndex(currentOrder.status);
    if (currentIndex === 3 || currentIndex === -1) return;

    const interval = setInterval(() => {
      loadTicket(currentOrder.orderCode);
    }, 15000);

    return () => clearInterval(interval);
  }, [isOpen, currentOrder, autoRefresh, loadTicket]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTicket(ticketInput);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?track=${encodeURIComponent(currentOrder.orderCode)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const activeIndex = currentOrder ? getStatusIndex(currentOrder.status) : 0;
  const isCancelled = currentOrder && currentOrder.status.toLowerCase().includes('cancel');

  return (
    <div className="tracking-overlay" onClick={onClose}>
      <div className="tracking-modal" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <header className="tracking-modal-header">
          <div className="tracking-header-left">
            <span className="tracking-badge">Live Kitchen Dispatch</span>
            <h2 className="tracking-title">Track Your Order Ticket</h2>
          </div>
          <button 
            type="button" 
            className="btn-tracking-close" 
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        {/* Ticket Lookup Bar */}
        <form onSubmit={handleSearchSubmit} className="tracking-search-bar">
          <div className="tracking-input-wrap">
            <span className="tracking-input-prefix">#</span>
            <input
              type="text"
              className="tracking-input"
              placeholder="e.g. GK-1042"
              value={ticketInput}
              onChange={e => setTicketInput(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn-track-lookup"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Track Ticket'}
          </button>
        </form>

        {/* Error message */}
        {errorMsg && (
          <div className="tracking-error-box">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {/* Order Ticket Details Container */}
        {currentOrder && (
          <div className="tracking-ticket-content">
            
            {/* Ticket Header Strip */}
            <div className="ticket-header-strip">
              <div className="ticket-code-block">
                <span className="ticket-label">Tracking Code</span>
                <span className="ticket-code-display">{currentOrder.orderCode}</span>
              </div>
              <div className="ticket-status-pill-wrap">
                <span className={`status-pill status-${currentOrder.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {currentOrder.status}
                </span>
                {lastRefreshedAt && (
                  <span className="refresh-time">
                    Updated {lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>
            </div>

            {/* Stepper Progress Bar */}
            {!isCancelled ? (
              <div className="tracking-stepper">
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = activeIndex > idx;
                  const isCurrent = activeIndex === idx;
                  const isPending = activeIndex < idx;

                  return (
                    <div 
                      key={step.key} 
                      className={`step-item ${isCompleted ? 'step-completed' : ''} ${isCurrent ? 'step-current' : ''} ${isPending ? 'step-pending' : ''}`}
                    >
                      <div className="step-circle-wrapper">
                        <div className="step-circle">
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        {idx < STATUS_STEPS.length - 1 && <div className="step-line" />}
                      </div>
                      <div className="step-text">
                        <strong className="step-label">{step.label}</strong>
                        <span className="step-desc">{step.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="order-cancelled-banner">
                <h3>Order Cancelled</h3>
                <p>This order ticket has been marked as cancelled. Please contact Chef Gracie on WhatsApp if you have questions.</p>
              </div>
            )}

            {/* Order Info Grid */}
            <div className="tracking-info-grid">
              <div className="info-card">
                <span className="info-title">Customer & Contact</span>
                <strong>{currentOrder.customerName}</strong>
                <span>{currentOrder.customerPhone}</span>
                <span className="info-email">{currentOrder.customerEmail}</span>
              </div>

              <div className="info-card">
                <span className="info-title">Delivery Scheduled For</span>
                <strong>{new Date(currentOrder.requestedDeliveryTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                <span className="info-address">{currentOrder.deliveryAddress}</span>
              </div>
            </div>

            {currentOrder.orderNotes && (
              <div className="info-notes-card">
                <span className="info-title">Order Notes / Dietary Requests</span>
                <p>{currentOrder.orderNotes}</p>
              </div>
            )}

            {/* Dish Breakdown */}
            <div className="tracking-items-section">
              <h4 className="section-title">Fresh Pots in Preparation</h4>
              <div className="tracking-items-list">
                {currentOrder.items.map((item, idx) => (
                  <div key={idx} className="tracking-item-card">
                    <div className="item-main-row">
                      <div className="item-title-box">
                        <span className="item-litres-tag">{item.litres}L Pot</span>
                        <strong>{item.foodName}</strong>
                      </div>
                      <span className="item-price">₦{item.itemTotal.toLocaleString()}</span>
                    </div>

                    <div className="item-specs-line">
                      <span>🥩 {item.proteinName}</span>
                      <span>🌶️ {item.pepperLevel} Pepper</span>
                      <span>🌿 {item.spiceLevel} Spice</span>
                    </div>

                    {item.extras && item.extras.length > 0 && (
                      <div className="item-extras-list">
                        {item.extras.map((ex, eIdx) => (
                          <span key={eIdx} className="extra-tag">
                            +{ex.quantity}x {ex.extraProteinName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="tracking-totals-card">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₦{currentOrder.subtotal.toLocaleString()}</span>
                </div>
                {currentOrder.volumeDiscountSavings > 0 && (
                  <div className="total-row savings">
                    <span>🎉 10% Volume Savings Applied</span>
                    <span>-₦{currentOrder.volumeDiscountSavings.toLocaleString()}</span>
                  </div>
                )}
                <div className="total-row grand">
                  <span>Authoritative Grand Total</span>
                  <span className="grand-price">₦{currentOrder.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="tracking-actions-bar">
              <button 
                type="button" 
                className="btn-refresh-status"
                onClick={() => loadTicket(currentOrder.orderCode)}
                disabled={loading}
              >
                🔄 Refresh Live Status
              </button>

              <button 
                type="button" 
                className="btn-copy-ticket-link"
                onClick={handleCopyLink}
              >
                {copiedLink ? '✓ Tracking Link Copied!' : '🔗 Copy Ticket Link'}
              </button>

              <label className="toggle-autorefresh">
                <input 
                  type="checkbox" 
                  checked={autoRefresh} 
                  onChange={e => setAutoRefresh(e.target.checked)} 
                />
                <span>Auto-refresh every 15s</span>
              </label>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default TicketTrackingModal;
