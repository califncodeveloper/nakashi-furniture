import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { ScrollReveal, StaggerContainer, StaggerItem, FadeIn } from "@/components/animations";
import { bestsellers, categories, newArrivals } from "@/constants/catalog";
import { cart } from "@/lib/cart";
import { fetchProductsFromDb, isSupabaseConfigured } from "@/lib/supabase";
import type { Product } from "@/types/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatPrice, BRAND } from "@/constants/brand";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/common/Button";

type ShopSearch = { q?: string | undefined; category?: string | undefined };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    q: typeof s["q"] === "string" ? (s["q"] as string) : undefined,
    category: typeof s["category"] === "string" ? (s["category"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop Premium Furniture — The Nakashi Furnitures" },
      {
        name: "description",
        content:
          "Browse handcrafted sofas, beds, dining tables, chairs, wardrobes and more from The Nakashi Furnitures, Chennai.",
      },
      { property: "og:title", content: "Shop Furniture — The Nakashi Furnitures" },
      {
        property: "og:description",
        content: "Browse sofas, beds, dining tables, chairs, wardrobes and more.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { q, category } = Route.useSearch();
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailAngle, setDetailAngle] = useState<"front" | "45deg">("front");
  const [, setIsLiveConnected] = useState<boolean>(false);

  // Fallback demo items
  const fallbackItems: Product[] = [...bestsellers, ...newArrivals];

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const configured = isSupabaseConfigured();
      setIsLiveConnected(configured);

      if (configured) {
        const { products, error } = await fetchProductsFromDb({ publishedOnly: true });
        if (!error && products && products.length > 0) {
          setDbProducts(products);
          setIsLoading(false);
          return;
        }
      }
      setDbProducts([]);
    } catch (e) {
      console.warn("Failed to load products from database:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const cat = categories.find(
    (c) =>
      c.slug.toLowerCase() === category?.toLowerCase() ||
      c.name.toLowerCase() === category?.toLowerCase(),
  );

  const usingLiveDb = dbProducts.length > 0;
  const sourceList = usingLiveDb ? dbProducts : fallbackItems;

  const filteredList = sourceList.filter((p) => {
    const pCat = (p.category || "").toLowerCase();
    const matchesCategory =
      !category ||
      (cat && (pCat === cat.name.toLowerCase() || pCat === cat.slug.toLowerCase())) ||
      pCat === category.toLowerCase() ||
      (category.toLowerCase() === "other" &&
        !categories.some(
          (c) => c.slug !== "other" && (c.slug === pCat || c.name.toLowerCase() === pCat),
        ));
    const matchesSearch =
      !q ||
      `${p.name} ${p.category} ${p.description || ""}`.toLowerCase().includes(q.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-background text-foreground pb-20">
      {/* Editorial Page Header with FadeIn */}
      <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-muted/40 via-muted/20 to-background py-10 md:py-14">
        <Container>
          <div className="flex flex-col gap-2">
            <FadeIn delay={0.1} direction="up">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <Link to="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
                <span>/</span>
                <span className="text-primary font-bold">Catalog</span>
                {cat && (
                  <>
                    <span>/</span>
                    <span className="text-foreground">{cat.name}</span>
                  </>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={0.2} direction="up">
              <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {cat ? cat.name : q ? `Search: “${q}”` : "The Furniture Collection"}
              </h1>
            </FadeIn>

            <FadeIn delay={0.3} direction="up">
              <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                {cat
                  ? `Explore handcrafted ${cat.name.toLowerCase()} tailored to elevate your living spaces with Grade-A hardwoods and custom fabrics.`
                  : "Every piece is thoughtfully designed with premium hardwoods, custom upholstery finishes, and ergonomic comfort for Chennai homes."}
              </p>
            </FadeIn>
          </div>

          {/* Category Filter Pills with Stagger */}
          <StaggerContainer
            stagger={0.04}
            delay={0.3}
            className="mt-8 flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none"
          >
            <StaggerItem direction="up">
              <Link
                to="/shop"
                search={{ q }}
                className={`shrink-0 rounded-full px-5 py-2 text-xs font-semibold tracking-wide uppercase transition-all duration-300 ${
                  !category
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "border border-border/80 bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground hover:bg-muted"
                }`}
              >
                All Furniture ({sourceList.length})
              </Link>
            </StaggerItem>
            {categories.map((c) => {
              const isActive = category === c.slug || (cat && cat.slug === c.slug);
              return (
                <StaggerItem key={c.slug} direction="up">
                  <Link
                    to="/shop"
                    search={{ category: c.slug, q }}
                    className={`shrink-0 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "border border-border/80 bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <img
                      src={c.image}
                      alt=""
                      className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-border"
                    />
                    <span>{c.name}</span>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </Container>
      </section>

      {/* Main Catalog Grid */}
      <Container className="pt-10">
        <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filteredList.length}</strong> handcrafted
            designs
          </span>
          {category && (
            <Link
              to="/shop"
              search={{ q }}
              className="hover:text-primary transition-colors underline"
            >
              Reset Category
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredList.length ? (
          <StaggerContainer
            stagger={0.06}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {filteredList.map((p) => (
              <StaggerItem key={p.id} direction="up">
                <ProductCard
                  product={p}
                  onAddToCart={(x) => cart.add(x.id)}
                  onViewDetails={(x) => setSelectedProduct(x)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <ScrollReveal direction="up">
            <div className="my-12 rounded-3xl border border-dashed border-border p-12 text-center">
              <p className="font-display text-xl font-semibold text-foreground">
                No matching furniture found
              </p>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                We couldn't find pieces matching your filter. Clear search terms or request a custom
                quote from our Chennai atelier.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link to="/shop" className={buttonVariants({ size: "md" })}>
                  Clear Filters & View All
                </Link>
              </div>
            </div>
          </ScrollReveal>
        )}
      </Container>

      {/* Product Detail Modal with Animated Content */}
      <Dialog
        open={Boolean(selectedProduct)}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        {selectedProduct && (
          <DialogContent className="max-w-3xl overflow-hidden p-0 sm:rounded-2xl border border-border/80 shadow-premium">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image Preview with Angle switcher */}
              <div className="relative aspect-[4/5] bg-offwhite md:aspect-auto md:h-full">
                <img
                  src={
                    detailAngle === "45deg" && (selectedProduct.image_45 || selectedProduct.image45)
                      ? selectedProduct.image_45 || selectedProduct.image45!
                      : selectedProduct.image
                  }
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover transition-opacity duration-300"
                />

                {(selectedProduct.image_45 || selectedProduct.image45) && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 shadow-lift backdrop-blur-md border border-border/60">
                    <button
                      type="button"
                      onClick={() => setDetailAngle("front")}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                        detailAngle === "front"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Front Angle
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailAngle("45deg")}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                        detailAngle === "45deg"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      45° View
                    </button>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col p-6 sm:p-8 justify-between">
                <div>
                  <DialogHeader className="text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                      {selectedProduct.category}
                    </span>
                    <DialogTitle className="mt-1 font-display text-2xl font-bold tracking-tight">
                      {selectedProduct.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      The Nakashi Furnitures · Pallikaranai, Chennai
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-4 flex items-baseline gap-3 border-y border-border/60 py-3">
                    {selectedProduct.price !== undefined ? (
                      <>
                        <span className="font-display text-2xl font-bold text-foreground">
                          {formatPrice(selectedProduct.price)}
                        </span>
                        {selectedProduct.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(selectedProduct.originalPrice)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="font-display text-lg font-medium text-foreground">
                        ₹ Price on Request / Custom Quote
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <p className="leading-relaxed">
                      {selectedProduct.description ||
                        "Artisanal furniture piece manufactured with high-durability hardwood and hand-tailored finishes. Custom measurements and fabric swatches available upon enquiry."}
                    </p>

                    {selectedProduct.dimensions && (
                      <p className="text-xs">
                        <strong className="text-foreground">Dimensions:</strong>{" "}
                        {selectedProduct.dimensions}
                      </p>
                    )}
                    {selectedProduct.material && (
                      <p className="text-xs">
                        <strong className="text-foreground">Materials:</strong>{" "}
                        {selectedProduct.material}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-2.5 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      cart.add(selectedProduct.id);
                      setSelectedProduct(null);
                    }}
                    className={buttonVariants({
                      size: "lg",
                      className: "w-full gap-2 shadow-soft",
                    })}
                  >
                    <ShoppingBag className="h-4 w-4" /> Add to Shopping Bag
                  </button>

                  <a
                    href={`https://wa.me/91${BRAND.phone}?text=${encodeURIComponent(`Hello Nakashi Furnitures, I am interested in ${selectedProduct.name} (${selectedProduct.category}). Could you share more details?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({
                      variant: "outline",
                      size: "lg",
                      className: "w-full gap-2",
                    })}
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp Custom Enquiry
                  </a>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
