import './Hero.css';

function Hero() {
  return (
    <section className="hero-section">
      {/* Background Hero Image of Chef Gracie in kitchen */}
      <div className="hero-bg-wrapper">
        <img 
          src="/images/hero_chef_kitchen.jpg" 
          alt="Chef Gracie preparing freshly cooked batches in kitchen" 
          className="hero-bg-img"
        />
        <div className="hero-overlay"></div>
      </div>

      <div className="container hero-container">
        {/* Left Editorial Text Column */}
        <div className="hero-content">
          <span className="hero-tag-kicker">
            PRIVATE CHEF MEAL PREP & BATCH COOKING
          </span>

          <h1 className="hero-title">
            Homemade Food <br />
            Cooked In Batches, <br />
            <span className="title-accent">Delivered In Litres.</span>
          </h1>

          <p className="hero-subtitle">
            Chef Gracie prepares hearty 1-litre, 2-litre, and 5-litre pots fresh to order for busy professionals, 
            families, and bachelors who crave authentic, slow-simmered home meals without the stress of cooking.
          </p>

          <div className="hero-actions">
            <a href="#menu" className="btn-hero-terracotta">
              Order By The Litre →
            </a>
          </div>

          {/* Value Badges */}
          <div className="hero-batch-pills">
            <div className="batch-pill-item">
              <span className="pill-icon">🍲</span>
              <span>1L & 2L Fresh Pots</span>
            </div>
            <div className="batch-pill-item">
              <span className="pill-icon">⏱️</span>
              <span>2–24hr Dispatch</span>
            </div>
            <div className="batch-pill-item">
              <span className="pill-icon">🎉</span>
              <span>10% Off from 2nd Litre</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
