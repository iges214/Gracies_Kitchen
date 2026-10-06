import { useState, useEffect } from 'react';
import FoodCard from './FoodCard';
import { MENU_CATEGORIES } from '../../data/menuData';
import { fetchFoods } from '../../services/api';
import './Menu.css';

function FoodCatalogue({ onSelectItem }) {
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAll, setShowAll] = useState(false);

  const loadMenu = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchFoods();
      setFoods(res.data || []);
      setIsLive(res.isLive);
      if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const filteredItems = selectedCategory === 'all'
    ? foods
    : foods.filter(item => item.category === selectedCategory);

  // If showAll is false, show initial 4 curated bestsellers, otherwise show all
  const displayedItems = showAll ? filteredItems : filteredItems.slice(0, 4);

  return (
    <section id="menu" className="menu-section">
      <div className="container">
        {/* Header Styled After Reference Image "OUR BESTSELLERS" */}
        <header className="menu-header">
          <div className="picks-kicker-row">
            <span className="kicker-line"></span>
            <span className="picks-kicker">Popular Picks</span>
            <span className="kicker-line"></span>
          </div>

          <h2 className="section-title-bestsellers">OUR BESTSELLERS</h2>

          <div className="catalogue-status-wrap">
            {isLive ? (
              <span className="live-status-pill online">
                <span className="pulse-dot"></span> Live Kitchen Catalogue
              </span>
            ) : (
              <span className="live-status-pill offline">
                Local Menu Mode
              </span>
            )}
          </div>

          {/* Category Filter Tabs */}
          <nav className="category-filter" aria-label="Menu Categories">
            {MENU_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setShowAll(true);
                }}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        </header>

        {/* Loading State */}
        {isLoading && (
          <div className="menu-grid">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="food-card-skeleton">
                <div className="skeleton-media"></div>
                <div className="skeleton-body">
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line text"></div>
                  <div className="skeleton-line price"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State with retry */}
        {!isLoading && errorMsg && (
          <div className="menu-alert-bar">
            <span>Notice: Displaying offline menu archive ({errorMsg}).</span>
            <button type="button" className="btn-retry" onClick={loadMenu}>
              Retry Live Sync ⟳
            </button>
          </div>
        )}

        {/* Food Grid (4 columns matching reference) */}
        {!isLoading && (
          <div className="menu-grid">
            {displayedItems.map(item => (
              <FoodCard 
                key={item.id} 
                item={item} 
                onCustomize={onSelectItem} 
              />
            ))}
          </div>
        )}

        {/* View Full Menu CTA (Terracotta Pill matching Hero buttons) */}
        {!isLoading && filteredItems.length > 4 && (
          <div className="menu-view-more">
            <button 
              type="button" 
              className="btn-view-all"
              onClick={() => setShowAll(prev => !prev)}
            >
              {showAll ? 'SHOW FEWER DISHES ↑' : `VIEW FULL MENU (${filteredItems.length} DISHES) →`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default FoodCatalogue;
