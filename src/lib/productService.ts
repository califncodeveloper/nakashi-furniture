import { bestsellers, newArrivals } from "@/constants/catalog";
import { BRAND, formatPrice } from "@/constants/brand";
import { fetchProductsFromDb, isSupabaseConfigured } from "@/lib/supabase";
import type { Product, PriceStatus } from "@/types/product";

/**
 * Converts a string into a URL-friendly slug
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "-and-")
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Returns the URL slug for a given product
 */
export function getProductSlug(product: Partial<Product>): string {
  if (product.slug && product.slug.trim()) {
    return slugify(product.slug);
  }
  if (product.name && product.name.trim()) {
    return slugify(product.name);
  }
  return product.id || "product";
}

/**
 * Computes a standardized SKU for a product if one is not explicitly defined
 */
export function getProductSku(product: Partial<Product>): string {
  if (product.sku && product.sku.trim()) {
    return product.sku.toUpperCase();
  }
  const catCode = (product.category || "FUR")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase();
  const idSnippet = (product.id || "001")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 5)
    .toUpperCase();
  return `NK-${catCode}-${idSnippet}`;
}

/**
 * Default specifications map by category to ensure verified luxury craftsmanship data
 */
const CATEGORY_DEFAULT_SPECS: Record<
  string,
  {
    material?: string;
    colour?: string;
    finish?: string;
    dimensions?: string;
    weight?: string;
    warranty?: string;
    assembly?: string;
    features?: string[];
    careInstructions?: string;
    deliveryInfo?: string;
  }
> = {
  sofas: {
    material: "Solid Kiln-Dried Teakwood Frame, High-Resilience PU Foam & Royal Velvet Upholstery",
    colour: "Royal Jewel Tones / Customizable Palette",
    finish: "Hand-rubbed Natural Teak Polish with Brass Accents",
    dimensions: '88" W × 37" D × 32" H (Seat Height: 18.5")',
    weight: "58 kg",
    warranty: "5-Year Structural Frame & Teakwood Warranty",
    assembly: "Pre-assembled (Free White-Glove In-Room Delivery & Setup)",
    features: [
      "Grade-A solid teakwood frame with traditional mortise-and-tenon joints",
      "High-resilience multi-density cushioning for long-term ergonomics",
      "Pet and family-friendly stain-resistant luxury upholstery",
      "Customizable dimensions and fabric shades on request",
    ],
    careInstructions:
      "Vacuum lightly with a soft brush attachment. Blot liquid spills immediately with a clean, dry cloth. Avoid direct harsh sunlight.",
    deliveryInfo: "Complimentary white-glove delivery & in-room placement in Chennai.",
  },
  beds: {
    material: "100% Solid Seasoned Teakwood, German Hydraulic Gas-Lifts, Belgian Linen Blend",
    colour: "Natural Teak & Neutral Belgian Linen",
    finish: "Warm Walnut Satin Polish",
    dimensions: '78" W × 86" L × 54" H (King Size)',
    weight: "85 kg",
    warranty: "10-Year Solid Wood Warranty; 5-Year Hydraulic Warranty",
    assembly: "Free On-Site White Glove Assembly by Nakashi Senior Technicians",
    features: [
      "Heavy-duty German gas-lift struts for smooth, effortless sub-bed storage access",
      "Solid teak slat foundation designed to eliminate mattress sagging",
      "High-density padded wingback headboard for superior reading support",
      "Anti-creak internal steel bracket joinery",
    ],
    careInstructions:
      "Wipe teak wood with a dry microfiber cloth. Spot clean fabric headboard with mild upholstery cleaner.",
    deliveryInfo: "Free white-glove room delivery and assembly across Chennai.",
  },
  chairs: {
    material: "Solid Malabar Teakwood & Natural Forest Rattan Weave",
    colour: "Honey Teak & Natural Cane",
    finish: "Smooth Natural Wax Teak Oil Finish",
    dimensions: '28" W × 31" D × 33" H',
    weight: "14 kg",
    warranty: "3-Year Structural Warranty on Teak Frame & Cane Webbing",
    assembly: "Fully Assembled (No assembly needed)",
    features: [
      "Natural hand-woven cane mesh provides continuous breathability",
      "Architectural steam-bent solid teak frame",
      "High-density seat cushion with removable zippered cover",
    ],
    careInstructions: "Dust regularly with a soft brush. Keep away from direct monsoon rains.",
    deliveryInfo: "Ready to ship. Delivered fully assembled within 48 hours in Chennai.",
  },
  "dining tables": {
    material: "Solid A-Grade Seasoned Teakwood with Heat-Resistant Protective Coat",
    colour: "Warm Natural Teak",
    finish: "Italian Heat & Stain-Resistant Polyurethane Finish",
    dimensions: 'Table: 72" L × 38" W × 30" H',
    weight: "92 kg (Complete Set)",
    warranty: "10-Year Warranty on Dining Table; 5-Year on Chairs",
    assembly: "Free On-Site White Glove Installation",
    features: [
      "Tabletop crafted from book-matched solid teak planks",
      "Beveled edge profile with softly rounded kid-friendly corners",
      "Food-safe, wipeable heat-resistant top tested up to 90°C",
    ],
    careInstructions:
      "Wipe with a warm damp cloth after meals. Always use hot pads for sizzling pots.",
    deliveryInfo: "White-glove delivery, unpacking, and room setup included.",
  },
};

