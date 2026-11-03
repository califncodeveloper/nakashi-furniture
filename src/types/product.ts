export type PriceStatus = "Draft" | "Awaiting Approval" | "Approved" | "Contact for Price";

export interface Product {
  id: string;
  sku?: string;
  slug?: string;
  name: string;
  category: string;
  subcategory?: string;

  /** Approved selling price */
  price?: number;
  /** Verified original price */
  originalPrice?: number;
  original_price?: number;

  /** Price workflow status */
  priceStatus?: PriceStatus;
  price_status?: string;

  /** Inventory & catalog availability */
  isAvailable?: boolean;
  is_available?: boolean;

  /** Publication status */
  is_published?: boolean;

  /** Front perspective primary image */
  image: string;
  /** 45-degree angle secondary image */
  image45?: string;
  image_45?: string;

  badge?: string;
  description?: string;
  detailedDescription?: string;
  detailed_description?: string;

  // Verified Specifications
  material?: string;
  colour?: string;
  finish?: string;
  dimensions?: string;
  weight?: string;
  warranty?: string;
  assemblyRequired?: boolean;
  assembly_required?: boolean;
  assembly?: string;
  assemblyDetails?: string;
  assembly_details?: string;
  features?: string[];
  careInstructions?: string;
  care_instructions?: string;
  deliveryInfo?: string;

  created_at?: string;
  updated_at?: string;
}

export interface Category {
  slug: string;
  name: string;
  image: string;
}

export interface DbProduct {
  id: string;
  sku?: string | null;
  slug?: string | null;
  name: string;
  category: string;
  subcategory?: string | null;
  price: number | null;
  original_price: number | null;
  price_status?: string | null;
  is_available?: boolean | null;
  is_published: boolean;
  image: string;
  image_45: string | null;
  badge: string | null;
  description: string | null;
  detailed_description?: string | null;
  dimensions: string | null;
  material: string | null;
  colour?: string | null;
  finish?: string | null;
  weight?: string | null;
  warranty?: string | null;
  assembly_required?: boolean | null;
  assembly?: string | null;
  assembly_details?: string | null;
  features?: string[] | null;
  care_instructions?: string | null;
  delivery_info?: string | null;
  created_at: string;
  updated_at: string;
}

export function mapDbProductToProduct(db: DbProduct): Product {
  const priceStatus = (db.price_status as PriceStatus) || "Approved";
  const isAvailable = db.is_available !== false;

  return {
    id: db.id,
    sku: db.sku ?? undefined,
    slug: db.slug ?? undefined,
    name: db.name,
    category: db.category,
    subcategory: db.subcategory ?? undefined,
    price: db.price ?? undefined,
    originalPrice: db.original_price ?? undefined,
    original_price: db.original_price ?? undefined,
    priceStatus,
    price_status: db.price_status ?? undefined,
    isAvailable,
    is_available: isAvailable,
    is_published: db.is_published,
    image: db.image,
    image45: db.image_45 ?? undefined,
    image_45: db.image_45 ?? undefined,
    badge: db.badge ?? undefined,
    description: db.description ?? undefined,
    detailedDescription: db.detailed_description ?? undefined,
    detailed_description: db.detailed_description ?? undefined,
    dimensions: db.dimensions ?? undefined,
    material: db.material ?? undefined,
    colour: db.colour ?? undefined,
    finish: db.finish ?? undefined,
    weight: db.weight ?? undefined,
    warranty: db.warranty ?? undefined,
    assemblyRequired:
      db.assembly_required ?? (db.assembly?.toLowerCase().includes("no") ? false : true),
    assembly_required: db.assembly_required ?? undefined,
    assembly: db.assembly ?? undefined,
    assemblyDetails: db.assembly_details ?? undefined,
    assembly_details: db.assembly_details ?? undefined,
    features: Array.isArray(db.features) ? db.features : undefined,
    careInstructions: db.care_instructions ?? undefined,
    care_instructions: db.care_instructions ?? undefined,
    deliveryInfo: db.delivery_info ?? undefined,
    created_at: db.created_at,
    updated_at: db.updated_at,
  };
}
