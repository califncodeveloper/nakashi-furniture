import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { DbProduct, Product } from "@/types/product";
import { mapDbProductToProduct } from "@/types/product";

export const SUPABASE_PROJECT_ID = "sgpleeuwhjmmcgjdcdxp";
export const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_AQ-qNinEwZx23Gtzwi7w3Q_Uv587Wjp";
export const PRODUCT_STORAGE_BUCKET = "product-images";

// Maximum upload file size: 10MB
export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/jpg",
];

// Helper to retrieve the current URL and Anon key
export function getSupabaseCredentials() {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const envKey = (
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)
  )?.trim();

  // Allow browser storage override for instant runtime connection in the management dashboard
  const storedUrl =
    typeof window !== "undefined"
      ? window.localStorage.getItem("nakashi_supabase_url")?.trim()
      : undefined;
  const storedKey =
    typeof window !== "undefined"
      ? window.localStorage.getItem("nakashi_supabase_anon_key")?.trim()
      : undefined;

  const url = envUrl || storedUrl || DEFAULT_SUPABASE_URL;
  const validStored =
    storedKey && !storedKey.includes("dummy") && storedKey.length > 10 ? storedKey : undefined;
  const anonKey = envKey || validStored || DEFAULT_SUPABASE_ANON_KEY;

  return { url, anonKey, isConfigured: Boolean(url && anonKey) };
}

const credentials = getSupabaseCredentials();

export const supabase: SupabaseClient = createClient(
  credentials.url,
  credentials.anonKey || DEFAULT_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export function isSupabaseConfigured(): boolean {
  const { isConfigured } = getSupabaseCredentials();
  return isConfigured;
}

export function setRuntimeSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== "undefined") {
    if (url) window.localStorage.setItem("nakashi_supabase_url", url.trim());
    if (anonKey) window.localStorage.setItem("nakashi_supabase_anon_key", anonKey.trim());
  }
}

export function clearRuntimeSupabaseCredentials() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("nakashi_supabase_url");
    window.localStorage.removeItem("nakashi_supabase_anon_key");
  }
}

/**
 * Validates an image file before uploading
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  const type = file.type?.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase();
  const isAllowedType =
    ALLOWED_IMAGE_TYPES.includes(type) ||
    ["jpg", "jpeg", "png", "webp", "avif"].includes(ext || "");

  if (!isAllowedType) {
    return {
      valid: false,
      error: `Unsupported image format (${file.type || ext}). Please upload JPG, PNG, or WebP.`,
    };
  }

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum allowed 10 MB limit.`,
    };
  }

  return { valid: true };
}

/**
 * Extracts storage relative path from a full public URL
 */
export function getStoragePathFromUrl(url: string): string | null {
  if (!url) return null;
  const prefix = `/storage/v1/object/public/${PRODUCT_STORAGE_BUCKET}/`;
  const idx = url.indexOf(prefix);
  if (idx !== -1) {
    return decodeURIComponent(url.substring(idx + prefix.length));
  }
  return null;
}

/**
 * Uploads a product image directly to Supabase Storage organized by product ID:
 * `product-images/{productId}/front.{ext}` or `product-images/{productId}/angle.{ext}`
 */
export async function uploadProductImage(
  file: File,
  variant: "front" | "angle" = "front",
  productId?: string,
): Promise<{ url: string; path?: string; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        url: "",
        error:
          "Supabase Publishable/Anon key is not configured. Please verify your Supabase connection.",
      };
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { url: "", error: validation.error };
    }

    const fileExt =
      file.name.split(".").pop()?.toLowerCase() || (file.type === "image/png" ? "png" : "webp");
    const pid = productId || `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const filePath = `${pid}/${variant}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { url: "", error: uploadError.message };
    }

    const { data } = supabase.storage.from(PRODUCT_STORAGE_BUCKET).getPublicUrl(filePath);

    return { url: data.publicUrl, path: filePath };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload image";
    return { url: "", error: message };
  }
}

/**
 * Deletes an image file from Supabase Storage
 */
export async function deleteProductImageFromStorage(urlOrPath: string): Promise<boolean> {
  try {
    if (!urlOrPath) return false;
    const path = getStoragePathFromUrl(urlOrPath) || urlOrPath;
    if (!path || path.startsWith("http")) return false;

    const { error } = await supabase.storage.from(PRODUCT_STORAGE_BUCKET).remove([path]);
    if (error) {
      console.warn("Storage deletion error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("Failed to delete storage object:", e);
    return false;
  }
}

/**
 * Checks whether an SKU is already used by another product
 */
export async function checkSkuExists(sku: string, excludeProductId?: string): Promise<boolean> {
  if (!sku || !sku.trim()) return false;
  try {
    let query = supabase.from("products").select("id").eq("sku", sku.trim().toUpperCase());
    if (excludeProductId) {
      query = query.neq("id", excludeProductId);
    }
    const { data, error } = await query.limit(1);
    if (error) {
      // If column does not exist yet, treat as not conflicting
      return false;
    }
    return Boolean(data && data.length > 0);
  } catch {
    return false;
  }
}

/**
 * Fetches products from Supabase `products` table
 */
export async function fetchProductsFromDb(options?: {
  publishedOnly?: boolean;
  category?: string;
  search?: string;
  availability?: boolean;
}): Promise<{ products: Product[]; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { products: [], error: "Supabase is not configured yet." };
    }

    let query = supabase.from("products").select("*").order("created_at", { ascending: false });

    if (options?.publishedOnly) {
      query = query.eq("is_published", true);
    }

    if (options?.category && options.category !== "all") {
      query = query.eq("category", options.category);
    }

    if (typeof options?.availability === "boolean") {
      query = query.eq("is_available", options.availability);
    }

    if (options?.search) {
      const term = `%${options.search.trim()}%`;
      query = query.or(`name.ilike.${term},category.ilike.${term},description.ilike.${term}`);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Error fetching products from Supabase:", error);
      return { products: [], error: error.message };
    }

    const items = ((data as DbProduct[]) || []).map(mapDbProductToProduct);
    return { products: items };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error querying products";
    return { products: [], error: message };
  }
}