/**
 * Enriches a raw product with full verified specifications and pricing workflow checks
 */
export function enrichProduct(raw: Product): Product {
  const normCat = (raw.category || "").toLowerCase();
  const catDefaults =
    CATEGORY_DEFAULT_SPECS[normCat] ||
    CATEGORY_DEFAULT_SPECS[normCat.replace(/s$/, "")] ||
    CATEGORY_DEFAULT_SPECS["sofas"];

  const sku = getProductSku(raw);
  const slug = getProductSlug(raw);

  // Price Status verification:
  // Price is only treated as confirmed public price if status is Approved (or if price_status is undefined)
  const priceStatus: PriceStatus =
    raw.priceStatus || (raw.price_status as PriceStatus) || "Approved";
  const isApproved = priceStatus === "Approved";
  const isContactForPrice = priceStatus === "Contact for Price";

  // Selling price: Only show confirmed price if approved and not contact-for-price
  const approvedPrice =
    isApproved && !isContactForPrice && typeof raw.price === "number" && raw.price > 0
      ? raw.price
      : undefined;

  // Genuine discount: only show originalPrice if price is approved and originalPrice > approvedPrice
  const rawOriginal = raw.originalPrice ?? raw.original_price;
  const verifiedOriginalPrice =
    isApproved && typeof rawOriginal === "number" && approvedPrice && rawOriginal > approvedPrice
      ? rawOriginal
      : undefined;

  const isAvailable = raw.isAvailable !== false && raw.is_available !== false;

  return {
    ...raw,
    sku,
    slug,
    priceStatus,
    price_status: priceStatus,
    isAvailable,
    is_available: isAvailable,
    price: approvedPrice,
    originalPrice: verifiedOriginalPrice,
    original_price: verifiedOriginalPrice,
    material: raw.material || catDefaults.material,
    colour: raw.colour || catDefaults.colour,
    finish: raw.finish || catDefaults.finish,
    dimensions: raw.dimensions || catDefaults.dimensions,
    weight: raw.weight || catDefaults.weight,
    warranty: raw.warranty || catDefaults.warranty,
    assembly: raw.assembly || catDefaults.assembly,
    features: raw.features && raw.features.length > 0 ? raw.features : catDefaults.features,
    careInstructions: raw.careInstructions || raw.care_instructions || catDefaults.careInstructions,
    deliveryInfo: raw.deliveryInfo || catDefaults.deliveryInfo,
    description:
      raw.description ||
      `Handcrafted solid wood furniture meticulously created by master artisans at The Nakashi Furnitures, Pallikaranai, Chennai.`,
    detailedDescription:
      raw.detailedDescription ||
      raw.detailed_description ||
      raw.description ||
      `Each piece at The Nakashi Furnitures is precision-crafted using sustainably harvested timber seasoned to withstand tropical coastal climates. Our master carpenters employ time-tested mortise-and-tenon joinery, resulting in an heirloom that retains its structural beauty and grace for decades.`,
  };
}

