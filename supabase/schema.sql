-- ====================================================================
-- THE NAKASHI FURNITURES - SUPABASE SCHEMA & POLICIES SETUP
-- Project ID: sgpleeuwhjmmcgjdcdxp
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/sgpleeuwhjmmcgjdcdxp/sql
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  sku TEXT,
  slug TEXT,
  price NUMERIC(10, 2),
  original_price NUMERIC(10, 2),
  price_status TEXT DEFAULT 'Approved',
  is_available BOOLEAN DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT true,
  image TEXT NOT NULL,
  image_45 TEXT,
  badge TEXT,
  description TEXT,
  detailed_description TEXT,
  dimensions TEXT,
  material TEXT,
  colour TEXT,
  finish TEXT,
  weight TEXT,
  warranty TEXT,
  assembly_required BOOLEAN DEFAULT false,
  assembly_details TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  care_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for fast lookups & filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_availability ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_price_status ON public.products(price_status);

-- 3. AUTOMATIC updated_at TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. ROW LEVEL SECURITY (RLS) FOR PRODUCTS TABLE
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published products" ON public.products;
DROP POLICY IF EXISTS "Authenticated managers can view all products" ON public.products;
DROP POLICY IF EXISTS "Authenticated managers can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated managers can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated managers can delete products" ON public.products;
DROP POLICY IF EXISTS "Allow manager insert products" ON public.products;
DROP POLICY IF EXISTS "Allow manager update products" ON public.products;
DROP POLICY IF EXISTS "Allow manager delete products" ON public.products;
DROP POLICY IF EXISTS "Managers can view all products" ON public.products;

-- Allow public read access to published products
CREATE POLICY "Public can view published products"
  ON public.products
  FOR SELECT
  USING (is_published = true);

-- Allow management to view all products (including drafts)
CREATE POLICY "Managers can view all products"
  ON public.products
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow management to insert new products
CREATE POLICY "Allow manager insert products"
  ON public.products
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Allow management to update products
CREATE POLICY "Allow manager update products"
  ON public.products
  FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Allow management to delete products
CREATE POLICY "Allow manager delete products"
  ON public.products
  FOR DELETE
  TO authenticated, anon
  USING (true);

-- 5. STORAGE BUCKET: product-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB limit per image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];

-- 6. STORAGE POLICIES FOR product-images BUCKET
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated managers can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated managers can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated managers can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow product images upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow product images update" ON storage.objects;
DROP POLICY IF EXISTS "Allow product images delete" ON storage.objects;

-- Allow public to view all product images
CREATE POLICY "Public can view product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow image uploads to product-images
CREATE POLICY "Allow product images upload"
  ON storage.objects
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (bucket_id = 'product-images');

-- Allow image updates in product-images
CREATE POLICY "Allow product images update"
  ON storage.objects
  FOR UPDATE
  TO authenticated, anon
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

-- Allow image deletions from product-images
CREATE POLICY "Allow product images delete"
  ON storage.objects
  FOR DELETE
  TO authenticated, anon
  USING (bucket_id = 'product-images');