/**
 * Inserts a new product into the database.
 * Gracefully adapts if extended columns (sku, slug, price_status, etc.) are present or not.
 */
export async function createProductInDb(product: {
  name: string;
  category: string;
  subcategory?: string | null;
  sku?: string | null;
  slug?: string | null;
  price?: number | null;
  original_price?: number | null;
  price_status?: string | null;
  is_available?: boolean;
  is_published?: boolean;
  image: string;
  image_45?: string | null;
  badge?: string | null;
  description?: string | null;
  detailed_description?: string | null;
  dimensions?: string | null;
  material?: string | null;
  colour?: string | null;
  finish?: string | null;
  weight?: string | null;
  warranty?: string | null;
  assembly_required?: boolean | null;
  assembly_details?: string | null;
  features?: string[] | null;
  care_instructions?: string | null;
}): Promise<{ data: DbProduct | null; error?: string }> {
  try {
    // Attempt full payload first
    const fullPayload: Record<string, any> = {
      name: product.name.trim(),
      category: product.category,
      subcategory: product.subcategory ?? null,
      sku: product.sku ? product.sku.trim().toUpperCase() : null,
      slug: product.slug ? product.slug.trim().toLowerCase() : null,
      price: product.price ?? null,
      original_price: product.original_price ?? null,
      price_status: product.price_status ?? "Approved",
      is_available: product.is_available ?? true,
      is_published: product.is_published ?? true,
      image: product.image,
      image_45: product.image_45 ?? null,
      badge: product.badge ?? null,
      description: product.description ?? null,
      detailed_description: product.detailed_description ?? null,
      dimensions: product.dimensions ?? null,
      material: product.material ?? null,
      colour: product.colour ?? null,
      finish: product.finish ?? null,
      weight: product.weight ?? null,
      warranty: product.warranty ?? null,
      assembly_required: product.assembly_required ?? false,
      assembly_details: product.assembly_details ?? null,
      features: product.features ?? [],
      care_instructions: product.care_instructions ?? null,
    };

    const { data, error } = await supabase.from("products").insert([fullPayload]).select().single();

    if (!error) {
      return { data: data as DbProduct };
    }

    // If extended columns are not yet added in Supabase schema (error 42703), fallback to base schema
    if (error.code === "42703") {
      console.warn("Products table missing extended columns; saving base schema fields.");
      const basePayload = {
        name: product.name.trim(),
        category: product.category,
        price: product.price ?? null,
        original_price: product.original_price ?? null,
        image: product.image,
        image_45: product.image_45 ?? null,
        badge: product.badge ?? null,
        description: product.description ?? null,
        dimensions: product.dimensions ?? null,
        material: product.material ?? null,
        is_published: product.is_published ?? true,
      };

      const { data: baseData, error: baseError } = await supabase
        .from("products")
        .insert([basePayload])
        .select()
        .single();

      if (baseError) {
        return { data: null, error: baseError.message };
      }
      return { data: baseData as DbProduct };
    }

    return { data: null, error: error.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating product";
    return { data: null, error: message };
  }
}

/**
 * Updates an existing product.
 * Gracefully adapts if extended columns are not yet created.
 */
export async function updateProductInDb(
  id: string,
  updates: Record<string, any>,
): Promise<{ data: DbProduct | null; error?: string }> {
  try {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (!error) {
      return { data: data as DbProduct };
    }

    // Fallback if extended column does not exist
    if (error.code === "42703") {
      console.warn("Updating products table with base schema fallback due to missing column.");
      const baseAllowed = [
        "name",
        "category",
        "price",
        "original_price",
        "image",
        "image_45",
        "badge",
        "description",
        "dimensions",
        "material",
        "is_published",
        "updated_at",
      ];
      const filtered: Record<string, any> = {};
      for (const k of Object.keys(payload)) {
        if (baseAllowed.includes(k)) {
          filtered[k] = (payload as Record<string, any>)[k];
        }
      }

      const { data: fallbackData, error: fallbackError } = await supabase
        .from("products")
        .update(filtered)
        .eq("id", id)
        .select()
        .single();

      if (fallbackError) {
        return { data: null, error: fallbackError.message };
      }
      return { data: fallbackData as DbProduct };
    }

    return { data: null, error: error.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating product";
    return { data: null, error: message };
  }
}

/**
 * Safely deletes a product and cleans up its associated images in Supabase Storage
 */
export async function deleteProductFromDb(
  id: string,
  imageUrls?: (string | null | undefined)[],
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Delete product record from Supabase database
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      return { success: false, error: error.message };
    }

    // 2. Clean up associated images from Storage bucket
    if (imageUrls && imageUrls.length > 0) {
      for (const imgUrl of imageUrls) {
        if (imgUrl) {
          await deleteProductImageFromStorage(imgUrl);
        }
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error deleting product";
    return { success: false, error: message };
  }
}
