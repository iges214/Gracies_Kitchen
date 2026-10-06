import './AboutChef.css';

function AboutChef() {
  return (
    <section id="about" className="about-editorial-section">
      <div className="container about-editorial-container">
        
        {/* Left Column: Portrait packaging freshly prepared dishes */}
        <div className="about-portrait-col">
          <div className="portrait-card">
            <img 
              src="/images/about_chef_packaging.jpg" 
              alt="Chef Gracie carefully packaging freshly prepared batches in kitchen" 
              className="portrait-img"
              loading="lazy"
            />
          </div>
        </div>

        {/* Center Column: Bio & Core Mission */}
        <div className="about-bio-col">
          <span className="about-kicker">HI, I'M CHEF GRACIE</span>
          
          <h2 className="about-editorial-title">
            Your Private Chef For <br />
            <span className="title-script-italic">Fresh Batch Cooking</span>
          </h2>

          <p className="about-editorial-desc">
            Between demanding corporate hours, family routines, or living solo, finding the time 
            to cook wholesome, authentic home meals is tough. That's why I created <strong>Gracies Kitchen</strong>.
          </p>

          <p className="about-editorial-desc secondary">
            I cook authentic Nigerian soups, stews, and rice in <strong>1-litre, 2-litre, and 5-litre pots</strong>—prepared 
            fresh to order strictly when you request it. Whether you are a busy professional needing healthy weekly meal prep, 
            a family looking to stock the freezer with rich soups, or a bachelor who wants proper home cooking without the hassle, 
            I tailor each container to your favorite proteins and pepper levels.
          </p>

          <a href="#menu" className="btn-about-olive">
            Explore Batch Menu & Pricing →
          </a>
        </div>

        {/* Right Column: 3 Value Feature Pillars */}
        <div className="about-features-col">
          
          {/* Pillar 1 */}
          <div className="feature-pill-item">
            <div className="feature-circle-badge">
              <span className="badge-svg-icon">🍲</span>
            </div>
            <div className="feature-text-group">
              <h4 className="feature-heading">Cooked by the Litre</h4>
              <p className="feature-subtext">Fresh 1L, 2L & 5L containers made to order</p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="feature-pill-item">
            <div className="feature-circle-badge">
              <span className="badge-svg-icon">⏱️</span>
            </div>
            <div className="feature-text-group">
              <h4 className="feature-heading">For Busy Lifestyles</h4>
              <p className="feature-subtext">Perfect for workers, families & bachelors</p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="feature-pill-item">
            <div className="feature-circle-badge">
              <span className="badge-svg-icon">🌶️</span>
            </div>
            <div className="feature-text-group">
              <h4 className="feature-heading">Custom Cuts & Heat</h4>
              <p className="feature-subtext">Select your proteins & calibrated spice levels</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default AboutChef;
