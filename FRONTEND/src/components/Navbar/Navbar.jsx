import './Navbar.css';

function Navbar({ cartCount = 0, onOpenCart, onOpenTracking, onOpenAdmin, currentUser, onOpenAuth, adminUser, onOpenContact }) {
  return (
    <header className="navbar">
      <div className="container navbar-container">
        
        {/* Brand / Logo (Inspired by Reference Image Savor mark) */}
        <a href="#" className="navbar-brand">
          <div className="brand-logo-wrap">
            {/* <span className="brand-leaf-icon">🌱</span> */}
            <div className="brand-titles">
              <span className="brand-primary">Gracie's</span>
              <span className="brand-subline">BY CHEF GRACIE</span>
              <span className="brand-tagline">GOOD FOOD, HAPPIER DAYS</span>
            </div>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="navbar-nav">
          <a href="#" className="nav-link active">Home</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#menu" className="nav-link">Menu</a>
          <a href="#testimonials" className="nav-link">Reviews</a>
          <button 
            type="button" 
            className="nav-link nav-link-text-btn"
            onClick={onOpenContact}
          >
            Contact
          </button>
          <button 
            type="button" 
            className="nav-link-btn track-btn"
            onClick={onOpenTracking}
          >
            🔍 Track Order
          </button>
          {/* Only show Admin Suite if user is already an authenticated Admin */}
          {adminUser?.role === 'Admin' && (
            <button 
              type="button" 
              className="nav-link-btn admin-btn"
              onClick={onOpenAdmin}
            >
              👑 Admin Suite
            </button>
          )}
        </nav>

        {/* Right Group: User Auth + Cart CTA */}
        <div className="navbar-right-group">
          {/* Public Customer Sign In / Account Button */}
          {currentUser ? (
            <button 
              type="button" 
              className="btn-navbar-user"
              onClick={onOpenAuth}
              title="View Profile & Orders"
            >
              <span className="user-avatar-pip">
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </span>
              <span className="user-name-label">
                {currentUser.fullName ? currentUser.fullName.split(' ')[0] : 'Account'}
              </span>
            </button>
          ) : (
            <button 
              type="button" 
              className="btn-navbar-signin"
              onClick={onOpenAuth}
            >
              Sign In
            </button>
          )}

          <button 
            type="button" 
            className="btn-navbar-cart" 
            onClick={onOpenCart}
            aria-label="Order Cart"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cart-pot-icon">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className="cart-label">Order Pot</span>
            <span className="cart-badge-count">{cartCount}</span>
          </button>
        </div>

      </div>
    </header>
  );
}

export default Navbar;
