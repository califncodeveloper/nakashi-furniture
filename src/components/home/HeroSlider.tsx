import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { buttonVariants } from "@/components/common/Button";
import { Container } from "@/components/layout/Container";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { BRAND } from "@/constants/brand";
import { cn } from "@/lib/utils";

import heroLiving from "@/assets/hero-living.jpg";
import inspBedroom from "@/assets/insp-bedroom.jpg";
import inspDining from "@/assets/insp-dining.jpg";
import inspReading from "@/assets/insp-reading.jpg";

export interface HeroSlideData {
  id: string;
  image: string;
  imageAlt: string;
  badge: string;
  title: string;
  titleHighlight?: string;
  titleSuffix?: string;
  description: string;
  primaryCta: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
  secondaryCta?: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
  features: {
    label: string;
    sublabel: string;
  }[];
  showroomTag?: {
    badge: string;
    title: string;
    subtitle: string;
  };
}

const WHATSAPP = `https://wa.me/91${BRAND.phone}?text=${encodeURIComponent("Hello Nakashi Furnitures, I would like to know more about your furniture collection.")}`;

export const HERO_SLIDES: HeroSlideData[] = [
  {
    id: "living-atelier",
    image: heroLiving,
    imageAlt: "Burgundy velvet sofa in a sunlit luxury living room",
    badge: "The Nakashi Furnitures · Pallikaranai, Chennai",
    title: "Make Your Home",
    titleHighlight: "Beautiful",
    titleSuffix: " & Enduring.",
    description:
      "Discover master-crafted solid hardwoods, rich tailored velvets, and ergonomic living solutions tailored for Chennai's finest residences.",
    primaryCta: {
      label: "Explore Collection",
      href: "/shop",
    },
    secondaryCta: {
      label: "Visit Showroom",
      href: "/contact",
    },
    features: [
      { label: "100%", sublabel: "Solid Hardwoods" },
      { label: "5-Year", sublabel: "Structure Warranty" },
      { label: "White Glove", sublabel: "Chennai Delivery" },
    ],
    showroomTag: {
      badge: "Pallikaranai Showroom",
      title: "Experience In Person",
      subtitle: "No. 99, Velachery Main Road, Chennai",
    },
  },
  {
    id: "teak-bedroom",
    image: inspBedroom,
    imageAlt: "Handcrafted solid teakwood bedroom set with warm ambient lighting",
    badge: "Royal Teakwood Bedrooms · Pallikaranai Atelier",
    title: "Sanctuary of Rest &",
    titleHighlight: "Timeless",
    titleSuffix: " Comfort.",
    description:
      "Heirloom teak beds with whisper-silent hydraulic underbed storage, plush tufted headboards, and moisture-sealed timber built for coastal living.",
    primaryCta: {
      label: "Explore Teak Beds",
      href: "/shop",
    },
    secondaryCta: {
      label: "Bespoke Sizing via WhatsApp",
      href: WHATSAPP,
      isExternal: true,
    },
    features: [
      { label: "Grade-A", sublabel: "Seasoned Teakwood" },
      { label: "Hydraulic", sublabel: "Underbed Storage" },
      { label: "Lifetime", sublabel: "Mortise Joinery" },
    ],
    showroomTag: {
      badge: "Custom Dimensions",
      title: "Tailored For You",
      subtitle: "King, Queen & Bespoke Mattress Fits",
    },
  },
  {
    id: "solid-dining",
    image: inspDining,
    imageAlt: "Solid hardwood dining table with elegant upholstered dining chairs",
    badge: "Solid Hardwood Dining · Family Gatherings",
    title: "Artisanal Tables Built for",
    titleHighlight: "Cherished",
    titleSuffix: " Feasts.",
    description:
      "Flawlessly proportioned 6 and 8-seater dining suites in solid timber, sealed with non-toxic matte Italian topcoats for effortless hosting.",
    primaryCta: {
      label: "Discover Dining Sets",
      href: "/shop",
    },
    secondaryCta: {
      label: "Book Showroom Visit",
      href: "/contact",
    },
    features: [
      { label: "6 & 8 Seater", sublabel: "Spacious Layouts" },
      { label: "Italian Matte", sublabel: "Heat & Spill Proof" },
      { label: "Hand-Rubbed", sublabel: "Natural Wood Grain" },
    ],
    showroomTag: {
      badge: "Direct Atelier Pricing",
      title: "Pallikaranai Showroom",
      subtitle: "See & Touch Wood Finishes",
    },
  },
  {
    id: "reading-lounge",
    image: inspReading,
    imageAlt: "Sumptuous tufted armchair and reading corner with solid wood accents",
    badge: "Bespoke Lounges · Premium Velvets & Linens",
    title: "Turn Quiet Corners into",
    titleHighlight: "Luxury",
    titleSuffix: " Sanctuaries.",
    description:
      "From hand-tufted Chesterfield armchairs to solid brass-studded reading corners, transform your quiet alcoves into timeless sanctuaries.",
    primaryCta: {
      label: "Browse Armchairs",
      href: "/shop",
    },
    secondaryCta: {
      label: "Request Free Swatches",
      href: WHATSAPP,
      isExternal: true,
    },
    features: [
      { label: "Deep-Button", sublabel: "Diamond Tufting" },
      { label: "High-Resilience", sublabel: "Shape-Retaining Foam" },
      { label: "40+ Swatches", sublabel: "Velvet & Linen Colors" },
    ],
    showroomTag: {
      badge: "Fabric Studio",
      title: "Bespoke Swatches",
      subtitle: "Available in Showroom & by Courier",
    },
  },
];

