import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, Heart, ShoppingBag, Sparkles } from "lucide-react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/constants/brand";
import { cn } from "@/lib/utils";
import { getProductSlug } from "@/lib/productService";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (p: Product) => void;
  onViewDetails?: (p: Product) => void;
  onWishlist?: (p: Product) => void;
  className?: string;
}

export function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
  onWishlist,
  className,
}: ProductCardProps) {
  const [activeAngle, setActiveAngle] = useState<"front" | "45deg">("front");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const secondaryImage = product.image_45 || product.image45;
  const currentImage = activeAngle === "45deg" && secondaryImage ? secondaryImage : product.image;
  const slug = getProductSlug(product);
  const productUrl = `/product/${slug}`;
  const isAvailable = product.isAvailable !== false && product.is_available !== false;

  const isDiscounted =
    typeof product.price === "number" &&
    typeof product.originalPrice === "number" &&
    product.originalPrice > product.price;

  const cardDiscountPercent = isDiscounted
    ? Math.round(((product.originalPrice! - product.price!) / product.originalPrice!) * 100)
    : null;

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    onWishlist?.(product);
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl border border-border/80 bg-card p-3 sm:p-3.5 shadow-soft transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/40 hover:shadow-card-hover hover:-translate-y-1",
        className,
      )}
    >
      {/* Image container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-offwhite">
        <Link to={productUrl} className="block h-full w-full">
          <img
            src={currentImage}
            alt={product.name}
            loading="lazy"
            width={800}
            height={1000}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
          {/* Subtle bottom vignette for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        {/* Badge */}
        {product.badge && (
          <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-charcoal/90 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-brand-yellow shadow-soft backdrop-blur-md border border-white/10">
            <Sparkles className="h-2.5 w-2.5 text-brand-yellow" />
            <span>{product.badge}</span>
          </span>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          aria-label={`Add ${product.name} to wishlist`}
          onClick={handleWishlist}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 text-foreground shadow-soft backdrop-blur-md transition-all duration-300 hover:bg-background hover:scale-110 active:scale-95 z-10",
            isWishlisted && "text-primary fill-primary",
          )}
        >
          <Heart
            className={cn("h-4 w-4 transition-colors", isWishlisted && "fill-current text-primary")}
          />
        </button>

        {/* 45-degree angle switcher pill if second angle is available */}
        {secondaryImage && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-background/90 p-1 shadow-lift backdrop-blur-md text-[11px] font-medium transition-all duration-300 opacity-90 group-hover:opacity-100 z-10 border border-border/60">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setActiveAngle("front");
              }}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide transition-all",
                activeAngle === "front"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Front
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setActiveAngle("45deg");
              }}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide transition-all",
                activeAngle === "45deg"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              45° Angle
            </button>
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="mt-4 flex flex-1 flex-col px-1 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          {product.category}
        </span>

        <Link
          to={productUrl}
          className="mt-1 font-display text-base font-semibold leading-snug tracking-tight text-foreground transition-colors hover:text-primary sm:text-lg line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Price Row */}
        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 min-h-[1.75rem]">
          {product.price !== undefined ? (
            <>
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground leading-none">
                {formatPrice(product.price)}
              </span>
              {isDiscounted && (
                <>
                  <span className="text-xs sm:text-[13px] font-normal text-muted-foreground/75 line-through decoration-muted-foreground/50 leading-none">
                    <span className="sr-only">Original price: </span>
                    {formatPrice(product.originalPrice!)}
                  </span>
                  {cardDiscountPercent && (
                    <span className="inline-flex items-center rounded-md bg-brand-yellow/85 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-charcoal leading-none">
                      {cardDiscountPercent}% OFF
                    </span>
                  )}
                </>
              )}
            </>
          ) : (
            <span className="text-xs font-medium tracking-wide text-muted-foreground/90 italic">
              Price on request
            </span>
          )}
        </div>

        {product.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground/90">
            {product.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-2 gap-2">
          {onViewDetails ? (
            <button
              type="button"
              onClick={() => onViewDetails(product)}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-background text-xs font-semibold tracking-wide text-foreground transition-all duration-300 hover:border-foreground/40 hover:bg-muted active:scale-95"
            >
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Details</span>
            </button>
          ) : (
            <Link
              to={productUrl}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-background text-xs font-semibold tracking-wide text-foreground transition-all duration-300 hover:border-foreground/40 hover:bg-muted active:scale-95"
            >
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Details</span>
            </Link>
          )}

          {isAvailable ? (
            <button
              type="button"
              onClick={() => onAddToCart?.(product)}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-[oklch(0.48_0.19_18)] text-xs font-semibold tracking-wide text-primary-foreground shadow-soft transition-all duration-300 hover:shadow-lift hover:brightness-105 active:scale-95"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Add to Bag</span>
            </button>
          ) : (
            <span className="flex h-10 items-center justify-center rounded-xl border border-border bg-muted/50 text-xs font-medium text-muted-foreground">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div
      className="flex flex-col rounded-2xl border border-border/80 bg-card p-3.5 shadow-soft"
      aria-hidden
    >
      <div className="aspect-[4/5] animate-pulse rounded-xl bg-muted/60" />
      <div className="mt-4 space-y-2.5 px-1">
        <div className="h-3 w-1/4 animate-pulse rounded-md bg-muted/60" />
        <div className="h-5 w-3/4 animate-pulse rounded-md bg-muted/60" />
        <div className="h-6 w-2/5 animate-pulse rounded-md bg-muted/60" />
        <div className="mt-4 h-9 animate-pulse rounded-xl bg-muted/60" />
      </div>
    </div>
  );
}
