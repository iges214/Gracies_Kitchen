import './Footer.css';

function Footer({ onOpenTracking, onOpenAuth, onOpenContact }) {
  return (
    <footer id="contact" className="site-footer">
      <div className="container footer-container">
        {/* Brand & Mission */}
        <div className="footer-col brand-col">
          <a href="#" className="footer-brand">
            <span className="brand-accent">Gracies</span> Kitchen
          </a>
          <p className="footer-tagline">
            Bespoke private chef catering crafted in generous litre volumes. 
            Tailored protein selections and authentic slow-cooked depth for every occasion.
          </p>
          <div className="footer-social-links">
            <a href="https://wa.me/2349068925726" target="_blank" rel="noreferrer" className="social-pill" aria-label="WhatsApp">
              💬 WhatsApp
            </a>
            <a href="tel:+2349068025726" className="social-pill" aria-label="Phone">
              📞 Call Chef
            </a>
            <a href="mailto:orders@gracieskitchen.com" className="social-pill" aria-label="Email">
              ✉️ Email
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Navigation</h4>
          <ul className="footer-links">
            <li><a href="#about">About Chef Gracie</a></li>
            <li><a href="#menu">The Food Catalogue</a></li>
            {onOpenContact && (
              <li><button type="button" className="footer-link-btn" onClick={onOpenContact}>💬 Contact Channels & Socials</button></li>
            )}
            <li><button type="button" className="footer-link-btn" onClick={onOpenTracking}>🔍 Track Order Ticket</button></li>
            {onOpenAuth && (
              <li><button type="button" className="footer-link-btn" onClick={onOpenAuth}>👤 Customer Account</button></li>
            )}
          </ul>
        </div>

        {/* Service & Delivery Policies */}
        <div className="footer-col">
          <h4 className="footer-heading">Order Guidelines</h4>
          <ul className="footer-info">
            <li>
              <strong>Lead Time:</strong>
              <span>2 to 24 hours advance notice depending on container volume.</span>
            </li>
            <li>
              <strong>Minimum Batch:</strong>
              <span>1 Litre per dish container.</span>
            </li>
            <li>
              <strong>Volume Discount:</strong>
              <span>10% automatic reduction starting on your 2nd litre.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-row">
          <p>© {new Date().getFullYear()} SANDRA IGHOYIVWI. All Rights Reserved.</p>
          <p className="designed-note">Crafted with Pure CSS & ASP.NET Core.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
