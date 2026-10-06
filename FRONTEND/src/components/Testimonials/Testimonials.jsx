import './Testimonials.css';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Dr. Bolanle Adeyemi',
    role: 'Private Dinner Host',
    quote: 'Chef Gracie catered 5 litres of Egusi and Fisherman Soup for our anniversary dinner. The richness of the broth and tender goat meat left our guests asking for her contact all evening!',
    stars: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 2,
    name: 'Tunde Olatunji',
    role: 'Weekend Meal Prep Client',
    quote: 'Ordering by the litre has completely upgraded our weekly eating. The Smoky Firewood Jollof tastes like a proper celebration every single time, with the pepper level dialed in exactly as requested.',
    stars: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 3,
    name: 'Chioma Nwosu',
    role: 'Corporate Catering Organizer',
    quote: 'Punctual 4-hour scheduled delivery and pristine packaging. The Designer Ofada stew was out of this world. Gracies Kitchen is our permanent catering partner now.',
    stars: 5,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  }
];

function Testimonials() {
  return (
    <section id='testimonials' className="testimonials-section">
      <div className="container">
        <header className="testimonials-header">
          <span className="section-subtitle">Real Client Experiences</span>
          <h2 className="section-title">What People Say</h2>
          <p className="testimonials-lead">
            Read firsthand accounts from food lovers and event hosts who trust Gracies Kitchen with their tables.
          </p>
        </header>

        <div className="testimonials-grid">
          {TESTIMONIALS.map(t => (
            <article key={t.id} className="testimonial-card">
              <div className="stars-row">
                {'★'.repeat(t.stars)}
              </div>
              <blockquote className="testimonial-quote">
                "{t.quote}"
              </blockquote>
              <footer className="testimonial-author">
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  className="author-avatar" 
                  loading="lazy"
                />
                <div className="author-info">
                  <cite className="author-name">{t.name}</cite>
                  <span className="author-role">{t.role}</span>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
