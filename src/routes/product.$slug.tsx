import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductCard } from "@/components/product/ProductCard";
import { cart } from "@/lib/cart";
import {
  fetchProductBySlugOrId,
  fetchRelatedProducts,
  generateWhatsAppInquiryUrl,
  getProductSlug,
  getProductSku,
} from "@/lib/productService";
import type { Product } from "@/types/product";
import { BRAND, formatPrice } from "@/constants/brand";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Heart,
  HelpCircle,
  Layers,
  MessageCircle,
  Package,
  QrCode,
  RotateCcw,
  Ruler,
  Share2,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/product/$slug")({
  head: () => ({
    meta: [
      { title: "Product Details — The Nakashi Furnitures" },
      {
        name: "description",
        content: "Explore handcrafted solid wood furniture by The Nakashi Furnitures, Chennai.",
      },
      { property: "og:title", content: "Handcrafted Luxury Furniture — The Nakashi Furnitures" },
      {
        property: "og:description",
        content: "Bespoke solid wood sofas, beds, dining sets, and cabinetry made in Chennai.",
      },
    ],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [isCopiedSku, setIsCopiedSku] = useState<boolean>(false);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [addedRecently, setAddedRecently] = useState<boolean>(false);

  // Load product and related items when slug changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setQuantity(1);
    setAddedRecently(false);

    async function loadData() {
      try {
        const p = await fetchProductBySlugOrId(slug);
        if (!isMounted) return;

        if (p) {
          setProduct(p);
          const related = await fetchRelatedProducts(p.category, p.id, 4);
          if (isMounted) {
            setRelatedProducts(related);
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Quantity controls
  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(99, prev + delta)));
  };

  // Add to Cart handler
  const handleAddToCart = () => {
    if (!product) return;
    cart.add(product.id, quantity);
    setAddedRecently(true);
    toast.success(`Added ${quantity} × ${product.name} to your cart`, {
      description: "Review your selection anytime from the cart icon.",
      action: {
        label: "View Cart",
        onClick: () => navigate({ to: "/cart" }),
      },
    });

    setTimeout(() => {
      setAddedRecently(false);
    }, 2500);
  };

  // Buy Now handler
  const handleBuyNow = () => {
    if (!product) return;
    cart.add(product.id, quantity);
    navigate({ to: "/cart" });
  };

  // Copy SKU
  const handleCopySku = () => {
    if (!product) return;
    const sku = getProductSku(product);
    navigator.clipboard.writeText(sku);
    setIsCopiedSku(true);
    toast.success(`SKU ${sku} copied to clipboard`);
    setTimeout(() => setIsCopiedSku(false), 2000);
  };

  // Share product link
  const handleShare = () => {
    if (!product) return;
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} from The Nakashi Furnitures`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Container as="section" section className="py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-stone-200/80 dark:bg-stone-800" />
            <div className="mt-4 flex gap-3">
              <div className="h-16 flex-1 animate-pulse rounded-xl bg-stone-200/80 dark:bg-stone-800" />
              <div className="h-16 flex-1 animate-pulse rounded-xl bg-stone-200/80 dark:bg-stone-800" />
            </div>
          </div>
          <div className="space-y-6 lg:col-span-5">
            <div className="h-4 w-28 animate-pulse rounded bg-stone-200/80 dark:bg-stone-800" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-stone-200/80 dark:bg-stone-800" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-stone-200/80 dark:bg-stone-800" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-stone-200/80 dark:bg-stone-800" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-stone-200/80 dark:bg-stone-800" />
          </div>
        </div>
      </Container>
    );
  }

  // Not found state
  if (!product) {
    return (
      <Container as="section" section className="py-20 text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-stone-300 p-10">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-bold">Furniture Piece Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The product you are looking for may have been archived or the URL has changed.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-brand-red-hover"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Shop
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const sku = getProductSku(product);
  const secondaryImage = product.image_45 || product.image45;
  const isOriginalPriceVerified =
    typeof product.originalPrice === "number" &&
    typeof product.price === "number" &&
    product.originalPrice > product.price;

  const discountPercent =
    isOriginalPriceVerified && product.price
      ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
      : null;

  return (
    <article className="min-h-screen bg-background pb-24 pt-6">
      <Container>
        {/* BREADCRUMB NAVIGATION */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Link to="/" className="transition hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="transition hover:text-foreground">
            Shop Catalog
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            to="/shop"
            search={{ category: product.category }}
            className="transition hover:text-foreground capitalize"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate max-w-[200px] sm:max-w-xs font-medium text-foreground">
            {product.name}
          </span>
        </nav>

        {/* MAIN PRODUCT SHOWCASE GRID */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* LEFT COLUMN: IMAGE GALLERY */}
          <section aria-label="Product Image Gallery" className="lg:col-span-7">
            <ProductGallery
              frontImage={product.image}
              angle45Image={secondaryImage}
              productName={product.name}
              badge={product.badge}
            />
          </section>

          {/* RIGHT COLUMN: PRODUCT INFORMATION & ACTIONS */}
          <section
            aria-label="Product Information and Purchasing"
            className="flex flex-col lg:col-span-5"
          >
            {/* Category & Badge */}
            <div className="flex items-center justify-between">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                {product.category}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share product"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground transition hover:border-foreground hover:text-foreground"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsWishlisted(!isWishlisted);
                    toast.success(
                      !isWishlisted ? `Saved ${product.name} to wishlist` : `Removed from wishlist`,
                    );
                  }}
                  aria-label="Save to wishlist"
                  className={`flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-background transition ${
                    isWishlisted
                      ? "border-primary text-primary"
                      : "text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-primary" : ""}`} />
                </button>
              </div>
            </div>

            {/* Product Name */}
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl leading-tight">
              {product.name}
            </h1>

            {/* SKU and Workshop Origin Pill */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2.5 py-1 font-mono text-[11px] text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                <span>SKU: {sku}</span>
                <button
                  type="button"
                  onClick={handleCopySku}
                  aria-label="Copy SKU code"
                  className="text-stone-400 hover:text-foreground"
                >
                  {isCopiedSku ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
              <span>·</span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                <Check className="h-3 w-3" /> Workshop Verified
              </span>
              <span>·</span>
              <span>Pallikaranai, Chennai</span>
            </div>

            {/* PRICING BLOCK */}
            <div className="mt-6 rounded-xl border border-stone-200/90 bg-[#faf9f6] p-4 dark:border-stone-800 dark:bg-stone-900/40">
              <div className="flex items-baseline gap-3">
                {product.price !== undefined ? (
                  <>
                    <span className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      {formatPrice(product.price)}
                    </span>

                    {/* Original Price ONLY if verified */}
                    {isOriginalPriceVerified && (
                      <div className="flex items-center gap-2">
                        <span className="text-base text-muted-foreground line-through">
                          {formatPrice(product.originalPrice!)}
                        </span>
                        {discountPercent && (
                          <span className="rounded-sm bg-brand-yellow/80 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-charcoal">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <span className="font-display text-2xl font-semibold text-foreground">
                      Price upon custom request
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Contact our workshop for bespoke sizing and fabric quotes.
                    </p>
                  </div>
                )}
              </div>

              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>
                  Inclusive of all GST. Free white-glove setup within Chennai metropolitan area.
                </span>
              </p>
            </div>

            {/* PRODUCT DESCRIPTION */}
            <div className="mt-5 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
              <p>{product.description}</p>
            </div>

            <hr className="my-6 border-stone-200 dark:border-stone-800" />

            {/* PURCHASING CONTROLS */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label
                  htmlFor="product-quantity"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Quantity
                </label>
                <div className="flex items-center rounded-lg border border-border bg-background shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="flex h-10 w-10 items-center justify-center text-foreground transition hover:bg-muted disabled:opacity-30"
                  >
                    –
                  </button>
                  <input
                    id="product-quantity"
                    type="number"
                    min="1"
                    max="99"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setQuantity(Math.max(1, Math.min(99, val)));
                    }}
                    className="h-10 w-12 text-center text-sm font-semibold focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 99}
                    aria-label="Increase quantity"
                    className="flex h-10 w-10 items-center justify-center text-foreground transition hover:bg-muted disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                {product.price && (
                  <span className="text-xs text-muted-foreground ml-auto font-medium">
                    Subtotal:{" "}
                    <strong className="text-foreground">
                      {formatPrice(product.price * quantity)}
                    </strong>
                  </span>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {/* Add to Cart Button */}
                <button
                  type="button"
                  id="add-to-cart-button"
                  onClick={handleAddToCart}
                  className={`flex h-12 items-center justify-center gap-2 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm ${
                    addedRecently
                      ? "bg-emerald-600 text-white"
                      : "bg-primary text-primary-foreground hover:bg-brand-red-hover active:scale-[0.99]"
                  }`}
                >
                  {addedRecently ? (
                    <>
                      <Check className="h-4 w-4" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" /> Add to Cart
                    </>
                  )}
                </button>

                {/* Buy Now Button */}
                <button
                  type="button"
                  id="buy-now-button"
                  onClick={handleBuyNow}
                  className="flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-foreground bg-foreground text-background font-semibold text-sm transition hover:bg-transparent hover:text-foreground active:scale-[0.99]"
                >
                  Buy Now
                </button>
              </div>

              {/* Enquire on WhatsApp Button */}
              <a
                id="whatsapp-enquire-button"
                href={generateWhatsAppInquiryUrl(product, quantity)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] text-white font-semibold text-sm transition hover:bg-[#1ea851] shadow-xs active:scale-[0.99]"
              >
                <MessageCircle className="h-4 w-4" /> Enquire on WhatsApp (Direct Workshop)
              </a>

              {/* Pay Online via QR Link */}
              <div className="pt-1 text-center">
                <Link
                  to="/pay-online"
                  search={{
                    amount: product.price ? product.price * quantity : undefined,
                    order: `PRD-${Date.now().toString().slice(-6)}`,
                    items: `${product.name} (Qty: ${quantity})`,
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Scan & Pay Online via UPI QR Code →</span>
                </Link>
              </div>

              <p className="text-center text-[11px] text-muted-foreground">
                Questions about custom fabric or room dimensions? Call workshop at{" "}
                <a
                  href={`tel:${BRAND.phone}`}
                  className="font-medium underline hover:text-foreground"
                >
                  +91 {BRAND.phone}
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* DETAILED SPECIFICATIONS & PRODUCT TABS */}
        <section
          aria-label="Detailed Product Specifications and Information"
          className="mt-16 sm:mt-20 border-t border-border pt-12"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl text-center mb-8">
              Craftsmanship & Technical Specifications
            </h2>

            <Tabs defaultValue="specifications" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-muted/60 rounded-xl mb-8">
                <TabsTrigger
                  value="specifications"
                  className="py-2.5 text-xs sm:text-sm font-medium"
                >
                  Verified Specs
                </TabsTrigger>
                <TabsTrigger value="description" className="py-2.5 text-xs sm:text-sm font-medium">
                  Detailed Story
                </TabsTrigger>
                <TabsTrigger value="care" className="py-2.5 text-xs sm:text-sm font-medium">
                  Care & Polish
                </TabsTrigger>
                <TabsTrigger value="delivery" className="py-2.5 text-xs sm:text-sm font-medium">
                  Delivery & Setup
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: VERIFIED SPECIFICATIONS TABLE */}
              <TabsContent value="specifications" className="focus:outline-hidden">
                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
                  <div className="border-b border-stone-200 bg-stone-50/80 px-6 py-4 dark:border-stone-800 dark:bg-stone-800/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Only verified master craftsman specifications are shown below
                    </p>
                  </div>

                  <dl className="divide-y divide-stone-100 dark:divide-stone-800/80">
                    {/* Material */}
                    <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-800/20">
                      <dt className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" /> Material
                      </dt>
                      <dd className="text-sm font-medium text-foreground sm:col-span-2">
                        {product.material || "Contact us for details"}
                      </dd>
                    </div>

                    {/* Dimensions */}
                    <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-800/20">
                      <dt className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-primary" /> Dimensions
                      </dt>
                      <dd className="text-sm font-medium text-foreground sm:col-span-2">
                        {product.dimensions || "Contact us for details"}
                      </dd>
                    </div>

                    {/* Colour */}
                    <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-800/20">
                      <dt className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" /> Colour & Shade
                      </dt>
                      <dd className="text-sm font-medium text-foreground sm:col-span-2">
                        {product.colour || "Contact us for details"}
                      </dd>
                    </div>

                    {/* Finish */}
                    <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-800/20">
                      <dt className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" /> Finish & Polish
                      </dt>
                      <dd className="text-sm font-medium text-foreground sm:col-span-2">
                        {product.finish || "Contact us for details"}
                      </dd>
                    </div>

                    {/* Weight */}
                    <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-800/20">
                      <dt className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" /> Approximate Weight
                      </dt>
                      <dd className="text-sm font-medium text-foreground sm:col-span-2">
                        {product.weight || "Contact us for details"}
                      </dd>
                    </div>

                    {/* Warranty */}
                    <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-800/20">
                      <dt className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" /> Warranty
                      </dt>
                      <dd className="text-sm font-medium text-foreground sm:col-span-2">
                        {product.warranty || "5-Year Structural Frame Warranty"}
                      </dd>
                    </div>

                    {/* Assembly */}
                    <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-800/20">
                      <dt className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-primary" /> Assembly Required
                      </dt>
                      <dd className="text-sm font-medium text-foreground sm:col-span-2">
                        {product.assembly || "Pre-assembled / Free On-site Assembly by Nakashi"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </TabsContent>

              {/* TAB 2: DETAILED STORY & CRAFTSMANSHIP */}
              <TabsContent value="description" className="focus:outline-hidden">
                <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="font-display text-xl font-semibold mb-3">
                    The Art of The Nakashi Furnitures
                  </h3>
                  <div className="prose prose-stone dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-4 text-stone-700 dark:text-stone-300">
                    <p>{product.detailedDescription || product.description}</p>
                    <p>
                      Every wooden member is hand-selected from certified sustainable teakwood
                      reserves, carefully seasoned in controlled kiln dryers down to 8–10% moisture
                      content. This vital step prevents any shrinking, warping, or insect damage in
                      humid maritime climates like Chennai.
                    </p>

                    {product.features && product.features.length > 0 && (
                      <div className="mt-6 border-t border-border pt-6">
                        <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-4">
                          Distinguishing Features:
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
                          {product.features.map((feat, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground"
                            >
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: CARE INSTRUCTIONS */}
              <TabsContent value="care" className="focus:outline-hidden">
                <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="font-display text-xl font-semibold mb-3">
                    Preserving Your Heirloom Piece
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                    {product.careInstructions ||
                      "Wipe wooden surfaces periodically with a dry, soft microfiber cloth. Treat with natural teak wax once a year to rejuvenate the organic golden glow. Blot spills immediately and avoid prolonged direct sun exposure."}
                  </p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="rounded-xl border border-border/80 p-4 bg-stone-50 dark:bg-stone-800/40">
                      <p className="font-semibold text-foreground mb-1">Dusting</p>
                      <p className="text-muted-foreground">
                        Use soft lint-free cotton cloth. Avoid coarse feather dusters.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/80 p-4 bg-stone-50 dark:bg-stone-800/40">
                      <p className="font-semibold text-foreground mb-1">Spill Defense</p>
                      <p className="text-muted-foreground">
                        Blot liquids instantly without scrubbing. Keep coasters under hot cups.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/80 p-4 bg-stone-50 dark:bg-stone-800/40">
                      <p className="font-semibold text-foreground mb-1">Sunlight & Climate</p>
                      <p className="text-muted-foreground">
                        Position away from direct UV glare and air conditioner draft paths.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4: DELIVERY & WHITE GLOVE INSTALLATION */}
              <TabsContent value="delivery" className="focus:outline-hidden">
                <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="font-display text-xl font-semibold mb-3">
                    Complimentary White-Glove Logistics
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                    {product.deliveryInfo ||
                      "Our in-house logistics team ensures your furniture is delivered safely in custom padded foam wrapping. Our senior technicians unbox, assemble, and position the piece in your desired room, removing all packaging debris before leaving."}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-muted-foreground border-t border-border pt-6">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <span>Chennai Delivery: 2–4 Business Days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span>100% Transit Insurance Guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      <span>Zero Assembly Charge on Delivery</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <section aria-label="Related Products" className="mt-20 border-t border-border pt-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Curated Collection
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  More in {product.category}
                </h2>
              </div>
              <Link
                to="/shop"
                search={{ category: product.category }}
                className="mt-2 text-xs font-medium text-primary hover:underline sm:mt-0"
              >
                View all {product.category} →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onAddToCart={(p) => cart.add(p.id, 1)}
                  onViewDetails={(p) => navigate({ to: `/product/${getProductSlug(p)}` })}
                />
              ))}
            </div>
          </section>
        )}
      </Container>
    </article>
  );
}