const SLIDE_DURATION = 5000; // 5 seconds per slide

interface HeroSliderProps {
  slides?: HeroSlideData[];
  autoplayInterval?: number;
}

export function HeroSlider({
  slides = HERO_SLIDES,
  autoplayInterval = SLIDE_DURATION,
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const prefersReduced = useReducedMotion();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef<number>(0);

  // Preload images to eliminate layout shifts and flicker
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, [slides]);

  const goToSlide = useCallback(
    (index: number, newDirection?: 1 | -1) => {
      if (index === currentIndex) return;
      const dir = newDirection ?? (index > currentIndex ? 1 : -1);
      setDirection(dir);
      setCurrentIndex(index);
      setProgress(0);
      startTimeRef.current = Date.now();
      elapsedBeforePauseRef.current = 0;
    },
    [currentIndex],
  );

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
    startTimeRef.current = Date.now();
    elapsedBeforePauseRef.current = 0;
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
    startTimeRef.current = Date.now();
    elapsedBeforePauseRef.current = 0;
  }, [slides.length]);

  // Autoplay and progress bar ticker
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        window.cancelAnimationFrame(timerRef.current);
      }
      return;
    }

    const startTimestamp = Date.now() - elapsedBeforePauseRef.current;
    startTimeRef.current = startTimestamp;

    const step = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      elapsedBeforePauseRef.current = elapsed;
      const pct = Math.min((elapsed / autoplayInterval) * 100, 100);
      setProgress(pct);

      if (elapsed >= autoplayInterval) {
        handleNext();
      } else {
        timerRef.current = window.requestAnimationFrame(step);
      }
    };

    timerRef.current = window.requestAnimationFrame(step);

    return () => {
      if (timerRef.current) {
        window.cancelAnimationFrame(timerRef.current);
      }
    };
  }, [isPaused, currentIndex, autoplayInterval, handleNext]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  // Touch / swipe gesture handlers with smooth non-hijacking vertical tolerance
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Only trigger if horizontal swipe is clearly dominant and meets threshold (40px)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const currentSlide = slides[currentIndex];

  const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const;

  // Motion variants
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: prefersReduced ? 1 : 1.05,
      x: prefersReduced ? 0 : dir > 0 ? 30 : -30,
    }),
    center: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: prefersReduced ? 0.2 : 0.85,
        ease: PREMIUM_EASE,
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      scale: prefersReduced ? 1 : 0.98,
      x: prefersReduced ? 0 : dir > 0 ? -30 : 30,
      transition: {
        duration: prefersReduced ? 0.2 : 0.65,
        ease: PREMIUM_EASE,
      },
    }),
  };

  const textItemVariants: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 20 },
    visible: (customDelay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReduced ? 0.15 : 0.6,
        delay: prefersReduced ? 0 : customDelay,
        ease: PREMIUM_EASE,
      },
    }),
  };

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero Furniture Highlights"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden bg-charcoal text-white outline-none select-none min-h-[620px] sm:min-h-[660px] md:min-h-[720px] lg:min-h-[760px] xl:min-h-[820px] flex items-center"
    >
      {/* Background Slides with AnimatePresence */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={currentSlide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 h-full w-full will-change-transform"
        >
          <img
            src={currentSlide.image}
            alt={currentSlide.imageAlt}
            fetchPriority={currentIndex === 0 ? "high" : "auto"}
            decoding="async"
            className="h-full w-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
          />
        </motion.div>
      </AnimatePresence>

      {/* Cinematic Overlays for Text Legibility & Brand Atmosphere */}
      {/* 1. Primary Directional Gradient: Rich charcoal gradient across bottom and left */}
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-charcoal/95 via-charcoal/70 to-charcoal/30 sm:bg-gradient-to-r sm:from-charcoal/95 sm:via-charcoal/75 sm:to-charcoal/25"
        aria-hidden="true"
      />

      {/* 2. Ambient radial glow in brand primary/yellow tones */}
      <div
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/20 via-brand-yellow/10 to-transparent blur-3xl z-10"
        aria-hidden="true"
      />

      {/* 3. Top edge vignette for seamless header blending */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-charcoal/70 via-charcoal/30 to-transparent z-10"
        aria-hidden="true"
      />

      {/* 4. Bottom edge vignette for seamless transition into next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-charcoal/90 to-transparent z-10"
        aria-hidden="true"
      />

      {/* Main Slide Content */}
      <Container className="relative z-20 py-16 sm:py-20 md:py-24 lg:py-28 w-full">
        <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
          {/* Left Column: Heading, Description, CTAs, Features */}
          <div className="max-w-2xl">
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={currentSlide.id}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                {/* Eyebrow Pill */}
                <motion.div custom={0.1} variants={textItemVariants}>
                  <div className="inline-flex items-center gap-2.5 rounded-full border border-brand-yellow/30 bg-charcoal/80 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-brand-yellow shadow-soft backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-yellow opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-yellow" />
                    </span>
                    <span>{currentSlide.badge}</span>
                  </div>
                </motion.div>

                {/* Main Heading */}
                <motion.div custom={0.2} variants={textItemVariants}>
                  <h1 className="font-display text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl xl:text-7xl">
                    {currentSlide.title}{" "}
                    {currentSlide.titleHighlight && (
                      <span className="relative inline-block">
                        <em className="font-serif italic font-normal text-brand-yellow">
                          {currentSlide.titleHighlight}
                        </em>
                        <svg
                          className="absolute -bottom-2 left-0 w-full text-brand-yellow/70"
                          viewBox="0 0 250 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 9C60 3 190 3 248 9"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    )}
                    {currentSlide.titleSuffix}
                  </h1>
                </motion.div>

                {/* Description */}
                <motion.div custom={0.3} variants={textItemVariants}>
                  <p className="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                    {currentSlide.description}
                  </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div custom={0.4} variants={textItemVariants}>
                  <div className="flex flex-wrap items-center gap-3.5 pt-2">
                    {currentSlide.primaryCta.isExternal ? (
                      <a
                        href={currentSlide.primaryCta.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonVariants({
                          variant: "offer",
                          size: "lg",
                          className:
                            "shadow-lift gap-3 font-semibold text-charcoal hover:brightness-105",
                        })}
                      >
                        <span>{currentSlide.primaryCta.label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    ) : (
                      <Link
                        to={currentSlide.primaryCta.href as "/shop"}
                        className={buttonVariants({
                          variant: "offer",
                          size: "lg",
                          className:
                            "shadow-lift gap-3 font-semibold text-charcoal hover:brightness-105",
                        })}
                      >
                        <span>{currentSlide.primaryCta.label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}

                    {currentSlide.secondaryCta &&
                      (currentSlide.secondaryCta.isExternal ? (
                        <a
                          href={currentSlide.secondaryCta.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonVariants({
                            variant: "outline",
                            size: "lg",
                            className:
                              "gap-2 border-white/30 bg-charcoal/50 text-white backdrop-blur-md hover:bg-white hover:text-charcoal hover:border-white transition-colors",
                          })}
                        >
                          <span>{currentSlide.secondaryCta.label}</span>
                        </a>
                      ) : (
                        <Link
                          to={currentSlide.secondaryCta.href as "/contact"}
                          className={buttonVariants({
                            variant: "outline",
                            size: "lg",
                            className:
                              "gap-2 border-white/30 bg-charcoal/50 text-white backdrop-blur-md hover:bg-white hover:text-charcoal hover:border-white transition-colors",
                          })}
                        >
                          <span>{currentSlide.secondaryCta.label}</span>
                        </Link>
                      ))}
                  </div>
                </motion.div>

                {/* Features & Trust Indicators */}
                <motion.div custom={0.5} variants={textItemVariants}>
                  <div className="grid grid-cols-3 gap-3 border-t border-white/15 pt-5 text-left sm:gap-6 max-w-xl">
                    {currentSlide.features.map((feat, idx) => (
                      <div key={idx}>
                        <p className="font-display text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl">
                          {feat.label}
                        </p>
                        <p className="text-xs text-white/75">{feat.sublabel}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Glass Showroom Card (Visible on desktop for luxury atelier balance) */}
          {currentSlide.showroomTag && (
            <div className="hidden lg:flex flex-col items-end justify-center">
              <AnimatePresence initial={false} mode="sync">
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-sm rounded-2xl border border-white/20 bg-charcoal/70 p-5 shadow-premium backdrop-blur-md text-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-brand-yellow">
                        {currentSlide.showroomTag.badge}
                      </span>
                      <p className="mt-1 font-display text-lg font-semibold text-white">
                        {currentSlide.showroomTag.title}
                      </p>
                      <p className="mt-0.5 text-xs text-white/80 leading-relaxed">
                        {currentSlide.showroomTag.subtitle}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-yellow text-charcoal shadow-soft font-bold text-xs tracking-wider">
                      VISIT
                    </div>
                  </div>
                  <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Showroom Open Today
                    </span>
                    <Link
                      to="/contact"
                      className="text-brand-yellow hover:underline font-medium inline-flex items-center gap-1"
                    >
                      Get Directions →
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </Container>

      {/* Navigation Arrows: Left / Prev */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous slide"
        className="group absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full border border-white/20 bg-charcoal/60 text-white backdrop-blur-md shadow-lift transition-all duration-300 hover:scale-105 hover:bg-charcoal/90 hover:border-brand-yellow/80 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:-translate-x-0.5" />
      </button>

      {/* Navigation Arrows: Right / Next */}
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next slide"
        className="group absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full border border-white/20 bg-charcoal/60 text-white backdrop-blur-md shadow-lift transition-all duration-300 hover:scale-105 hover:bg-charcoal/90 hover:border-brand-yellow/80 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:translate-x-0.5" />
      </button>

      {/* Bottom Pagination & Progress Controls */}
      <div className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 sm:gap-4 rounded-full border border-white/15 bg-charcoal/80 px-4 py-2 text-white backdrop-blur-md shadow-lift">
        {/* Slide Counter */}
        <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-white/80 tabular-nums">
          0{currentIndex + 1} <span className="text-white/40">/</span> 0{slides.length}
        </span>

        <span className="h-3 w-px bg-white/20" aria-hidden="true" />

        {/* Clickable Pagination Dots with Active Progress Fill */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Slider Pagination">
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                onClick={() => goToSlide(idx)}
                className={cn(
                  "relative transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow cursor-pointer",
                  isActive
                    ? "h-2 w-8 sm:w-10 rounded-full bg-white/25 overflow-hidden"
                    : "h-2 w-2 sm:w-2.5 rounded-full bg-white/40 hover:bg-white/80",
                )}
              >
                {isActive && (
                  <motion.div
                    className="h-full bg-brand-yellow rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <span className="h-3 w-px bg-white/20" aria-hidden="true" />

        {/* Autoplay Pause / Play Toggle Button */}
        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          aria-label={isPaused ? "Resume slider autoplay" : "Pause slider autoplay"}
          className="flex h-5 w-5 items-center justify-center rounded text-white/75 transition-colors hover:text-brand-yellow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-yellow"
        >
          {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
        </button>
      </div>
    </section>
  );
}
