import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, Phone, Search, ShoppingBag, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND } from "@/constants/brand";
import { categories } from "@/constants/catalog";
import { ANNOUNCEMENT } from "@/constants/site";
import { cartCount, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useLenis } from "@/lib/lenis";
import { Container } from "./Container";

/* ------------------------------------------------------------------ */
/*  Shared Nav Link Style                                              */
/* ------------------------------------------------------------------ */

const linkCls =
  "relative py-1.5 text-sm font-medium tracking-wide text-foreground/80 transition-all duration-300 hover:text-primary after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-gradient-to-r after:from-primary after:to-brand-yellow after:transition-transform after:duration-300 hover:after:scale-x-100 data-[status=active]:text-primary data-[status=active]:font-semibold data-[status=active]:after:scale-x-100";

/* ------------------------------------------------------------------ */
/*  Announcement Bar                                                   */
/* ------------------------------------------------------------------ */

export function AnnouncementBar() {
  if (!ANNOUNCEMENT.message) return null;
  return (
    <aside
      aria-label="Announcement"
      className="announcement-bar relative z-50 border-b border-white/10 bg-gradient-to-r from-burgundy via-[oklch(0.32_0.07_350)] to-burgundy text-[11.5px] sm:text-[12.5px] font-medium text-burgundy-foreground"
    >
      <Container className="flex min-h-8 sm:h-9 items-center justify-center gap-2 sm:gap-4 px-3 sm:px-6 py-1 sm:py-0 sm:justify-between text-center">
        <p className="flex items-center justify-center gap-2 truncate tracking-wide">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-yellow opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-yellow shadow-xs" />
          </span>
          <span className="truncate">{ANNOUNCEMENT.message}</span>
          {ANNOUNCEMENT.linkLabel && (
            <Link
              to={ANNOUNCEMENT.linkTo as "/contact"}
              className="ml-1.5 hidden font-semibold text-brand-yellow underline underline-offset-4 transition-all hover:text-white hover:underline-offset-2 md:inline"
            >
              {ANNOUNCEMENT.linkLabel} →
            </Link>
          )}
        </p>
        <a
          href={`tel:${BRAND.phone}`}
          className="hidden shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium text-burgundy-foreground transition-all hover:bg-white/20 hover:text-brand-yellow sm:flex"
        >
          <Phone className="h-3 w-3 text-brand-yellow" />
          <span>Call Showroom: {BRAND.phone}</span>
        </a>
      </Container>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Logo                                                               */
/* ------------------------------------------------------------------ */

function Logo({ scrolled }: { scrolled?: boolean }) {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2 sm:gap-2.5 leading-none max-w-full"
      aria-label="The Nakashi Furnitures Home"
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-[oklch(0.48_0.19_18)] to-dark-wood text-white shadow-soft transition-all duration-300 group-hover:scale-105",
          scrolled ? "h-7.5 w-7.5 sm:h-8 sm:w-8" : "h-8.5 w-8.5 sm:h-9 sm:w-9",
        )}
      >
        <span
          className={cn(
            "font-display font-bold transition-all duration-300",
            scrolled ? "text-sm sm:text-base" : "text-base sm:text-lg",
          )}
        >
          N
        </span>
      </div>
      <div className="min-w-0">
        <span
          className={cn(
            "block font-display font-bold tracking-tight text-foreground transition-all duration-300 group-hover:text-primary leading-tight",
            scrolled ? "text-base sm:text-lg lg:text-xl" : "text-lg sm:text-xl lg:text-2xl",
          )}
        >
          NAKASHI
        </span>
        <span className="block truncate text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.22em] sm:tracking-[0.32em] text-muted-foreground">
          The Nakashi Furnitures
        </span>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Categories Dropdown (Desktop)                                      */
/* ------------------------------------------------------------------ */

function CategoriesDropdown() {
  const [open, setOpen] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const enter = useCallback(() => {
    clearTimeout(timeout.current);
    setOpen(true);
  }, []);

  const leave = useCallback(() => {
    timeout.current = setTimeout(() => setOpen(false), 160);
  }, []);

  return (
    <li className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 py-1.5 text-sm font-medium tracking-wide text-foreground/80 transition-all duration-300 hover:text-primary"
      >
        <span>Categories</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-300",
            open && "rotate-180 text-primary",
          )}
        />
      </button>

      <div
        className={cn(
          "absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-3 opacity-0 pointer-events-none",
        )}
      >
        <div className="relative">
          {/* Subtle triangle indicator */}
          <span className="absolute -top-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-l border-t border-border/80 bg-background" />

          <div className="relative w-[480px] rounded-2xl border border-border/80 bg-background/95 p-4 shadow-premium backdrop-blur-xl">
            <div className="mb-2.5 flex items-center justify-between border-b border-border/60 pb-2 px-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Artisan Collections
              </span>
              <Link
                to="/shop"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>Browse All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <ul className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/shop"
                    search={{ category: c.slug }}
                    onClick={() => setOpen(false)}
                    className="group/item flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-muted/70 hover:shadow-xs"
                  >
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-offwhite ring-1 ring-border/80">
                      <img
                        src={c.image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                      />
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-foreground group-hover/item:text-primary transition-colors">
                        {c.name}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        Handcrafted pieces
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Search Overlay                                                     */
/* ------------------------------------------------------------------ */

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => ref.current?.focus(), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-border/80 bg-background/98 backdrop-blur-xl shadow-premium"
    >
      <Container className="py-3 sm:py-5 px-3 sm:px-6">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const q = ref.current?.value.trim() ?? "";
            navigate({ to: "/shop", search: q ? { q } : {} });
            onClose();
          }}
          className="flex items-center gap-2 sm:gap-3.5"
        >
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <input
            ref={ref}
            name="q"
            placeholder="Search sofas, beds, dining tables..."
            aria-label="Search furniture products"
            className="h-10 sm:h-12 min-w-0 flex-1 bg-transparent text-sm sm:text-base md:text-lg font-medium outline-none placeholder:text-muted-foreground/70"
          />
          <button
            type="submit"
            className="h-9 sm:h-11 shrink-0 rounded-xl bg-primary px-3.5 sm:px-6 text-xs sm:text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:bg-brand-red-hover hover:shadow-lift active:scale-95"
          >
            <span className="hidden sm:inline">Search Collection</span>
            <span className="sm:hidden">Search</span>
          </button>
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-border/80 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </form>
      </Container>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cart Badge                                                         */
