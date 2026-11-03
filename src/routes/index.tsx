import { useState, useEffect, useMemo, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Armchair,
  MessageCircle,
  Ruler,
  Sofa,
  Store,
  Sparkles,
  Star,
  Quote,
  Phone,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { buttonVariants } from "@/components/common/Button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Container } from "@/components/layout/Container";
import { CategoryCard } from "@/components/product/CategoryCard";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  FadeIn,
  Marquee,
} from "@/components/animations";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { BRAND } from "@/constants/brand";
import { bestsellers, categories, newArrivals } from "@/constants/catalog";
import { cn } from "@/lib/utils";
import { cart } from "@/lib/cart";
import { fetchProductsFromDb, isSupabaseConfigured } from "@/lib/supabase";
import type { Product } from "@/types/product";
import hero from "@/assets/hero-living.jpg";
import inspBedroom from "@/assets/insp-bedroom.jpg";
import inspDining from "@/assets/insp-dining.jpg";
import inspReading from "@/assets/insp-reading.jpg";

const TITLE = "The Nakashi Furnitures — Artisanal Luxury for Modern Living";
const DESC =
  "Handcrafted sofas, teak beds, dining sets and custom cabinetry from The Nakashi Furnitures, Pallikaranai, Chennai.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const WHATSAPP = `https://wa.me/91${BRAND.phone}?text=${encodeURIComponent("Hello Nakashi Furnitures, I would like to know more about your furniture collection.")}`;

const REVIEWS = [
  {
    name: "Dr. Arvind Sundaram",
    location: "Adyar, Chennai",
    quote:
      "The custom teakwood dining table and chairs delivered exceeded our expectations. The wood finishing is silky smooth, and the craftsmanship is genuine heirloom quality.",
    rating: 5,
  },
  {
    name: "Meera Krishnan",
    location: "Besant Nagar",
    quote:
      "M. Zubair personally guided us with fabric swatches for our burgundy Chesterfield sofa. Outstanding comfort, delivered right to our 3rd floor living room flawlessly.",
    rating: 5,
  },
  {
    name: "Siddharth Rajan",
    location: "Velachery",
    quote:
      "Hydraulic storage bed crafted in solid hardwood. Zero creaking, luxurious headboard padding, and transparent pricing. Highly recommend visiting the Pallikaranai showroom.",
    rating: 5,
  },
  {
    name: "Pooja & Karthik",
    location: "ECR, Chennai",
    quote:
      "We furnished our entire villa with The Nakashi Furnitures. From the fluted coffee tables to custom armoires, everything harmonizes beautifully. Outstanding atelier service.",
    rating: 5,
  },
];

