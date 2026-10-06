import './Menu.css';

function FoodCard({ item, onCustomize }) {
  // Compute minimum starting price per litre dynamically from available protein configurations
  const startingPrice = Math.min(...item.proteinOptions.map(p => p.pricePerLitre));

  return (
    <article className="food-card" onClick={() => onCustomize(item)}>
      <div className="food-card-media">
        <img src={item.image} alt={item.name} loading="lazy" />
        <span className="food-card-badge">{item.minLitres}L Min</span>
      </div>

      <div className="food-card-body">
        <h3 className="food-card-title">{item.name.toUpperCase()}</h3>
        <p className="food-card-desc">{item.description}</p>

        <div className="food-card-bottom-row">
          <div className="food-card-price">
            <span className="price-label">From </span>
            <span className="price-amount">₦{startingPrice.toLocaleString()}</span>
            <span className="price-unit">/L</span>
          </div>

          <button 
            type="button" 
            className="btn-card-add" 
            onClick={(e) => {
              e.stopPropagation();
              onCustomize(item);
            }}
            title="Customize & Order"
            aria-label={`Customize and order ${item.name}`}
          >
            <span className="plus-icon">+</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default FoodCard;
