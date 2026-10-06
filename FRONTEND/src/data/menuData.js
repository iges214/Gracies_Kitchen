export const MENU_CATEGORIES = [
  { id: 'all', name: 'All Dishes' },
  { id: 'soups', name: 'Signature Soups' },
  { id: 'rice', name: 'Rice Specialties' },
  { id: 'stews', name: 'Rich Stews & Sauces' },
];

export const PEPPER_LEVELS = ['None', 'Mild', 'Medium', 'Hot', 'Extra Hot'];
export const SPICE_LEVELS = ['Mild', 'Standard', 'Extra Rich'];

export const MENU_ITEMS = [
  {
    id: 'egusi-soup',
    name: 'Royal Egusi Soup',
    category: 'soups',
    description: 'Slow-cooked hand-peeled melon seeds, tender leafy greens, smoked crayfish, and authentic palm oil reduction.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    minLitres: 1,
    maxLitres: 10,
    // Included protein options with their respective price per litre for this dish
    proteinOptions: [
      { id: 'beef', name: 'Assorted Beef & Shaki', pricePerLitre: 12000 },
      { id: 'goat', name: 'Tender Goat Meat', pricePerLitre: 14500 },
      { id: 'chicken', name: 'Hard Local Chicken', pricePerLitre: 11000 },
      { id: 'catfish', name: 'Smoked Catfish & Stockfish', pricePerLitre: 15000 },
      { id: 'none', name: 'Vegetarian / No Meat', pricePerLitre: 9000 },
    ],
    // Extra protein add-on portions
    extraProteins: [
      { id: 'extra-goat', name: 'Extra Goat Meat (Portion)', price: 2500 },
      { id: 'extra-catfish', name: 'Extra Smoked Catfish (Piece)', price: 3000 },
      { id: 'extra-beef', name: 'Extra Assorted Beef (Portion)', price: 2000 },
    ]
  },
  {
    id: 'jollof-rice',
    name: 'Smoky Firewood Jollof Rice',
    category: 'rice',
    description: 'Signature party-style parboiled long-grain rice infused with red bell pepper reduction, plum tomatoes, and natural smoke.',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    minLitres: 1,
    maxLitres: 10,
    proteinOptions: [
      { id: 'chicken', name: 'Peppered Grilled Chicken', pricePerLitre: 9500 },
      { id: 'beef', name: 'Fried Assorted Beef', pricePerLitre: 10500 },
      { id: 'turkey', name: 'Crispy Peppered Turkey', pricePerLitre: 13000 },
      { id: 'goat', name: 'Asun Style Goat Meat', pricePerLitre: 13500 },
      { id: 'none', name: 'Rice Only (No Meat)', pricePerLitre: 7500 },
    ],
    extraProteins: [
      { id: 'extra-turkey', name: 'Extra Peppered Turkey', price: 3500 },
      { id: 'extra-chicken', name: 'Extra Grilled Chicken', price: 2200 },
      { id: 'extra-beef', name: 'Extra Beef Portion', price: 2000 },
    ]
  },
  {
    id: 'seafood-okro',
    name: 'Artisan Seafood Okro',
    category: 'soups',
    description: 'Fresh crunchy diced okra in light seafood broth loaded with jumbo prawns, crabs, calamari, and fresh herbs.',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
    minLitres: 1,
    maxLitres: 5,
    proteinOptions: [
      { id: 'seafood-deluxe', name: 'Deluxe Mixed Seafood (Prawns, Crab, Calamari)', pricePerLitre: 18000 },
      { id: 'fish-prawn', name: 'Fresh Croaker Fish & Jumbo Prawns', pricePerLitre: 16500 },
    ],
    extraProteins: [
      { id: 'extra-prawns', name: 'Extra Grilled Jumbo Prawns (Pair)', price: 4000 },
      { id: 'extra-crab', name: 'Extra Dressed Blue Crab', price: 3500 },
    ]
  },
  {
    id: 'ofada-sauce',
    name: 'Ayamase (Designer Ofada Stew)',
    category: 'stews',
    description: 'Bleached palm oil, green bell peppers, locust beans (iru), boiled eggs, and assorted bite-sized meats simmered to perfection.',
    image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80',
    minLitres: 1,
    maxLitres: 5,
    proteinOptions: [
      { id: 'assorted-offal', name: 'Traditional Assorted Meats & Boiled Eggs', pricePerLitre: 14000 },
      { id: 'boneless-beef', name: 'Boneless Beef & Smoked Fish', pricePerLitre: 15500 },
    ],
    extraProteins: [
      { id: 'extra-eggs', name: 'Extra Stewed Eggs (Pair)', price: 1000 },
      { id: 'extra-assorted', name: 'Extra Assorted Meat Portion', price: 2500 },
    ]
  }
];
