import { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import AboutChef from './components/About/AboutChef';
import FoodCatalogue from './components/Menu/FoodCatalogue';
import VolumeDiscountBanner from './components/Promo/VolumeDiscountBanner';
import Testimonials from './components/Testimonials/Testimonials';
import Footer from './components/Footer/Footer';
import FoodCustomizer from './components/Customizer/FoodCustomizer';
import CartDrawer from './components/Cart/CartDrawer';
import CheckoutModal from './components/Checkout/CheckoutModal';
import TicketTrackingModal from './components/Tracking/TicketTrackingModal';
import AdminPortal from './components/Admin/AdminPortal';
import BottomNav from './components/Navigation/BottomNav';
import ContactModal from './components/Navigation/ContactModal';
import AuthModal from './components/Auth/AuthModal';
import { getUserData, getAdminUser } from './services/api';

function App() {
  // Global State
  const [selectedFood, setSelectedFood] = useState(null);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('gk_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Ticket Tracking, Admin Portal & Contact Modals
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderCode, setTrackingOrderCode] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Authentication & Profile State (Requirement 1, 2, 11)
  const [currentUser, setCurrentUser] = useState(() => getUserData());
  const [adminUser, setAdminUser] = useState(() => getAdminUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');

  // Sync cart with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gk_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  // Check URL query parameters and pathname on initial page load (Requirements 1 & 4)
  useEffect(() => {
    try {
      const pathname = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);

      const trackParam = params.get('track');
      if (trackParam) {
        setTrackingOrderCode(trackParam.trim().toUpperCase());
        setIsTrackingOpen(true);
      }

      // Requirement 1: Administrator entry point (/admin, /admin/login, or ?admin=true)
      if (
        pathname === '/admin' || 
        pathname === '/admin/login' || 
        pathname.startsWith('/admin') || 
        params.get('admin') === 'true'
      ) {
        setIsAdminOpen(true);
      }

      // Requirement 1: Public user entry points (/login, /register)
      if (pathname === '/login') {
        setAuthInitialMode('login');
        setIsAuthOpen(true);
      } else if (pathname === '/register') {
        setAuthInitialMode('register');
        setIsAuthOpen(true);
      }
    } catch (e) {
      console.warn('Could not parse URL query parameters or route path', e);
    }
  }, []);

  // Cart operations
  const handleAddToCart = (configuredItem) => {
    setCartItems(prev => [...prev, configuredItem]);
    setIsCartOpen(true); // Open drawer immediately so customer sees their customized pot
  };

  const handleRemoveFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateLitres = (itemId, newLitres) => {
    setCartItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;

      // Recalculate line total with 10% volume discount starting from 2nd litre
      const baseLitrePrice = item.selectedProtein?.pricePerLitre || 0;
      const discountedAdditionalLitres = newLitres > 1 
        ? (newLitres - 1) * (baseLitrePrice * 0.9) 
        : 0;
      const baseCost = newLitres === 1 
        ? baseLitrePrice 
        : baseLitrePrice + discountedAdditionalLitres;

      const extraCost = (item.extraProteins || []).reduce(
        (sum, ex) => sum + (ex.unitPrice * ex.quantity), 
        0
      );

      return {
        ...item,
        litres: newLitres,
        unitTotal: Math.round(baseCost + extraCost)
      };
    }));
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('gk_cart_items');
    } catch (e) {
      console.warn('Failed to clear cart localStorage', e);
    }
  };

  const handleOpenTracking = (orderCode = '') => {
    setTrackingOrderCode(orderCode);
    setIsTrackingOpen(true);
  };

  return (
    <div className="app">
      {/* 1. Sticky Navigation Bar with live cart counter, tracking trigger, user auth & contact */}
      <Navbar 
        cartCount={cartItems.length} 
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenTracking={() => handleOpenTracking()}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthInitialMode(currentUser ? 'orders' : 'login');
          setIsAuthOpen(true);
        }}
        adminUser={adminUser}
      />

      <main>
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. About Chef Gracie */}
        <AboutChef />

        {/* 4. Food Catalogue & Category Filter (Live API with Fallback) */}
        <FoodCatalogue onSelectItem={(item) => setSelectedFood(item)} />

        {/* 5. Volume Batch Discount Banner */}
        <VolumeDiscountBanner />

        {/* 6. Testimonials Section */}
        <Testimonials />
      </main>

      {/* 7. Footer */}
      <Footer 
        onOpenTracking={() => handleOpenTracking()}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAuth={() => {
          setAuthInitialMode(currentUser ? 'orders' : 'login');
          setIsAuthOpen(true);
        }}
      />

      {/* 8. Food Customizer Modal */}
      {selectedFood && (
        <FoodCustomizer 
          item={selectedFood}
          onClose={() => setSelectedFood(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* 9. Slide-Out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateLitres={handleUpdateLitres}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* 10. Checkout & Confirmation Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={handleOrderSuccess}
        onTrackOrder={handleOpenTracking}
      />

      {/* 11. Customer Live Ticket & Order Tracking Modal */}
      <TicketTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderCode={trackingOrderCode}
      />

      {/* 12. Admin Management Suite & Kitchen Dashboard */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onOpenTicketTracking={(code) => handleOpenTracking(code)}
        onAdminAuthChange={(admin) => setAdminUser(admin)}
      />

      {/* 13. Mobile Bottom Navigation Bar & Contact Us Sheet */}
      <BottomNav
        onOpenTracking={() => handleOpenTracking()}
        onOpenContact={() => setIsContactOpen(true)}
        isContactOpen={isContactOpen}
      />

      {/* 14. Customer Sign In, Registration & Order History Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
        onSignOut={() => {
          setCurrentUser(null);
        }}
        onTrackOrder={(orderCode) => {
          setIsAuthOpen(false);
          handleOpenTracking(orderCode);
        }}
      />

      {/* 15. Contact Sheet & Information Modal */}
      <ContactModal 
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}

export default App;
