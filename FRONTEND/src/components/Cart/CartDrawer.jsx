import './CartDrawer.css';

function CartDrawer({ 
  isOpen, 
  onClose, 
  items = [], 
  onRemoveItem, 
  onUpdateLitres, 
  onProceedToCheckout 
}) {
  if (!isOpen) return null;

  // Calculate totals
  const totalLitres = items.reduce((sum, item) => sum + (item.litres || 1), 0);

  // Undiscounted subtotal
  const undiscountedSubtotal = items.reduce((sum, item) => {
    const baseLitrePrice = item.selectedProtein?.pricePerLitre || 0;
    const undiscountedBase = (item.litres || 1) * baseLitrePrice;
    const extraTotal = (item.extraProteins || []).reduce((eSum, extra) => eSum + (extra.unitPrice * extra.quantity), 0);
    return sum + undiscountedBase + extraTotal;
  }, 0);

  // Grand total (with 10% discount on additional litres)
  const grandTotal = items.reduce((sum, item) => sum + (item.unitTotal || 0), 0);

  // Volume savings
  const volumeSavings = Math.max(0, undiscountedSubtotal - grandTotal);

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={e => e.stopPropagation()}>
        {/* Drawer Header */}
        <header className="cart-drawer-header">
          <div className="drawer-title-group">
            <h3 className="drawer-title">Your Order Pot</h3>
            <span className="drawer-badge">{items.length} {items.length === 1 ? 'Dish' : 'Dishes'} • {totalLitres}L Total</span>
          </div>
          <button 
            type="button" 
            className="btn-drawer-close" 
            onClick={onClose}
            aria-label="Close Cart"
          >
            ✕
          </button>
        </header>

        {/* Drawer Body / Items List */}
        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <span className="empty-icon">🍲</span>
              <h4>Your pot is currently empty</h4>
              <p>Select your favorite dishes from our catalogue and tailor them to your desired volume and spice level.</p>
              <a href="#menu" className="btn-explore-menu" onClick={onClose}>
                Explore The Catalogue →
              </a>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map(item => {
                const itemBasePrice = item.selectedProtein?.pricePerLitre || 0;
                const itemSavings = item.litres > 1 
                  ? (item.litres - 1) * (itemBasePrice * 0.10)
                  : 0;

                return (
                  <article key={item.id} className="cart-item-card">
                    <div className="cart-item-top">
                      <div className="cart-item-info">
                        <h4 className="cart-item-name">{item.foodName}</h4>
                        <span className="cart-item-protein">
                          🍖 {item.selectedProtein?.name}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        className="btn-item-remove" 
                        onClick={() => onRemoveItem(item.id)}
                        title="Remove dish from order"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Extras */}
                    {item.extraProteins && item.extraProteins.length > 0 && (
                      <div className="cart-item-extras">
                        {item.extraProteins.map(extra => (
                          <span key={extra.id} className="cart-extra-pill">
                            +{extra.quantity}x {extra.name} (₦{(extra.unitPrice * extra.quantity).toLocaleString()})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Taste Modifiers */}
                    <div className="cart-item-taste">
                      <span className="taste-chip">🌶️ {item.pepperLevel} Pepper</span>
                      <span className="taste-chip">🌿 {item.spiceLevel} Spice</span>
                    </div>

                    {/* Volume Adjuster & Item Subtotal */}
                    <div className="cart-item-bottom">
                      <div className="cart-litres-stepper">
                        <button
                          type="button"
                          className="cart-step-btn"
                          onClick={() => onUpdateLitres(item.id, Math.max(1, item.litres - 1))}
                          disabled={item.litres <= 1}
                        >
                          −
                        </button>
                        <span className="cart-litres-val">{item.litres} Litre{item.litres > 1 ? 's' : ''}</span>
                        <button
                          type="button"
                          className="cart-step-btn"
                          onClick={() => onUpdateLitres(item.id, Math.min(10, item.litres + 1))}
                          disabled={item.litres >= 10}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-pricing">
                        {itemSavings > 0 && (
                          <span className="item-savings-pill">
                            -₦{Math.round(itemSavings).toLocaleString()} Vol. Off
                          </span>
                        )}
                        <span className="cart-item-price">
                          ₦{item.unitTotal?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {items.length > 0 && (
          <footer className="cart-drawer-footer">
            <div className="cart-summary-breakdown">
              <div className="summary-row">
                <span className="summary-label">Volume Subtotal</span>
                <span className="summary-val">₦{Math.round(undiscountedSubtotal).toLocaleString()}</span>
              </div>

              {volumeSavings > 0 && (
                <div className="summary-row savings">
                  <span className="summary-label">🎉 10% Vol. Savings (2nd+ Litres)</span>
                  <span className="summary-val savings-val">-₦{Math.round(volumeSavings).toLocaleString()}</span>
                </div>
              )}

              <div className="summary-row lead-notice">
                <span>⏱️ Delivery Notice:</span>
                <span>Requires 2–24hr advance notice</span>
              </div>

              <div className="summary-row grand-total-row">
                <span className="grand-label">Authoritative Grand Total</span>
                <span className="grand-val">₦{Math.round(grandTotal).toLocaleString()}</span>
              </div>
            </div>

            <button 
              type="button" 
              className="btn-checkout-cta"
              onClick={onProceedToCheckout}
            >
              <span>Proceed to Checkout</span>
              <span className="btn-checkout-total">₦{Math.round(grandTotal).toLocaleString()} →</span>
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
