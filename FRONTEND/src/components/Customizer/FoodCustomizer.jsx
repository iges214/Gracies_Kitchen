import { useState } from 'react';
import { PEPPER_LEVELS, SPICE_LEVELS } from '../../data/menuData';
import './FoodCustomizer.css';

function FoodCustomizer({ item, onClose, onAddToCart }) {
  // 1. Litres state (defaults to minLitres)
  const [litres, setLitres] = useState(item.minLitres || 1);

  // 2. Included base protein selection (defaults to first available option)
  const [selectedProtein, setSelectedProtein] = useState(item.proteinOptions[0]);

  // 3. Extra protein quantities map: { 'extra-beef': 1, 'extra-goat': 2 }
  const [extraProteins, setExtraProteins] = useState({});

  // 4. Taste preference modifiers
  const [pepperLevel, setPepperLevel] = useState('Medium');
  const [spiceLevel, setSpiceLevel] = useState('Standard');

  // 5. Favorite heart state toggle
  const [isFavorite, setIsFavorite] = useState(false);

  // --- Dynamic Pricing Engine ---
  // Formula: (Litres * Protein Price Per Litre) + Sum(Extra Portions * Unit Price)
  // Volume Discount: 10% off each litre starting from the 2nd litre!
  const baseLitrePrice = selectedProtein.pricePerLitre;
  
  // First litre is full price; additional litres (if any) get 10% discount!
  const discountedAdditionalLitres = litres > 1 
    ? (litres - 1) * (baseLitrePrice * 0.9) 
    : 0;
  
  const baseCost = litres === 1 
    ? baseLitrePrice 
    : baseLitrePrice + discountedAdditionalLitres;

  const extraCost = Object.entries(extraProteins).reduce((sum, [extraId, qty]) => {
    const extraItem = item.extraProteins?.find(p => p.id === extraId);
    return sum + (extraItem ? extraItem.price * qty : 0);
  }, 0);

  const totalItemPrice = Math.round(baseCost + extraCost);

  // --- Handlers ---
  const handleExtraQuantityChange = (extraId, delta) => {
    setExtraProteins(prev => {
      const current = prev[extraId] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[extraId];
        return copy;
      }
      return { ...prev, [extraId]: updated };
    });
  };

  const handleAddOrder = () => {
    const configuredItem = {
      id: `${item.id}-${Date.now()}`,
      foodId: item.id,
      foodName: item.name,
      litres,
      selectedProtein: {
        id: selectedProtein.id,
        name: selectedProtein.name,
        pricePerLitre: selectedProtein.pricePerLitre,
      },
      extraProteins: Object.entries(extraProteins).map(([id, qty]) => {
        const extraDef = item.extraProteins.find(p => p.id === id);
        return {
          id,
          name: extraDef.name,
          unitPrice: extraDef.price,
          quantity: qty,
          subtotal: extraDef.price * qty,
        };
      }),
      pepperLevel,
      spiceLevel,
      unitTotal: totalItemPrice,
    };

    onAddToCart(configuredItem);
    onClose();
  };

  return (
    <div className="customizer-overlay" onClick={onClose}>
      <div className="customizer-modal mobile-detail-view" onClick={e => e.stopPropagation()}>
        
        {/* Top Hero Food Media (Inspired by Reference Image 1) */}
        <div className="detail-media-header">
          <img src={item.image} alt={item.name} className="detail-hero-img" />
          
          <button 
            type="button" 
            className="media-nav-btn back-btn" 
            onClick={onClose} 
            aria-label="Go Back"
          >
            ←
          </button>

          <button 
            type="button" 
            className={`media-nav-btn heart-btn ${isFavorite ? 'liked' : ''}`}
            onClick={() => setIsFavorite(prev => !prev)}
            aria-label="Save to Favorites"
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        {/* Floating Detail & Customization Sheet */}
        <div className="detail-content-sheet">
          {/* Tag, Title, Rating, and Price Row */}
          <div className="sheet-header">
            <span className="spice-tag-pill">{item.category.toUpperCase()}</span>
            <div className="title-price-row">
              <h3 className="sheet-food-title">{item.name}</h3>
              <span className="sheet-food-price">₦{totalItemPrice.toLocaleString()}</span>
            </div>
            
            <div className="sheet-rating-row">
              <span className="rating-stars">★ 4.9</span>
              <span className="rating-count">(140+ orders)</span>
              {litres > 1 && (
                <span className="volume-discount-applied">
                  🎉 10% Vol. Discount Applied!
                </span>
              )}
            </div>

            <p className="sheet-description">{item.description}</p>
          </div>

          <div className="sheet-divider"></div>

          {/* Section: Customize Options */}
          <div className="customize-section-title">Customize Your Order</div>

          {/* 1. Volume Stepper */}
          <div className="customizer-block">
            <div className="block-label-row">
              <label className="block-label">Container Volume</label>
              <span className="block-hint">{item.minLitres}L minimum order</span>
            </div>
            
            <div className="volume-pills-row">
              {[1, 2, 3, 4, 5].filter(v => v >= item.minLitres && v <= item.maxLitres).map(vol => (
                <button
                  key={vol}
                  type="button"
                  className={`vol-pill ${litres === vol ? 'active' : ''}`}
                  onClick={() => setLitres(vol)}
                >
                  {vol} {vol === 1 ? 'Litre' : 'Litres'}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Included Protein Selection */}
          <div className="customizer-block">
            <div className="block-label-row">
              <label className="block-label">Select Included Protein</label>
              <span className="block-hint">Cooked inside your pot</span>
            </div>
            <div className="protein-selector-list">
              {item.proteinOptions.map(p => {
                const isSelected = selectedProtein.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`protein-radio-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedProtein(p)}
                  >
                    <span className="protein-name">{p.name}</span>
                    <span className="protein-price">₦{p.pricePerLitre.toLocaleString()}/L</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Extra Protein Portions */}
          {item.extraProteins && item.extraProteins.length > 0 && (
            <div className="customizer-block">
              <div className="block-label-row">
                <label className="block-label">Extra Protein Portions</label>
                <span className="block-hint">Packed on the side</span>
              </div>
              <div className="extra-proteins-container">
                {item.extraProteins.map(extra => {
                  const qty = extraProteins[extra.id] || 0;
                  return (
                    <div key={extra.id} className="extra-portion-row">
                      <div className="extra-label">
                        <span className="extra-title">{extra.name}</span>
                        <span className="extra-cost">+₦{extra.price.toLocaleString()}</span>
                      </div>
                      <div className="extra-qty-stepper">
                        <button
                          type="button"
                          className="mini-step-btn"
                          onClick={() => handleExtraQuantityChange(extra.id, -1)}
                          disabled={qty === 0}
                        >
                          −
                        </button>
                        <span className="mini-qty-val">{qty}</span>
                        <button
                          type="button"
                          className="mini-step-btn"
                          onClick={() => handleExtraQuantityChange(extra.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Pepper & Spice Preferences */}
          <div className="customizer-block preferences-split">
            <div>
              <label className="block-label">Pepper Heat</label>
              <div className="chips-container">
                {PEPPER_LEVELS.map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    className={`heat-chip ${pepperLevel === lvl ? 'active' : ''}`}
                    onClick={() => setPepperLevel(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block-label">Aromatic Spice</label>
              <div className="chips-container">
                {SPICE_LEVELS.map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    className={`heat-chip ${spiceLevel === lvl ? 'active' : ''}`}
                    onClick={() => setSpiceLevel(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar (Inspired by Image 1) */}
        <footer className="detail-bottom-bar">
          <div className="bar-stepper">
            <button
              type="button"
              className="bar-step-btn"
              onClick={() => setLitres(prev => Math.max(item.minLitres, prev - 1))}
              disabled={litres <= item.minLitres}
            >
              −
            </button>
            <span className="bar-stepper-val">{litres}L</span>
            <button
              type="button"
              className="bar-step-btn"
              onClick={() => setLitres(prev => Math.min(item.maxLitres, prev + 1))}
              disabled={litres >= item.maxLitres}
            >
              +
            </button>
          </div>

          <button 
            type="button" 
            className="btn-order-cta" 
            onClick={handleAddOrder}
          >
            <span>Customize & Order</span>
            <span className="btn-cta-price">₦{totalItemPrice.toLocaleString()}</span>
          </button>
        </footer>

      </div>
    </div>
  );
}

export default FoodCustomizer;