/* ------------------------------------------------------------------ */

function CartBadge({ count }: { count: number }) {
  return (
    <span
      className={cn(
        "absolute -right-1 -top-1 flex h-[18px] min-w-[18px] sm:h-[19px] sm:min-w-[19px] items-center justify-center rounded-full px-1 text-[9px] sm:text-[10px] font-bold leading-none shadow-xs transition-all duration-300",
        count > 0
          ? "bg-primary text-primary-foreground scale-100 ring-2 ring-background"
          : "bg-muted text-muted-foreground scale-90",
      )}
    >
      {count}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Site Header                                                        */
/* ------------------------------------------------------------------ */

export function SiteHeader() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = cartCount(useCart());
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lenis = useLenis();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawers on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setCatsOpen(false);
  }, [pathname]);

  // Escape key handler for drawer
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Lock body scroll and pause Lenis when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (menuOpen) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [menuOpen, lenis]);

  // Navbar shrink effect on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 25);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const iconBtn =
    "relative flex h-9.5 w-9.5 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/50 text-foreground/80 transition-all duration-300 hover:border-border hover:bg-muted hover:text-primary hover:shadow-xs active:scale-95";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        scrolled
          ? "border-border/90 bg-background/90 shadow-soft backdrop-blur-xl"
          : "border-border/60 bg-background/95 backdrop-blur-md",
      )}
    >
      <Container
        className={cn(
          "flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled ? "h-[58px] sm:h-[60px]" : "h-[68px] sm:h-[74px]",
        )}
      >
        {/* Mobile: Left Hamburger (balanced width with right icons for perfect center alignment) */}
        <div className="flex items-center lg:hidden w-[76px] sm:w-[88px]">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className={iconBtn}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Logo: Centered on mobile, left-aligned on desktop */}
        <div className="flex min-w-0 flex-1 justify-center lg:flex-initial lg:justify-start">
          <Logo scrolled={scrolled} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block" aria-label="Main navigation">
          <ul className="flex items-center gap-7 xl:gap-9">
            <li>
              <Link to="/" activeOptions={{ exact: true }} className={linkCls}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/shop" className={linkCls}>
                Shop
              </Link>
            </li>
            <CategoriesDropdown />
            <li>
              <Link to="/about" className={linkCls}>
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className={linkCls}>
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right Action Icons: Search & Cart */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 w-[76px] sm:w-[88px] lg:w-auto">
          <button
            type="button"
            aria-label="Search products"
            onClick={() => setSearchOpen((s) => !s)}
            className={iconBtn}
          >
            <Search className="h-4.5 w-4.5" />
          </button>
          <Link to="/cart" aria-label={`Cart with ${count} items`} className={iconBtn}>
            <ShoppingBag className="h-4.5 w-4.5" />
            <CartBadge count={count} />
          </Link>
        </div>
      </Container>

      {/* Search overlay with AnimatePresence */}
      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>

      {/* ---- Mobile slide-out drawer rendered in Portal to avoid header backdrop-filter containing block ---- */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {menuOpen && (
              <div
                className="fixed inset-0 z-50 lg:hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation drawer"
              >
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
                />

                {/* Drawer panel */}
                <motion.aside
                  data-lenis-prevent
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed inset-y-0 left-0 flex h-full h-dvh w-[86%] max-w-sm flex-col bg-background text-foreground shadow-premium border-r border-border/80 z-10"
                  style={{ backgroundColor: "var(--color-background, #fafaf9)" }}
                >
                  {/* Drawer header */}
                  <div className="flex h-[64px] sm:h-[74px] shrink-0 items-center justify-between border-b border-border/80 px-5 sm:px-6 bg-background">
                    <Logo />
                    <button
                      type="button"
                      aria-label="Close menu"
                      onClick={() => setMenuOpen(false)}
                      className={iconBtn}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Drawer search bar */}
                  <div className="shrink-0 border-b border-border/50 px-5 py-3 bg-muted/20">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const input = form.elements.namedItem("drawerSearch") as HTMLInputElement;
                        const q = input?.value.trim() ?? "";
                        navigate({ to: "/shop", search: q ? { q } : {} });
                        setMenuOpen(false);
                      }}
                      className="relative flex items-center"
                    >
                      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        name="drawerSearch"
                        placeholder="Search furniture collections..."
                        aria-label="Search catalog"
                        className="h-9.5 w-full rounded-xl border border-border/80 bg-background/90 pl-9 pr-3 text-xs sm:text-sm font-medium outline-none placeholder:text-muted-foreground/70 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                      />
                    </form>
                  </div>

                  {/* Drawer links */}
                  <nav
                    className="flex-1 min-h-0 overflow-y-auto px-5 py-4"
                    aria-label="Mobile navigation"
                  >
                    <Link
                      to="/"
                      activeOptions={{ exact: true }}
                      onClick={() => setMenuOpen(false)}
                      className="mobile-nav-link flex items-center justify-between border-b border-border/60 py-3.5 font-display text-lg font-semibold tracking-tight transition-colors hover:text-primary data-[status=active]:text-primary"
                    >
                      <span>Home</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
                    </Link>

                    <Link
                      to="/shop"
                      onClick={() => setMenuOpen(false)}
                      className="mobile-nav-link flex items-center justify-between border-b border-border/60 py-3.5 font-display text-lg font-semibold tracking-tight transition-colors hover:text-primary data-[status=active]:text-primary"
                    >
                      <span>Shop Catalog</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
                    </Link>

                    {/* Categories accordion */}
                    <button
                      type="button"
                      onClick={() => setCatsOpen((o) => !o)}
                      aria-expanded={catsOpen}
                      className="flex w-full items-center justify-between border-b border-border/60 py-3.5 font-display text-lg font-semibold tracking-tight transition-colors hover:text-primary"
                    >
                      <span>Categories</span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform duration-300",
                          catsOpen && "rotate-180 text-primary",
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        catsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <ul className="grid grid-cols-2 gap-2 border-b border-border/60 py-3">
                          {categories.map((c) => (
                            <li key={c.slug}>
                              <Link
                                to="/shop"
                                search={{ category: c.slug }}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 rounded-lg p-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                              >
                                <img
                                  src={c.image}
                                  alt=""
                                  className="h-8 w-8 shrink-0 rounded-md object-cover ring-1 ring-border/80"
                                />
                                <span className="truncate">{c.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Link
                      to="/cart"
                      onClick={() => setMenuOpen(false)}
                      className="mobile-nav-link flex items-center justify-between border-b border-border/60 py-3.5 font-display text-lg font-semibold tracking-tight transition-colors hover:text-primary data-[status=active]:text-primary"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShoppingBag className="h-4.5 w-4.5 text-primary" />
                        <span>Shopping Cart</span>
                      </div>
                      {count > 0 && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                          {count}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/about"
                      onClick={() => setMenuOpen(false)}
                      className="mobile-nav-link flex items-center justify-between border-b border-border/60 py-3.5 font-display text-lg font-semibold tracking-tight transition-colors hover:text-primary data-[status=active]:text-primary"
                    >
                      <span>About The Brand</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
                    </Link>

                    <Link
                      to="/contact"
                      onClick={() => setMenuOpen(false)}
                      className="mobile-nav-link flex items-center justify-between border-b border-border/60 py-3.5 font-display text-lg font-semibold tracking-tight transition-colors hover:text-primary data-[status=active]:text-primary"
                    >
                      <span>Contact & Showroom</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
                    </Link>
                  </nav>

                  {/* Drawer footer with safe-area spacing */}
                  <div className="shrink-0 border-t border-border/80 bg-muted/30 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Chennai Showroom
                    </p>
                    <a
                      href={`tel:${BRAND.phone}`}
                      className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      <Phone className="h-4 w-4 text-primary" /> +91 {BRAND.phone}
                    </a>
                    <p className="mt-1 text-xs text-muted-foreground truncate">{BRAND.address}</p>
                  </div>
                </motion.aside>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </header>
  );
}