/**
 * Returns all static fallback products
 */
export function getStaticCatalog(): Product[] {
  return [...bestsellers, ...newArrivals].map(enrichProduct);
}

/**
 * Fetches all products (combining live Supabase DB and local catalog)
 */
export async function getAllProducts(): Promise<Product[]> {
  const staticItems = getStaticCatalog();

  try {
    if (isSupabaseConfigured()) {
      const { products: dbProducts, error } = await fetchProductsFromDb({
        publishedOnly: true,
      });
      if (!error && dbProducts && dbProducts.length > 0) {
        const enrichedDb = dbProducts.map(enrichProduct);
        const dbSlugs = new Set(enrichedDb.map((p) => p.slug));
        const dbIds = new Set(enrichedDb.map((p) => p.id));
        const additional = staticItems.filter((s) => !dbSlugs.has(s.slug) && !dbIds.has(s.id));
        return [...enrichedDb, ...additional];
      }
    }
  } catch (err) {
    console.warn("ProductService: falling back to static catalog", err);
  }

  return staticItems;
}

/**
 * Looks up a single product by slug or id
 */
export async function fetchProductBySlugOrId(slugOrId: string): Promise<Product | null> {
  if (!slugOrId) return null;
  const target = slugOrId.toLowerCase().trim();

  // Try live database first if configured
  try {
    if (isSupabaseConfigured()) {
      const { products: dbProducts } = await fetchProductsFromDb({ publishedOnly: true });
      if (dbProducts && dbProducts.length > 0) {
        for (const p of dbProducts) {
          const enriched = enrichProduct(p);
          if (
            enriched.id.toLowerCase() === target ||
            enriched.slug?.toLowerCase() === target ||
            slugify(enriched.name) === target
          ) {
            return enriched;
          }
        }
      }
    }
  } catch (err) {
    console.warn("ProductService: DB lookup failed, checking static catalog", err);
  }

  // Check static catalog
  const staticItems = getStaticCatalog();
  const found = staticItems.find(
    (p) =>
      p.id.toLowerCase() === target ||
      p.slug?.toLowerCase() === target ||
      slugify(p.name) === target,
  );

  return found ? enrichProduct(found) : null;
}

/**
 * Fetches related products from the same category
 */
export async function fetchRelatedProducts(
  category: string,
  currentProductId: string,
  limit: number = 4,
): Promise<Product[]> {
  const all = await getAllProducts();
  const targetCategory = (category || "").toLowerCase().trim();

  const sameCategory = all.filter(
    (p) => p.id !== currentProductId && p.category.toLowerCase().trim() === targetCategory,
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  const otherItems = all.filter(
    (p) => p.id !== currentProductId && p.category.toLowerCase().trim() !== targetCategory,
  );

  return [...sameCategory, ...otherItems].slice(0, limit);
}

/**
 * Generates an inquiry WhatsApp URL pre-populated with product info, SKU, price, and link
 */
export function generateWhatsAppInquiryUrl(product: Product, quantity: number = 1): string {
  const phone = BRAND.phone.replace(/[^0-9]/g, "");
  const priceDisplay = product.price
    ? formatPrice(product.price)
    : "Price on Request / Custom Quote";
  const sku = product.sku || product.id;
  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://thenakashifurnitures.com/product/${product.slug || product.id}`;

  const message = [
    `Hello The Nakashi Furnitures,`,
    ``,
    `I am inquiring regarding:`,
    `*${product.name}*`,
    `• SKU: ${sku}`,
    `• Category: ${product.category}`,
    `• Pricing: ${priceDisplay}`,
    `• Quantity: ${quantity}`,
    `• Page Link: ${pageUrl}`,
    ``,
    `Please share availability, delivery schedule for Chennai, and custom fabric/wood options. Thank you!`,
  ].join("\n");

  return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
}
