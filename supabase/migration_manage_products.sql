-- ====================================================================
-- THE NAKASHI FURNITURES - COMPLETE DATABASE & STORAGE PERMISSIONS FIX
-- Project ID: sgpleeuwhjmmcgjdcdxp
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/sgpleeuwhjmmcgjdcdxp/sql
-- ====================================================================

-- 1. ADD EXTENDED PRODUCT MANAGEMENT COLUMNS (IF NOT EXISTS)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS detailed_description TEXT,
  ADD COLUMN IF NOT EXISTS colour TEXT,
  ADD COLUMN IF NOT EXISTS finish TEXT,
  ADD COLUMN IF NOT EXISTS weight TEXT,
  ADD COLUMN IF NOT EXISTS warranty TEXT,
  ADD COLUMN IF NOT EXISTS assembly_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS assembly_details TEXT,
  ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS care_instructions TEXT,
  ADD COLUMN IF NOT EXISTS price_status TEXT DEFAULT 'Approved',
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- 2. CREATE PERFORMANCE INDEXES
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_availability ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_price_status ON public.products(price_status);

-- 3. PRODUCTS ROW-LEVEL SECURITY FIX
-- Enable RLS and grant full permissions to all roles for store management
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on products to avoid conflicts
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'products' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.products', pol.policyname);
    END LOOP;
END $$;

-- Allow public viewing of products
CREATE POLICY "Public can view products"
  ON public.products
  FOR SELECT
  TO public
  USING (true);

-- Allow inserting products
CREATE POLICY "Allow insert products"
  ON public.products
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow updating products (publishing, price, details, availability)
CREATE POLICY "Allow update products"
  ON public.products
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow deleting products
CREATE POLICY "Allow delete products"
  ON public.products
  FOR DELETE
  TO public
  USING (true);

-- 4. CONFIGURE product-images STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- 5. STORAGE RLS FIX FOR product-images BUCKET
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'objects' AND schemaname = 'storage'
        AND (policyname ILIKE '%product-images%' OR policyname ILIKE '%product images%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- Allow viewing product images
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Allow uploading product images
CREATE POLICY "Allow upload product images"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'product-images');

-- Allow updating product images
CREATE POLICY "Allow update product images"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

-- Allow deleting product images
CREATE POLICY "Allow delete product images"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'product-images');
