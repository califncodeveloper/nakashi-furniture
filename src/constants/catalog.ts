import sofa from "@/assets/cat-sofa.jpg";
import bed from "@/assets/cat-bed.jpg";
import dining from "@/assets/cat-dining.jpg";
import chair from "@/assets/cat-chair.jpg";
import coffee from "@/assets/cat-coffee.jpg";
import wardrobe from "@/assets/cat-wardrobe.jpg";
import tv from "@/assets/cat-tv.jpg";
import other from "@/assets/cat-other.jpg";
import type { Category, Product } from "@/types/product";

export const categories: Category[] = [
  { slug: "sofas", name: "Sofas", image: sofa },
  { slug: "beds", name: "Beds", image: bed },
  { slug: "dining-tables", name: "Dining Tables", image: dining },
  { slug: "chairs", name: "Chairs", image: chair },
  { slug: "coffee-tables", name: "Coffee Tables", image: coffee },
  { slug: "wardrobes", name: "Wardrobes", image: wardrobe },
  { slug: "tv-units", name: "TV Units", image: tv },
  { slug: "other", name: "Other Furniture", image: other },
];

export const bestsellers: Product[] = [
  {
    id: "b1",
    sku: "NK-SOF-CHE-01",
    slug: "chesterfield-heritage-velvet-sofa",
    name: "The Chesterfield Heritage Velvet Sofa",
    category: "Sofas",
    badge: "Bestseller",
    price: 48999,
    originalPrice: 58999,
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=85",
    image_45:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=85",
    description:
      "Handcrafted solid teakwood frame upholstered in rich royal velvet with traditional deep button diamond tufting.",
    detailedDescription:
      "Designed and sculpted by master craftsmen at The Nakashi Furnitures, this iconic Chesterfield silhouette pairs timeless British heritage with authentic South Indian teakwood joinery. Built on kiln-dried Grade-A solid teakwood, the generous seating is layered with high-resilience foam and enveloped in plush, stain-resistant royal velvet. Featuring individually hand-hammered brass stud detailing along the rolled armrests, solid turned teak legs, and reinforced corner blocks, this centerpiece transforms any luxury living hall.",
    material: "Kiln-dried Solid Teakwood Frame, High-Resilience PU Foam, Premium Royal Velvet",
    colour: "Royal Emerald Green / Classic Navy Velvet",
    finish: "Hand-rubbed Natural Teak Polish with Brass Stud Accentuation",
    dimensions: '88" W × 37" D × 32" H (Seat Height: 18.5", Seat Depth: 24")',
    weight: "58 kg",
    warranty: "5-Year Comprehensive Frame & Teakwood Structural Warranty",
    assembly: "Pre-assembled (White-glove delivery & in-room placement included)",
    features: [
      "Grade-A solid teakwood frame with traditional mortise-and-tenon joinery",
      "Handcrafted deep button tufting across backrest and scrolled armrests",
      "Individually hand-hammered antiqued brass nailhead accents",
      "High-density 38-density pocket-spring supported cushions for lifelong shape retention",
      "Stain-resistant, pet-friendly luxury velvet upholstery with soft textured hand-feel",
      "Customizable fabric colours and teak wood stains upon request",
    ],
    careInstructions:
      "Vacuum regularly using a soft brush attachment. Blot spills immediately with a clean, dry absorbent cloth. Avoid direct harsh sunlight and prolonged exposure to moisture. Periodic teak wax maintains wood lustre.",
    deliveryInfo:
      "Complimentary white-glove delivery across Chennai within 2-4 business days. Insured wooden-crate transport across Tamil Nadu and South India.",
  },
  {
    id: "b2",
    sku: "NK-BED-ROY-02",
    slug: "royale-king-upholstered-bed-with-storage",
    name: "Royale King Upholstered Bed with Storage",
    category: "Beds",
    badge: "Bestseller",
    price: 64500,
    originalPrice: 72000,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=85",
    image_45:
      "https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1400&q=85",
    description:
      "Plush tall wingback headboard with smooth German pneumatic hydraulic storage beneath the solid teak mattress base.",
    detailedDescription:
      "The Royale King Bed brings modern palace indulgence into the master bedroom. Built around a robust solid teak perimeter and heavy-duty steel lifting framework, it conceals a vast, dust-sealed sub-bed storage chamber. The cushioned headboard is ergonomically angled for relaxed late-night reading, upholstered in breathable Belgian linen blend with vertical channel quilt seams.",
    material: "100% Solid Seasoned Teakwood, German Hydraulic Gas-Lifts, Belgian Linen Blend",
    colour: "Oatmeal Beige / Charcoal Slate",
    finish: "Warm Walnut Matte Polish on exposed teak borders",
    dimensions: '78" W × 86" L × 54" H (Fits standard 72" × 78" King Mattress)',
    weight: "85 kg",
    warranty: "10-Year Warranty on Solid Wood Structure; 5-Year Warranty on Hydraulic Mechanism",
    assembly: "Free On-Site White Glove Assembly by Nakashi Senior Technicians",
    features: [
      "Heavy-duty German gas-lift struts engineered for 10,000+ seamless lifts",
      "Integrated dust-free bottom flooring panel to keep stored linens clean",
      "Solid teak slat foundation designed to eliminate mattress sagging and optimize airflow",
      "High-density foam padded wingback headboard for superior lumbar comfort",
      "Anti-creak joints reinforced with heavy-gauge internal steel brackets",
    ],
    careInstructions:
      "Spot clean fabric headboard with mild upholstery shampoo. Wipe teak wood rails with a dry microfiber cloth. Lubricate gas struts once every two years if required.",
    deliveryInfo:
      "Delivered in multi-box modular packaging to easily navigate staircases and elevators. Free installation upon arrival.",
  },
  {
    id: "b3",
    sku: "NK-CHR-MAL-03",
    slug: "malabar-cane-teak-lounge-chair",
    name: "Malabar Cane & Teak Accent Lounge Chair",
    category: "Chairs",
    badge: "Staff Pick",
    price: 18500,
    originalPrice: 22000,
    image:
      "https://images.unsplash.com/photo-1580481077195-c328ad4f3922?auto=format&fit=crop&w=1400&q=85",
    image_45:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1400&q=85",
    description:
      "Natural hand-woven Rattan cane backrest framed in sculptural steam-bent solid teakwood with removable linen seat pad.",
    detailedDescription:
      "Paying homage to mid-century tropical modernism, the Malabar Lounge Chair blends airy natural cane work with the organic warmth of Indian teakwood. The gently inclined backrest supports natural posture, making it the quintessential accent piece for reading corners, balconies, and light-filled living spaces.",
    material: "Solid Malabar Teakwood & Natural Forest Rattan Weave, High-Resilience Cushion",
    colour: "Honey Teak & Natural Cane with Flax Linen Cushion",
    finish: "Smooth Natural Wax Teak Oil Finish",
    dimensions: '28" W × 31" D × 33" H (Seat Height: 16")',
    weight: "14 kg",
    warranty: "3-Year Structural Warranty on Teak Frame & Cane Webbing",
    assembly: "Fully Assembled (No assembly needed)",
    features: [
      "Natural hand-woven cane mesh provides continuous breathability in warm climates",
      "Solid teak architectural sled frame with soft rounded edges",
      "High-density seat cushion with removable, machine-washable zippered linen cover",
      "Felt floor protector pads attached to prevent floor scratches",
      "Compact footprint suited for both boutique apartments and expansive verandas",
    ],
    careInstructions:
      "Keep cane moist in very dry weather by lightly misting once a year. Dust with a soft brush. Keep away from direct monsoon rains.",
    deliveryInfo: "Ready to ship. Delivered fully assembled in Chennai within 48 hours.",
  },
  {
    id: "b4",
    sku: "NK-COF-ZAH-04",
    slug: "zahir-fluted-teak-round-coffee-table",
    name: "Zahir Fluted Teak Round Coffee Table",
    category: "Coffee Tables",
    badge: "Trending",
    price: 24900,
    originalPrice: 28500,
    image:
      "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1400&q=85",
    image_45:
      "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1400&q=85",
    description:
      "Sculptural round drum coffee table featuring handcrafted vertical teak fluting and a beveled solid wood top.",
    detailedDescription:
      "The Zahir Round Coffee Table is an architectural statement for the contemporary living room. Each vertical fluted slat is cut, smoothed, and assembled by hand around a weighted core. The solid circular top showcases natural teak grain patterns, protected by a heat and moisture resistant clear matte coat.",
    material: "100% Solid Indian Teakwood with Reinforced Marine Core",
    colour: "Natural Golden Honey Teak",
    finish: "Satin Polyurethane Water-Resistant Sealant",
    dimensions: '36" Diameter × 16" H (Top Thickness: 1.25")',
    weight: "26 kg",
    warranty: "5-Year Solid Teak Warranty against termite & warping",
    assembly: "Pre-assembled (Ready to place)",
    features: [
      "Precision CNC fluted slats hand-finished for tactile depth",
      "Spill and coaster-friendly heat-resistant matte protective seal",
      "Organic round shape prevents accidental bumps in households with children",
      "Weighted hollow-base architecture provides immense stability without excessive weight",
    ],
    careInstructions:
      "Wipe with a damp soft cloth. Use coasters for hot mugs and beverages. Treat with natural teak wax once yearly to restore original lustre.",
    deliveryInfo:
      "Carefully wrapped in multi-layer foam and protective wood framing. In-stock for immediate Chennai dispatch.",
  },
];

