import './ContactModal.css';

function ContactModal({ isOpen, onClose, onOpenAdmin }) {
  if (!isOpen) return null;

  return (
    <div className="contact-sheet-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="contact-sheet-title">
      <div className="contact-sheet-modal" onClick={e => e.stopPropagation()}>
        
        {/* Grab Handle for Native Bottom Sheet Feel */}
        <div className="sheet-drag-handle" onClick={onClose} aria-hidden="true"></div>

        {/* Header */}
        <div className="contact-sheet-header">
          <div className="sheet-header-text">
            <span className="sheet-badge">Get in Touch</span>
            <h3 id="contact-sheet-title" className="sheet-title">Contact Gracie's Kitchen</h3>
            <p className="sheet-subtitle">Reach out for bespoke private chef catering, event orders, or inquiries.</p>
          </div>
          <button 
            type="button" 
            className="sheet-close-btn" 
            onClick={onClose}
            aria-label="Close Contact Sheet"
          >
            ✕
          </button>
        </div>

        {/* Direct Contact Channels */}
        <div className="contact-channels-list">
          
          {/* WhatsApp Direct Chat */}
          <a 
            href="https://wa.me/2348000000000?text=Hello%20Chef%20Gracie,%20I%20would%20like%20to%20inquire%20about%20an%20order." 
            target="_blank" 
            rel="noreferrer"
            className="contact-channel-card whatsapp-card"
          >
            <div className="channel-icon-wrap wa-icon-bg">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.073-2.18-.541-1.637-.677-2.709-2.316-2.791-2.425-.082-.108-.669-.887-.669-1.691 0-.805.422-1.2.572-1.36.15-.16.328-.2.438-.2.11 0 .219.002.315.006.101.005.237-.038.371.285.144.343.491 1.2.535 1.287.043.088.072.19.014.304-.058.115-.088.187-.174.288-.088.1-.184.223-.263.3-.088.087-.18.181-.077.357.103.175.457.753.98 1.22 1.002.894 1.848 1.17 2.108 1.299.261.129.414.108.57-.072.155-.18.665-.774.843-1.039.177-.265.355-.221.597-.132.242.088 1.536.724 1.8.856.264.132.441.198.506.309.066.11.066.64-.078 1.045zm-3.398-12.416c-5.523 0-10 4.477-10 10 0 1.848.508 3.58 1.396 5.068l-1.48 5.408 5.564-1.459c1.432.81 3.076 1.272 4.825 1.272 5.522 0 10-4.477 10-10 0-5.523-4.478-10-10.305-10z"/>
              </svg>
            </div>
            <div className="channel-info">
              <div className="channel-title-row">
                <span className="channel-title">Chat on WhatsApp</span>
                <span className="channel-tag tag-fast">Fastest Response</span>
              </div>
              <span className="channel-val">+234 800 000 0000</span>
              <span className="channel-hint">Instant replies for customized meal pots</span>
            </div>
            <span className="channel-arrow">→</span>
          </a>

          {/* Direct Phone Call */}
          <a 
            href="tel:+2348000000000" 
            className="contact-channel-card phone-card"
          >
            <div className="channel-icon-wrap phone-icon-bg">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <div className="channel-info">
              <div className="channel-title-row">
                <span className="channel-title">Call Chef Gracie</span>
                <span className="channel-tag tag-call">Voice Call</span>
              </div>
              <span className="channel-val">+234 800 000 0000</span>
              <span className="channel-hint">Direct line for booking consultations</span>
            </div>
            <span className="channel-arrow">→</span>
          </a>

          {/* Email Address 1: Orders */}
          <a 
            href="mailto:orders@gracieskitchen.com?subject=Inquiry%20-%20Gracie's%20Kitchen" 
            className="contact-channel-card email-card"
          >
            <div className="channel-icon-wrap email-icon-bg">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div className="channel-info">
              <div className="channel-title-row">
                <span className="channel-title">Orders & Catering Email</span>
              </div>
              <span className="channel-val">orders@gracieskitchen.com</span>
              <span className="channel-hint">Corporate events, private dinners & receipts</span>
            </div>
            <span className="channel-arrow">→</span>
          </a>

          {/* Email Address 2: General / Chef */}
          <a 
            href="mailto:chef@gracieskitchen.com?subject=Consultation%20with%20Chef%20Gracie" 
            className="contact-channel-card email-card"
          >
            <div className="channel-icon-wrap email-icon-bg">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </div>
            <div className="channel-info">
              <div className="channel-title-row">
                <span className="channel-title">Chef Gracie Personal Desk</span>
              </div>
              <span className="channel-val">chef@gracieskitchen.com</span>
              <span className="channel-hint">Collaborations, media & private inquiries</span>
            </div>
            <span className="channel-arrow">→</span>
          </a>

        </div>

        {/* Social Media Channels Grid */}
        <div className="social-channels-section">
          <h4 className="social-section-title">Follow & Connect on Socials</h4>
          <div className="social-cards-grid">
            
            {/* Instagram */}
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer"
              className="social-brand-card ig-brand-card"
            >
              <div className="social-card-icon ig-gradient">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              <div className="social-card-text">
                <span className="social-brand-name">Instagram</span>
                <span className="social-handle">@gracieskitchen</span>
              </div>
            </a>

            {/* TikTok */}
            <a 
              href="https://tiktok.com" 
              target="_blank" 
              rel="noreferrer"
              className="social-brand-card tt-brand-card"
            >
              <div className="social-card-icon tt-black">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.32a6.37 6.37 0 0 0-.86-.06A6.34 6.34 0 0 0 3 15.6a6.34 6.34 0 0 0 10.82 4.48 6.3 6.3 0 0 0 1.95-4.48V8.71a8.28 8.28 0 0 0 4.82 1.48v-3.5h-.01z"/>
                </svg>
              </div>
              <div className="social-card-text">
                <span className="social-brand-name">TikTok</span>
                <span className="social-handle">@gracieskitchen</span>
              </div>
            </a>

            {/* WhatsApp VIP Channel */}
            <a 
              href="https://wa.me/2348000000000" 
              target="_blank" 
              rel="noreferrer"
              className="social-brand-card wa-brand-card"
            >
              <div className="social-card-icon wa-green">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.073-2.18-.541-1.637-.677-2.709-2.316-2.791-2.425-.082-.108-.669-.887-.669-1.691 0-.805.422-1.2.572-1.36.15-.16.328-.2.438-.2.11 0 .219.002.315.006.101.005.237-.038.371.285.144.343.491 1.2.535 1.287.043.088.072.19.014.304-.058.115-.088.187-.174.288-.088.1-.184.223-.263.3-.088.087-.18.181-.077.357.103.175.457.753.98 1.22 1.002.894 1.848 1.17 2.108 1.299.261.129.414.108.57-.072.155-.18.665-.774.843-1.039.177-.265.355-.221.597-.132.242.088 1.536.724 1.8.856.264.132.441.198.506.309.066.11.066.64-.078 1.045zm-3.398-12.416c-5.523 0-10 4.477-10 10 0 1.848.508 3.58 1.396 5.068l-1.48 5.408 5.564-1.459c1.432.81 3.076 1.272 4.825 1.272 5.522 0 10-4.477 10-10 0-5.523-4.478-10-10.305-10z"/>
                </svg>
              </div>
              <div className="social-card-text">
                <span className="social-brand-name">WhatsApp</span>
                <span className="social-handle">VIP Community</span>
              </div>
            </a>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ContactModal;
