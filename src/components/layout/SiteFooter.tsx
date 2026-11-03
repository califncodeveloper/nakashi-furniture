import { Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone, Sparkles, Shield, HeartHandshake } from "lucide-react";
import { BRAND } from "@/constants/brand";
import { categories } from "@/constants/catalog";
import { BRAND_DESCRIPTION, NAV_LINKS, WHATSAPP_URL } from "@/constants/site";
import { Container } from "./Container";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/animations";

/* ------------------------------------------------------------------ */
/*  Shared                                                             */
/* ------------------------------------------------------------------ */

const headingCls =
  "mb-5 font-display text-sm font-semibold uppercase tracking-[0.22em] text-brand-yellow/90 flex items-center gap-2";
const linkCls =
  "block py-1.5 text-sm text-burgundy-foreground/80 transition-all duration-300 hover:text-brand-yellow hover:translate-x-1";

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

export function SiteFooter() {
  return (
    <footer className="relative bg-gradient-to-b from-burgundy via-[oklch(0.24_0.06_350)] to-charcoal text-burgundy-foreground overflow-hidden">
      {/* Decorative top border with gold accent */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-brand-yellow/60 to-transparent" />

      {/* Trust banner inside footer */}
      <div className="border-b border-white/10 bg-black/15 py-8">
        <Container>
          <StaggerContainer stagger={0.1} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <StaggerItem direction="up">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-yellow/15 text-brand-yellow">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold tracking-wide text-white">
                    Artisanal Craftsmanship
                  </p>
                  <p className="text-xs text-burgundy-foreground/70">
                    Solid Grade-A hardwoods with heirloom joinery
                  </p>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem direction="up">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-yellow/15 text-brand-yellow">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold tracking-wide text-white">
                    5-Year Structural Warranty
                  </p>
                  <p className="text-xs text-burgundy-foreground/70">
                    Peace of mind for your home's centerpiece
                  </p>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem direction="up">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-yellow/15 text-brand-yellow">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold tracking-wide text-white">
                    Direct Owner Guidance
                  </p>
                  <p className="text-xs text-burgundy-foreground/70">
                    Personalized assistance from M. Zubair
                  </p>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </Container>
      </div>

      {/* Main footer grid */}
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr]">
        {/* Brand column */}
        <ScrollReveal direction="up" delay={0.1}>
          <div>
            <Link to="/" className="group inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellow text-charcoal shadow-soft font-display text-xl font-bold">
                N
              </div>
              <div>
                <span className="font-display text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-brand-yellow">
                  THE NAKASHI
                </span>
                <span className="block text-[10px] tracking-[0.3em] uppercase text-brand-yellow/80">
                  Furnitures · Chennai
                </span>
              </div>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-burgundy-foreground/80">
              {BRAND_DESCRIPTION}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-brand-yellow/90">
                Pallikaranai Showroom
              </span>
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-brand-yellow/90">
                Custom Sizing
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Quick Links */}
        <ScrollReveal direction="up" delay={0.2}>
          <div>
            <p className={headingCls}>Quick Links</p>
            <ul className="space-y-1">
              {NAV_LINKS.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className={linkCls}>
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/cart" className={linkCls}>
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/pay-online" className={linkCls}>
                  Pay Online (UPI QR)
                </Link>
              </li>
            </ul>
          </div>
        </ScrollReveal>

        {/* Product Categories */}
        <ScrollReveal direction="up" delay={0.3}>
          <div>
            <p className={headingCls}>Collections</p>
            <ul className="space-y-1">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to="/shop" search={{ category: c.slug }} className={linkCls}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        {/* Contact Information */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="space-y-4 text-sm">
            <p className={headingCls}>Contact & Visit</p>

            <p className="flex items-start gap-3 text-burgundy-foreground/85">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-brand-yellow" />
              <span className="leading-relaxed">{BRAND.address}</span>
            </p>

            <a
              href={`tel:${BRAND.phone}`}
              className="flex items-center gap-3 text-burgundy-foreground/85 transition-all duration-200 hover:text-brand-yellow hover:translate-x-1"
            >
              <Phone className="h-4 w-4 shrink-0 text-brand-yellow" />
              <span>+91 {BRAND.phone}</span>
            </a>

            <a
              href={`mailto:${BRAND.email}`}
              className="flex items-center gap-3 text-burgundy-foreground/85 transition-all duration-200 hover:text-brand-yellow hover:translate-x-1"
            >
              <Mail className="h-4 w-4 shrink-0 text-brand-yellow" />
              <span>{BRAND.email}</span>
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 text-brand-yellow transition-all duration-300 hover:bg-white/20 hover:shadow-soft"
            >
              <MessageCircle className="h-4.5 w-4.5 shrink-0" />
              <span className="font-semibold text-xs tracking-wide">
                Direct WhatsApp with M. Zubair
              </span>
            </a>
          </div>
        </ScrollReveal>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-black/25">
        <Container className="flex flex-col gap-3 py-6 text-xs text-burgundy-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} The Nakashi Furnitures. All rights reserved.</span>
          <span className="text-burgundy-foreground/80 font-medium">
            Proprietor: {BRAND.owner} · Pallikaranai, Chennai
          </span>
        </Container>
      </div>
    </footer>
  );
}