export const newArrivals: Product[] = [
  {
    id: "n1",
    sku: "NK-TV-ZEN-05",
    slug: "zenith-fluted-solid-teak-tv-console",
    name: "Zenith Fluted Solid Teak TV Console",
    category: "TV Units",
    badge: "New Arrival",
    price: 36000,
    originalPrice: 42000,
    image:
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1400&q=85",
    image_45:
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1400&q=85",
    description:
      "Low-profile media entertainment credenza with tambour sliding doors, cord management ports, and concealed storage.",
    detailedDescription:
      "The Zenith TV Console seamlessly merges entertainment technology with organic artisanal carpentry. Dual slatted tambour doors slide smoothly along concealed tracks, allowing remote IR signals to pass through even when closed. Equipped with internal wire grommets and adjustable shelves.",
    material: "Solid Teakwood & Marine Plywood Veneer Backing, Soft-close German Hardware",
    colour: "Dark Walnut / Natural Teak",
    finish: "Low-sheen Natural Oil Matte Polish",
    dimensions: '72" W × 18" D × 20" H (Accommodates TVs up to 85")',
    weight: "44 kg",
    warranty: "5-Year Structural Frame Warranty",
    assembly: "Pre-assembled (Legs require simple tool-free hand fastening)",
    features: [
      "Acoustically and infrared transparent slatted sliding doors",
      "Rear magnetic cable routing cutouts for clutter-free cords",
      "Adjustable internal wooden shelves for consoles, soundbars, and subwoofers",
      "Solid conical tapered teak legs with brass foot sleeves",
    ],
    careInstructions: "Wipe clean with a soft microfiber cloth. Avoid ammonia-based cleaners.",
    deliveryInfo: "Complimentary setup and placement in your living room.",
  },
  {
    id: "n2",
    sku: "NK-WRD-AET-06",
    slug: "aethel-imperial-three-door-teak-wardrobe",
    name: "Aethel Imperial Three-Door Teak Wardrobe",
    category: "Wardrobes",
    badge: "New Arrival",
    price: 89000,
    originalPrice: 98000,
    image:
      "https://images.unsplash.com/photo-1558997519-83ea9252def8?auto=format&fit=crop&w=1400&q=85",
    image_45:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85",
    description:
      "Grand triple-door master armoire with internal solid brass clothes rails, velvet-lined jewelry drawers, and digital locker niche.",
    detailedDescription:
      "Crafted for heirloom longevity, the Aethel Wardrobe provides expansive storage for royal wardrobes. Solid teak panel doors feature hand-routed beveled framing. Inside, discover deep shelving, soft-closing internal drawers with custom organizer compartments, and an integrated full-length interior vanity mirror.",
    material: "100% Solid Indian Teakwood, Solid Brass Hardware & Hinges",
    colour: "Deep Royal Teak Brown",
    finish: "Hand-applied Shellac & Polyurethane Clear Coat",
    dimensions: '60" W × 24" D × 84" H',
    weight: "115 kg",
    warranty: "15-Year Solid Wood Termite & Joinery Warranty",
    assembly: "Complimentary on-site assembly by Nakashi Master Carpenters",
    features: [
      "Three full-height solid wood doors with heavy-duty brass concealed hinges",
      "Twin solid brass hanging poles for long coats, suits, and sarees",
      "Four deep pull-out drawers with velvet lined jewelry inserts",
      "Concealed interior lockbox shelf for valuables",
    ],
    careInstructions:
      "Condition with beeswax or teak oil once every two years. Keep interior moisture absorbing pouches during rainy season.",
    deliveryInfo:
      "Carefully transported in sub-sections and built inside your bedroom at no extra cost.",
  },
  {
    id: "n3",
    sku: "NK-DIN-VAL-07",
    slug: "valen-six-seater-solid-teak-dining-set",
    name: "Valen Handcrafted 6-Seater Teak Dining Set",
    category: "Dining Tables",
    badge: "Popular Set",
    price: 74999,
    originalPrice: 85000,
    image:
      "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1400&q=85",
    image_45:
      "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=1400&q=85",
    description:
      "Substantial 6-seater dining table crafted with 35mm thick solid teak plank tabletop paired with six ergonomic cushioned dining chairs.",
    detailedDescription:
      "The focal point of joyous family dinners and celebratory feasts. The Valen Dining Table is carved from sustainably harvested solid teak timber, seasoned to 8-10% equilibrium moisture content to ensure zero cracking in Chennai humidity. Includes six matching teak chairs featuring arched curved backs and easy-clean woven fabric seats.",
    material: "Solid A-Grade Seasoned Teakwood, Spill-Proof Fabric Cushions",
    colour: "Warm Natural Teak with Cream Linen Cushions",
    finish: "Heat & Food-Grade Stain-Resistant Italian Polyurethane Finish",
    dimensions: 'Table: 72" L × 38" W × 30" H | Chairs: 19" W × 21" D × 34" H',
    weight: "92 kg (Complete Set)",
    warranty: "10-Year Warranty on Dining Table; 5-Year Warranty on Chairs",
    assembly: "Free On-Site Table Leg Installation by Nakashi Crew",
    features: [
      "Tabletop crafted from full-length wide solid teak planks with book-matched grain",
      "Beveled edge profile with softly rounded kid-friendly corners",
      "Six sturdy ergonomic dining chairs supporting up to 160 kg each",
      "Food-safe, wipeable heat-resistant top tested up to 90°C",
    ],
    careInstructions:
      "Wipe clean with a warm damp cloth after meals. Do not place scorching pots directly without hot pads.",
    deliveryInfo: "Full 7-piece set delivered and fully assembled in your dining room.",
  },
  {
    id: "n4",
    sku: "NK-OTH-KAL-08",
    slug: "kalyan-heritage-bookshelf-display-unit",
    name: "Kalyan Heritage Teakwood Display Bookshelf",
    category: "Other Furniture",
    badge: "Limited Edition",
    price: 29500,
    originalPrice: 34000,
    image:
      "https://images.unsplash.com/photo-1594643781299-b141ea8ff55c?auto=format&fit=crop&w=1400&q=85",
    image_45:
      "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1400&q=85",
    description:
      "Five-tier open architectural etagere bookshelf with solid teak ladder uprights and tempered glass partition accents.",
    detailedDescription:
      "Designed for bibliophiles, collectors, and curated displays. The Kalyan Bookshelf offers 5 generous open tiers capable of supporting dense art books, heritage brass idols, and potted indoor flora. Features anti-tip safety anchors and solid brass hardware joinery.",
    material: "Solid Teakwood with Brass Support Rods & Toughened Glass",
    colour: "Vintage Honey Teak",
    finish: "Hand-buffed Satin Lacquer Polish",
    dimensions: '38" W × 15" D × 74" H (Shelf clearance: 13.5")',
    weight: "32 kg",
    warranty: "5-Year Structural Frame Warranty",
    assembly: "Pre-assembled (Anti-tip wall bracket installation included)",
    features: [
      "Five solid 1-inch thick teak shelves tested to hold 35 kg per tier",
      "Open back design creates an airy, spatial room divider without blocking light",
      "Includes complimentary wall safety anchor tether kit",
      "Precision brass cross-bracing for unmatched lateral rigidity",
    ],
    careInstructions:
      "Dust weekly with a microfiber cloth. Polish occasionally with natural beeswax.",
    deliveryInfo: "Shipped fully assembled with optional complimentary wall-anchoring service.",
  },
];