function Index() {
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured()) {
          const { products, error } = await fetchProductsFromDb({ publishedOnly: true });
          if (!error && products && products.length > 0 && isMounted) {
            setDbProducts(products);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to load products from database:", err);
      }
      if (isMounted) {
        setDbProducts([]);
        setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Split DB products or use rich fallback:
  // 1. Bestsellers: products with badge === "Bestseller", plus popular items up to 4
  const bestsellerItems = useMemo(() => {
    if (dbProducts.length === 0) return bestsellers.slice(0, 4);
    const explicit = dbProducts.filter((p) => p.badge?.toLowerCase() === "bestseller");
    const others = dbProducts.filter((p) => p.badge?.toLowerCase() !== "bestseller");
    const combined = [...explicit];
    for (const item of others) {
      if (combined.length >= 4) break;
      if (!combined.some((c) => c.id === item.id)) {
        combined.push(item);
      }
    }
    return combined.length > 0 ? combined.slice(0, 4) : bestsellers.slice(0, 4);
  }, [dbProducts]);

  // 2. New Arrivals: newest products from DB not featured in bestsellers
  const newArrivalItems = useMemo(() => {
    if (dbProducts.length === 0) return newArrivals.slice(0, 4);
    const bestsellerIds = new Set(bestsellerItems.map((p) => p.id));
    const fresh = dbProducts.filter((p) => !bestsellerIds.has(p.id));
    if (fresh.length >= 4) {
      return fresh.slice(0, 4);
    }
    const combined = [...fresh, ...newArrivals.filter((p) => !bestsellerIds.has(p.id))];
    return combined.slice(0, 4);
  }, [dbProducts, bestsellerItems]);

  return (
    <div id="top" className="relative">
      <Hero />
      <Categories />
      <Collections />
      <ProductRow
        id="bestsellers"
        eyebrow="Most Loved"
        title="Bestselling Furniture"
        products={bestsellerItems}
        isLoading={isLoading}
        className="pt-4 pb-12 md:pt-6 md:pb-16"
      />
      <Promo />
      <ProductRow
        id="new-arrivals"
        eyebrow="Curated Arrivals"
        title="New To The Atelier"
        products={newArrivalItems}
        isLoading={isLoading}
        muted
      />
      <WhyUs />
      <TestimonialsMarquee />
      <Inspiration />
      <WhatsAppCta />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Visually Engaging Hero Section                                     */
/* ------------------------------------------------------------------ */

function Hero() {
  const prefersReduced = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-muted/40 via-background to-background py-12 md:py-20 lg:py-24"
    >
      {/* Subtle background radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-br from-primary/8 via-brand-yellow/10 to-transparent blur-3xl" />

      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_1.2fr] lg:gap-16">
        {/* Left Column: Typography & CTAs */}
        <div className="z-10">
          <FadeIn delay={0.1} direction="up">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-background/80 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-primary shadow-xs backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span>The Nakashi Furnitures · Chennai</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.25} direction="up">
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl xl:text-7xl">
              Make Your Home <br />
              <span className="relative inline-block">
                <em className="font-serif italic font-normal text-primary">Beautiful</em>
                <svg
                  className="absolute -bottom-2 left-0 w-full text-brand-yellow/60"
                  viewBox="0 0 250 12"
                  fill="none"
                >
                  <path
                    d="M2 9C60 3 190 3 248 9"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              {" & Enduring."}
            </h1>
          </FadeIn>

          <FadeIn delay={0.4} direction="up">
            <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Discover master-crafted solid hardwoods, rich tailored velvets, and ergonomic living
              solutions tailored for Chennai's finest residences.
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={0.55} direction="up">
            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <Link
                to="/shop"
                className={buttonVariants({ size: "lg", className: "shadow-lift gap-3" })}
              >
                <span>Explore Collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className={buttonVariants({ variant: "outline", size: "lg", className: "gap-2" })}
              >
                <span>Visit Showroom</span>
              </Link>
            </div>
          </FadeIn>

          {/* Trust Highlights */}
          <FadeIn delay={0.65} direction="up">
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-border/80 pt-6 text-left">
              <div>
                <p className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  100%
                </p>
                <p className="text-xs text-muted-foreground">Solid Hardwoods</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  5-Year
                </p>
                <p className="text-xs text-muted-foreground">Structure Warranty</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  White Glove
                </p>
                <p className="text-xs text-muted-foreground">Chennai Delivery</p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Right Column: Hero Visual with Luxury Overlay */}
        <FadeIn delay={0.3} direction="none">
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-premium group">
              <motion.div style={!prefersReduced ? { y: heroImageY, scale: heroScale } : undefined}>
                <img
                  src={hero}
                  alt="Burgundy velvet sofa in a sunlit luxury living room"
                  width={1600}
                  height={1200}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-104"
                />
              </motion.div>

              {/* Ambient image vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />

              {/* Glass Showroom Location Pill */}
              <motion.div
                initial={!prefersReduced ? { opacity: 0, y: 20 } : undefined}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-5 left-5 right-5 sm:right-auto sm:max-w-sm rounded-2xl border border-white/20 bg-charcoal/80 p-4 shadow-lift backdrop-blur-md text-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-yellow">
                      Experience In Person
                    </span>
                    <p className="mt-0.5 font-display text-base font-semibold text-white">
                      Pallikaranai Showroom
                    </p>
                    <p className="text-xs text-white/75 truncate">
                      No. 99, Velachery Main Road, Chennai
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-yellow text-charcoal shadow-soft font-bold text-xs">
                    OPEN
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative floating ring */}
            <div
              className="absolute -right-4 -top-4 hidden h-24 w-24 rounded-full border-2 border-dashed border-brand-yellow/60 md:block animate-spin"
              style={{ animationDuration: "25s" }}
              aria-hidden="true"
            />
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Categories Section                                                 */
/* ------------------------------------------------------------------ */

function Categories() {
  return (
    <Container as="section" id="categories" className="py-8 md:py-12">
      <ScrollReveal direction="up" duration={0.5}>
        <SectionHeading
          eyebrow="Curation"
          title="Shop by Living Space"
          align="center"
          description="Every piece is designed to harmonize with your home's unique character and architecture."
          action={
            <Link
              to="/shop"
              className={buttonVariants({ variant: "outline", size: "md", className: "gap-2" })}
            >
              <span>View All Categories</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </ScrollReveal>
      <StaggerContainer stagger={0.08} className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        {categories.map((c) => (
          <StaggerItem key={c.slug} direction="up">
            <CategoryCard category={c} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </Container>
  );
}

/* ------------------------------------------------------------------ */
/*  Collections Bento Section                                          */
/* ------------------------------------------------------------------ */

function Collections() {
  const items = [
    {
      title: "The Living Room",
      text: "Sculptural sofas, fluted coffee tables and sleek media consoles",
      img: hero,
      span: "md:col-span-2 md:row-span-2 min-h-[360px] md:min-h-[520px]",
      category: "sofas",
      badge: "Signature Collection",
    },
    {
      title: "The Master Bedroom",
      text: "Hydraulic storage beds and grand armoires",
      img: inspBedroom,
      span: "min-h-[240px]",
      category: "beds",
      badge: "Rest & Serenity",
    },
    {
      title: "The Dining Room",
      text: "Solid teakwood dining tables & cushioned chairs",
      img: inspDining,
      span: "min-h-[240px]",
      category: "dining-tables",
      badge: "Gathering Spaces",
    },
  ];

  return (
    <section
      id="collections"
      className="pt-8 md:pt-12 pb-6 md:pb-8 bg-gradient-to-b from-muted/50 via-muted/30 to-background border-t border-border/80"
    >
      <Container>
        <ScrollReveal direction="up">
          <SectionHeading
            eyebrow="Curated Ensembles"
            title="Featured Room Collections"
            description="Pieces grouped by room so every corner of your residence feels cohesive, welcoming, and complete."
          />
        </ScrollReveal>
        <StaggerContainer stagger={0.12} className="grid gap-5 md:grid-cols-3 md:grid-rows-2">
          {items.map((i) => (
            <StaggerItem key={i.title} direction="scale" className={cn("h-full", i.span)}>
              <Link
                to="/shop"
                search={{ category: i.category }}
                className="group relative block h-full w-full overflow-hidden rounded-2xl border border-border/80 shadow-soft transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/50 hover:shadow-card-hover"
              >
                <img
                  src={i.img}
                  alt={i.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-106"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent" />

                {/* Tag pill */}
                <div className="absolute left-6 top-6">
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md border border-white/10">
                    {i.badge}
                  </span>
                </div>

                {/* Text content */}
                <div className="absolute inset-x-6 bottom-6 text-white sm:inset-x-8 sm:bottom-8">
                  <h3 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    {i.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-white/85 sm:text-base leading-relaxed">
                    {i.text}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 border-b border-brand-yellow/80 pb-1 text-sm font-semibold text-brand-yellow transition-all group-hover:translate-x-1">
                    <span>Explore Furniture</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Product Row                                                        */
/* ------------------------------------------------------------------ */

function ProductRow({
  id,
  eyebrow,
  title,
  products,
  isLoading,
  muted,
  className,
}: {
  id: string;
  eyebrow: string;
  title: string;
  products: Product[];
  isLoading?: boolean;
  muted?: boolean;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        className ? className : "section-y",
        muted && "bg-muted/30 border-y border-border/80",
      )}
    >
      <Container>
        <ScrollReveal direction="up">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            className={className?.includes("pt-") ? "mb-6 md:mb-8" : undefined}
            action={
              <Link
                to="/shop"
                className={buttonVariants({ variant: "outline", size: "md", className: "gap-2" })}
              >
                <span>View All Collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </ScrollReveal>
        <StaggerContainer
          stagger={0.1}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : products.length > 0 ? (
            products.map((p) => (
              <StaggerItem key={p.id} direction="up">
                <ProductCard product={p} onAddToCart={(x) => cart.add(x.id)} />
              </StaggerItem>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="font-display text-base font-semibold text-foreground">
                No items currently loaded in this category.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Explore our full catalog to discover more designs.
              </p>
              <div className="mt-4">
                <Link to="/shop" className={buttonVariants({ size: "sm" })}>
                  Browse Shop
                </Link>
              </div>
            </div>
          )}
        </StaggerContainer>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Showroom Promo Banner                                              */
/* ------------------------------------------------------------------ */

function Promo() {
  return (
    <Container as="section" className="py-10 md:py-16">
      <ScrollReveal direction="up" duration={0.7}>
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/50 shadow-premium">
          <div className="grid items-center md:grid-cols-12">
            {/* Content Column */}
            <div className="p-8 sm:p-12 md:col-span-7 lg:p-16">
              <ScrollReveal direction="left" delay={0.15}>
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-yellow/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-charcoal border border-brand-yellow/30">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Special Showroom Offer
                </span>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={0.25}>
                <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
                  Ask about this season's{" "}
                  <span className="text-primary italic font-serif">bespoke offers.</span>
                </h2>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={0.35}>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
                  Experience the tactile comfort of our teak frames and luxury velvet upholstery.
                  Call or message us to inquire about ongoing showroom packages in Pallikaranai.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={0.45}>
                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({
                      variant: "offer",
                      size: "lg",
                      className: "gap-2.5",
                    })}
                  >
                    <MessageCircle className="h-4.5 w-4.5" />
                    <span>WhatsApp Us</span>
                  </a>
                  <a
                    href={`tel:${BRAND.phone}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "lg",
                      className: "gap-2.5",
                    })}
                  >
                    <Phone className="h-4.5 w-4.5" />
                    <span>Call {BRAND.phone}</span>
                  </a>
                </div>
              </ScrollReveal>
            </div>

            {/* Visual Column with Ambient Image */}
            <div className="relative h-72 w-full md:col-span-5 md:h-full min-h-[320px]">
              <img
                src={inspReading}
                alt="Wooden lounge chair in reading corner"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-card via-transparent to-transparent hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:hidden" />
            </div>
          </div>
        </div>
      </ScrollReveal>
    </Container>
  );
}

/* ------------------------------------------------------------------ */
/*  Why Us / Our Promise                                               */
/* ------------------------------------------------------------------ */

function WhyUs() {
  const points = [
    {
      icon: Sofa,
      title: "Thoughtful Design",
      text: "Balanced proportions and timeless silhouettes suited for contemporary Indian homes.",
    },
    {
      icon: Armchair,
      title: "Enduring Comfort",
      text: "Multi-density pocket-spring cushioning engineered for genuine daily relaxation.",
    },
    {
      icon: Ruler,
      title: "Custom Sizing",
      text: "From compact apartments to expansive villas, we adapt dimensions to your space.",
    },
    {
      icon: Store,
      title: "Pallikaranai Showroom",
      text: "Visit us in person to feel fabric swatches, wood finishes, and firmness before choosing.",
    },
  ];

  return (
    <Container as="section" section>
      <ScrollReveal direction="up">
        <SectionHeading
          eyebrow="Our Standard"
          title="Why Choose The Nakashi Furnitures?"
          align="center"
          description="We treat furniture as lifelong investments that anchor the warmth of your family home."
        />
      </ScrollReveal>

      <StaggerContainer stagger={0.1} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {points.map(({ icon: Icon, title, text }) => (
          <StaggerItem key={title} direction="up">
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
              className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-7 shadow-soft transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/40 hover:shadow-card-hover"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground shadow-xs">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
              <div className="mt-6 h-0.5 w-8 rounded-full bg-border group-hover:bg-brand-yellow group-hover:w-16 transition-all duration-300" />
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </Container>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated Testimonials Marquee                                      */
/* ------------------------------------------------------------------ */

function TestimonialsMarquee() {
  return (
    <section className="section-y bg-gradient-to-b from-background via-muted/30 to-background border-y border-border/80 overflow-hidden">
      <Container className="mb-8">
        <ScrollReveal direction="up">
          <SectionHeading
            eyebrow="Patron Reviews"
            title="Trusted Across Chennai Residences"
            align="center"
            description="From Adyar villas to Velachery apartments, discover how Chennai homeowners feel about our crafted pieces."
          />
        </ScrollReveal>
      </Container>

      <Marquee speed={35} pauseOnHover>
        {REVIEWS.map((r, i) => (
          <div
            key={i}
            className="w-[340px] shrink-0 rounded-2xl border border-border/80 bg-card p-6 shadow-soft transition-all duration-300 hover:border-primary/40 hover:shadow-card-hover sm:w-[380px]"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-1 text-brand-yellow">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <Quote className="h-6 w-6 text-primary/20" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground italic">"{r.quote}"</p>
            <div className="mt-5 border-t border-border/60 pt-3">
              <p className="font-display text-sm font-bold text-foreground">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.location}</p>
            </div>
          </div>
        ))}
      </Marquee>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Inspiration Section                                                */
/* ------------------------------------------------------------------ */

function Inspiration() {
  return (
    <section
      id="inspiration"
      className="section-y bg-gradient-to-b from-muted/40 to-background border-t border-border/80"
    >
      <Container>
        <ScrollReveal direction="up">
          <SectionHeading
            eyebrow="Living Ideas"
            title="Designed for Everyday Moments"
            description="Explore ways to bring tactile serenity and architectural warmth to every room in your home."
          />
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Main vertical visual */}
          <ScrollReveal direction="left" className="md:col-span-5">
            <figure className="group relative overflow-hidden rounded-2xl border border-border/80 shadow-soft">
              <img
                src={inspBedroom}
                alt="Calm bedroom with walnut bed"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-104"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
              <figcaption className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] uppercase tracking-widest text-brand-yellow font-semibold">
                  Bedroom Sanctuary
                </span>
                <p className="mt-1 font-display text-xl font-bold sm:text-2xl">
                  Calm, Layered Bedrooms
                </p>
              </figcaption>
            </figure>
          </ScrollReveal>

          {/* Secondary stacked visuals */}
          <div className="grid gap-6 md:col-span-7">
            <ScrollReveal direction="right" delay={0.1}>
              <figure className="group relative overflow-hidden rounded-2xl border border-border/80 shadow-soft">
                <img
                  src={inspDining}
                  alt="Warm dining room with wooden table"
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-104"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
                <figcaption className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-[10px] uppercase tracking-widest text-brand-yellow font-semibold">
                    Dining Spaces
                  </span>
                  <p className="mt-1 font-display text-xl font-bold sm:text-2xl">
                    Made for Celebrations & Feasts
                  </p>
                </figcaption>
              </figure>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <figure className="group relative overflow-hidden rounded-2xl border border-border/80 shadow-soft">
                <img
                  src={inspReading}
                  alt="Reading corner with armchair"
                  loading="lazy"
                  className="aspect-[21/9] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-104"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
                <figcaption className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-[10px] uppercase tracking-widest text-brand-yellow font-semibold">
                    Quiet Corners
                  </span>
                  <p className="mt-1 font-display text-xl font-bold sm:text-2xl">
                    Balcony & Study Reading Nooks
                  </p>
                </figcaption>
              </figure>
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Concierge WhatsApp CTA                                             */
/* ------------------------------------------------------------------ */

function WhatsAppCta() {
  return (
    <Container as="section" section id="contact" className="pb-16 sm:pb-24">
      <ScrollReveal direction="up" duration={0.7}>
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-muted/30 to-card p-8 sm:p-14 text-center shadow-premium">
          {/* Subtle decorative circles */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-yellow/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-primary/10 blur-2xl" />

          <div className="relative mx-auto flex max-w-2xl flex-col items-center">
            <ScrollReveal direction="none" delay={0.1}>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-yellow to-[oklch(0.80_0.16_80)] text-charcoal shadow-soft">
                <MessageCircle className="h-7 w-7" />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Need Guidance Choosing The Right Piece?
              </h2>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
                Chat directly with store owner <strong>M. Zubair</strong> on WhatsApp for fabric
                samples, custom measurements, and showroom availability.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.4}>
              <div className="mt-8 flex flex-wrap justify-center gap-3.5">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ size: "lg", className: "gap-2.5 shadow-lift" })}
                >
                  <MessageCircle className="h-4.5 w-4.5" />
                  <span>Chat on WhatsApp</span>
                </a>
                <a
                  href={`mailto:${BRAND.email}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "gap-2.5",
                  })}
                >
                  <span>Email Showroom</span>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </ScrollReveal>
    </Container>
  );
}
