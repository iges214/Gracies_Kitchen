import './VolumeDiscountBanner.css';

function VolumeDiscountBanner() {
  return (
    <section className="discount-section">
      <div className="container">
        <div className="discount-promo-banner">
          
          {/* Left Column: Clock / Delivery Prompt */}
          <div className="banner-col banner-left">
            <div className="banner-clock-icon">
              {/* Analog Clock SVG styled with Terracotta accent */}
              <svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="var(--color-terracotta)" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="32" cy="34" r="22" />
                <path d="M32 20v14l8 5" strokeWidth="3.6" />
                <path d="M22 10l-4-4M42 10l4-4" />
                <path d="M32 8v4" />
              </svg>
            </div>
            <div className="banner-lead-text">
              <span className="banner-kicker">HUNGRY & BUSY?</span>
              <h3 className="banner-punchline">
                WE DELIVER <br />
                <span>FRESH!</span>
              </h3>
            </div>
          </div>

          {/* Vertical Divider Line */}
          <div className="banner-divider"></div>

          {/* Center Column: 10% Discount & Coupon Pill */}
          <div className="banner-col banner-center">
            <span className="discount-get-label">GET</span>
            <div className="discount-headline-row">
              <span className="discount-huge-num">10%</span>
              <div className="discount-huge-sub">
                <span className="huge-off">OFF</span>
                <span className="huge-condition">ON YOUR 2ND+ LITRE</span>
              </div>
            </div>

            {/* Terracotta Coupon Pill matching Hero Button */}
            <div className="banner-coupon-pill">
              <span>AUTO-APPLIED IN CART</span>
            </div>

            <p className="banner-explanation">
              Save 10% on every additional litre for your weekly batch cooking. 
              The discount applies automatically during customization.
            </p>
          </div>

          {/* Right Column: Scooter Delivery Illustration */}
          <div className="banner-col banner-right">
            <div className="scooter-illustration-wrap">
              {/* Delivery Courier on Scooter SVG (Terracotta, Olive, Pure White, Dark Charcoal) */}
              <svg viewBox="0 0 120 90" width="115" height="85" fill="none">
                {/* Motion Lines */}
                <path d="M12 40h16M8 48h22M14 56h12" stroke="var(--color-terracotta)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
                
                {/* Wheels */}
                <circle cx="36" cy="68" r="14" fill="#12141a" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.8" />
                <circle cx="36" cy="68" r="5" fill="var(--color-terracotta)" />
                <circle cx="94" cy="68" r="14" fill="#12141a" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.8" />
                <circle cx="94" cy="68" r="5" fill="var(--color-terracotta)" />

                {/* Scooter Frame & Footboard (Terracotta and Olive) */}
                <path d="M36 68h28l8-22h22" stroke="var(--color-terracotta)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M94 68l-8-36h-8" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                <path d="M84 32l-2-6h6" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />

                {/* Dispatch Box on Rear Rack */}
                <rect x="22" y="32" width="22" height="24" rx="3" fill="#1e212b" stroke="var(--color-terracotta)" strokeWidth="1.6" />
                <path d="M26 42h14M26 48h10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

                {/* Courier Rider Silhouette */}
                <circle cx="68" cy="22" r="8" fill="var(--color-terracotta)" /> {/* Helmet */}
                <path d="M72 18h8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" /> {/* Visor */}
                <path d="M66 30l-8 16 12 12" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" /> {/* Torso & leg */}
                <path d="M64 33l16 8" stroke="var(--color-terracotta)" strokeWidth="4" strokeLinecap="round" /> {/* Arm */}
              </svg>
            </div>

            <a href="#menu" className="btn-banner-order">
              Order In Volume →
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}

export default VolumeDiscountBanner;
