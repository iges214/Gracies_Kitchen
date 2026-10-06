import { useState, useEffect } from 'react';
import ContactModal from './ContactModal';
import './BottomNav.css';

function BottomNav({ onOpenTracking, onOpenAdmin, onOpenContact, isContactOpen: controlledContactOpen }) {
  const [activeTab, setActiveTab] = useState('home');
  const [internalContactOpen, setInternalContactOpen] = useState(false);
  const isContactOpen = controlledContactOpen !== undefined ? controlledContactOpen : internalContactOpen;

  // Track scroll position to update active indicator dynamically
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 220;
      const menuEl = document.getElementById('menu');
      const aboutEl = document.getElementById('about');

      if (menuEl && scrollPos >= menuEl.offsetTop) {
        setActiveTab('menu');
      } else if (aboutEl && scrollPos >= aboutEl.offsetTop) {
        setActiveTab('about');
      } else {
        setActiveTab('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (tabKey, action) => {
    setActiveTab(tabKey);
    if (action) action();
  };

  const scrollToSection = (id) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className="bottom-navigation-bar" aria-label="Mobile Bottom Navigation">
        <div className="bottom-nav-container">
          
          {/* 1. Home */}
          <button
            type="button"
            className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home', () => scrollToSection('top'))}
            aria-label="Home"
          >
            <div className="nav-item-icon-wrap">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span className="nav-item-label">Home</span>
          </button>

          {/* 2. About */}
          <button
            type="button"
            className={`bottom-nav-item ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => handleNavClick('about', () => scrollToSection('about'))}
            aria-label="About Chef Gracie"
          >
            <div className="nav-item-icon-wrap">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path>
                <line x1="6" y1="17" x2="18" y2="17"></line>
              </svg>
            </div>
            <span className="nav-item-label">About</span>
          </button>

          {/* 3. Menu */}
          <button
            type="button"
            className={`bottom-nav-item ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => handleNavClick('menu', () => scrollToSection('menu'))}
            aria-label="Food Catalogue"
          >
            <div className="nav-item-icon-wrap">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
            </div>
            <span className="nav-item-label">Menu</span>
          </button>

          {/* 4. Track Order */}
          <button
            type="button"
            className={`bottom-nav-item ${activeTab === 'track' ? 'active' : ''}`}
            onClick={() => handleNavClick('track', onOpenTracking)}
            aria-label="Track Order Ticket"
          >
            <div className="nav-item-icon-wrap">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <span className="nav-item-label">Track</span>
          </button>

          {/* 5. Contact Us */}
          <button
            type="button"
            className={`bottom-nav-item ${activeTab === 'contact' || isContactOpen ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('contact');
              if (onOpenContact) {
                onOpenContact();
              } else {
                setInternalContactOpen(true);
              }
            }}
            aria-label="Contact Us"
          >
            <div className="nav-item-icon-wrap">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <span className="nav-item-label">Contact</span>
          </button>

        </div>
      </nav>

      {/* Contact Sheet housing phone, email, WhatsApp and social links (only when not controlled externally) */}
      {!onOpenContact && (
        <ContactModal 
          isOpen={isContactOpen} 
          onClose={() => setInternalContactOpen(false)}
          onOpenAdmin={onOpenAdmin}
        />
      )}
    </>
  );
}

export default BottomNav;
