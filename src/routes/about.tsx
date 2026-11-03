import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Hammer,
  Heart,
  Layers,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sofa,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/common/Button";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  FadeIn,
  ParallaxSection,
} from "@/components/animations";
import { BRAND } from "@/constants/brand";
import { WHATSAPP_URL } from "@/constants/site";
import hero from "@/assets/hero-living.jpg";
import inspBedroom from "@/assets/insp-bedroom.jpg";
import inspDining from "@/assets/insp-dining.jpg";
import inspReading from "@/assets/insp-reading.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — The Nakashi Furnitures" },
      {
        name: "description",
        content:
          "Discover The Nakashi Furnitures. Dedicated to exceptional furniture, thoughtful design, enduring quality, deep comfort, master craftsmanship, and customer satisfaction.",
      },
      { property: "og:title", content: "About Us — The Nakashi Furnitures" },
      {
        property: "og:description",
        content:
          "Thoughtfully designed, enduringly crafted furniture for modern living spaces in Pallikaranai, Chennai.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AboutPage,
});

/* ------------------------------------------------------------------ */
/*  Core Pillars Data                                                 */
/* ------------------------------------------------------------------ */

const PILLARS = [
  {
    icon: Sofa,
    title: "Furniture",
    tagline: "Purpose-Built for Real Homes",
    description:
      "We design and curate complete furniture solutions that adapt gracefully to everyday life — from plush living room seating and tranquil bedroom suites to inviting dining sets and smart storage units.",
  },
  {
    icon: Compass,
    title: "Design",
    tagline: "Balanced Form & Proportions",
    description:
      "Our design philosophy harmonizes classic elegance with clean, modern lines. Every curve, profile, and silhouette is proportioned to bring architectural serenity and aesthetic warmth to your interior.",
  },
  {
    icon: ShieldCheck,
    title: "Quality",
    tagline: "Enduring Materials & Integrity",
    description:
      "Furniture should be built to last generations. We prioritize seasoned solid hardwoods, reinforced internal structures, resilient upholstery fabrics, and high-performance cushioning that withstand years of daily use.",
  },
  {
    icon: Heart,
    title: "Comfort",
    tagline: "Ergonomics You Feel Daily",
    description:
      "True luxury begins with how a piece feels. We meticulously calibrate seat depth, backrest angles, lumbar support, and cushion density to ensure unmatched relaxation for every member of your family.",
  },
  {
    icon: Hammer,
    title: "Craftsmanship",
    tagline: "Meticulous Attention to Detail",
    description:
      "From precision edge-stitching and tailored tufting to hand-finished wood surfaces and clean mortise joinery, our artisan approach celebrates the fine details that distinguish exceptional furniture.",
  },
  {
    icon: CheckCircle2,
    title: "Customer Satisfaction",
    tagline: "Personal Attention at Every Step",
    description:
      "We treat every home with individual care. Led by owner M. Zubair, our showroom team offers honest guidance on dimensions, fabrics, styling, and safe delivery to ensure complete peace of mind.",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Craftsmanship Highlights                                           */
/* ------------------------------------------------------------------ */

const CRAFT_HIGHLIGHTS = [
  {
    step: "01",
    title: "Solid Frame Construction",
    description:
      "Every sofa and bed structure begins with durable, termite-treated hardwoods and heavy-duty joint bracing for unwavering stability.",
  },
  {
    step: "02",
    title: "High-Resilience Cushioning",
    description:
      "Multi-layered foam cores paired with soft poly-wrap maintain their shape and supportive spring without sagging over time.",
  },
  {
    step: "03",
    title: "Hand-Tailored Upholstery",
    description:
      "Rich velvets, durable linens, and premium upholstery fabrics are cut and stitched with master precision, reinforced piping, and flawless seams.",
  },
  {
    step: "04",
    title: "Artisanal Wood Finishes",
    description:
      "Exposed wooden bases, dining tops, and chair legs undergo careful sanding and hand-rubbed protective staining to enhance natural grain beauty.",
  },
] as const;

function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Editorial Hero Section */}
      <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-muted/40 via-background to-background py-16 md:py-24">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute left-1/3 top-0 h-[450px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/6 blur-3xl" />

        <Container className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <FadeIn delay={0.1} direction="up">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary shadow-xs backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                <span>The Nakashi Furnitures · Pallikaranai, Chennai</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.25} direction="up">
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
                Thoughtfully Designed. <br />
                <em className="font-serif italic font-normal text-primary">
                  Enduringly Crafted.
                </em>{" "}
                <br />
                Made for Living.
              </h1>
            </FadeIn>

            <FadeIn delay={0.4} direction="up">
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                At The Nakashi Furnitures, we believe home is your sanctuary. Our purpose is to
                furnish living spaces with pieces that seamlessly combine sophisticated aesthetic
                appeal, deep ergonomic comfort, and enduring structural quality.
              </p>
            </FadeIn>

            <FadeIn delay={0.55} direction="up">
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/shop"
                  className={buttonVariants({ size: "lg", className: "shadow-lift gap-2.5" })}
                >
                  <span>Explore Our Collection</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/contact" className={buttonVariants({ variant: "outline", size: "lg" })}>
                  <span>Visit Showroom & Contact</span>
                </Link>
              </div>
            </FadeIn>

            {/* Quick trust metrics */}
            <FadeIn delay={0.65} direction="up">
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border/80 pt-6">
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">Direct</p>
                  <p className="text-xs text-muted-foreground">Showroom Guidance</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">Custom</p>
                  <p className="text-xs text-muted-foreground">Tailored Sizing</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">Chennai</p>
                  <p className="text-xs text-muted-foreground">Doorstep Delivery</p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Visual Showcase */}
          <FadeIn delay={0.3} direction="none">
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-premium group">
                <img
                  src={hero}
                  alt="Living room interior styled by The Nakashi Furnitures"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-104"
                  width={1200}
                  height={900}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="inline-block rounded-full bg-brand-yellow px-3 py-1 text-[11px] font-bold text-charcoal shadow-soft">
                    Showroom Atelier
                  </span>
                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    Pallikaranai Showroom
                  </p>
                  <p className="text-xs text-white/80">No. 99, Velachery Main Road, Chennai</p>
                </div>
              </div>

              {/* Floating decorative badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border/80 bg-background/95 p-4 shadow-premium backdrop-blur-md sm:flex items-center gap-3.5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sofa className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Living & Dining
                  </p>
                  <p className="font-display text-sm font-bold text-foreground">
                    Artisanal Hardwood Furniture
                  </p>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* The 6 Core Pillars Section */}
      <section className="section-y bg-background">
        <Container>
          <ScrollReveal direction="up">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                Our Core Philosophy
              </div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                What Defines The Nakashi Experience
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                We focus our daily work on six core values that guide every piece we create and
                present to our patrons.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer
            stagger={0.09}
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <StaggerItem key={pillar.title} direction="up">
                  <motion.div
                    whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
                    className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-7 shadow-soft transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/40 hover:shadow-card-hover h-full"
                  >
                    <div>
                      <div className="mb-5 inline-flex h-13 w-13 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground shadow-xs">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {pillar.tagline}
                      </span>
                      <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
                        {pillar.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {pillar.description}
                      </p>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </Container>
      </section>

      {/* Anatomy of Craftsmanship */}
      <section className="section-y border-y border-border/80 bg-gradient-to-b from-muted/40 via-muted/20 to-background">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <ScrollReveal direction="left">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  <span>Craftsmanship & Build</span>
                </div>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  Built from the Inside Out
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  We take immense pride in what goes beneath the surface. Beautiful fabric is only
                  as good as the foundation it rests upon. Every Nakashi design undergoes meticulous
                  assembly to deliver balance, resilience, and tactile pleasure.
                </p>

                <div className="mt-10 space-y-6">
                  {CRAFT_HIGHLIGHTS.map((item, idx) => (
                    <ScrollReveal key={item.step} direction="up" delay={idx * 0.1}>
                      <div className="flex items-start gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 font-display text-sm font-bold text-primary shadow-xs">
                          {item.step}
                        </span>
                        <div>
                          <h4 className="font-display text-base font-bold text-foreground">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Visual Mosaic with Parallax */}
            <ScrollReveal direction="right">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-border/80 shadow-soft">
                    <img
                      src={inspBedroom}
                      alt="Nakashi crafted bedroom furniture"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
                    <p className="font-display text-base font-bold text-foreground">
                      Designed for Rest
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Bed frames engineered for noise-free stability and deep slumber.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
                    <p className="font-display text-base font-bold text-foreground">
                      Social Dining
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Solid dining tables hand-finished to resist stains and bring families
                      together.
                    </p>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-border/80 shadow-soft">
                    <img
                      src={inspDining}
                      alt="Nakashi crafted dining table set"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* Customer Satisfaction & Showroom Experience */}
      <section className="section-y bg-background">
        <Container>
          <ScrollReveal direction="up" duration={0.7}>
            <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-premium md:p-12 lg:p-16">
              <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                    Personal Atelier Service
                  </span>
                  <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                    Dedicated Customer Care & Direct Owner Guidance
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    At The Nakashi Furnitures, you aren&apos;t just browsing a catalog — you have
                    direct access to our store proprietor, <strong>M. Zubair</strong>, and our
                    expert showroom team. Whether you need custom upholstery selections, room
                    measurement advice, or specific finishes to match your home&apos;s décor, we are
                    here to assist with genuine care.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/40 p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Direct Consultation</h4>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Speak directly with our team on WhatsApp or phone for immediate answers.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/40 p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Safe Chennai Delivery</h4>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Handled with extreme care right to your room of choice.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({ size: "lg", className: "gap-2 shadow-lift" })}
                    >
                      <MessageCircle className="h-4 w-4" /> Message M. Zubair on WhatsApp
                    </a>
                    <a
                      href={`tel:${BRAND.phone}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "lg",
                        className: "gap-2",
                      })}
                    >
                      <Phone className="h-4 w-4" /> Call {BRAND.phone}
                    </a>
                  </div>
                </div>

                {/* Showroom preview card */}
                <div className="rounded-2xl border border-border/80 bg-muted/40 p-6 sm:p-8 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Visit Us In Person
                      </span>
                      <p className="font-display text-lg font-bold text-foreground">
                        Pallikaranai Showroom
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                    <p className="font-bold text-foreground">{BRAND.name}</p>
                    <p>{BRAND.address}</p>
                    <p>
                      Proprietor:{" "}
                      <span className="font-semibold text-foreground">{BRAND.owner}</span>
                    </p>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-xl border border-border/80 shadow-xs">
                    <img
                      src={inspReading}
                      alt="Comfortable seating nook in showroom"
                      className="aspect-video w-full object-cover"
                    />
                  </div>

                  <div className="mt-6">
                    <Link
                      to="/contact"
                      className={buttonVariants({
                        variant: "luxury",
                        size: "md",
                        className: "w-full justify-center gap-2",
                      })}
                    >
                      <span>View Directions & Store Hours</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </div>
  );
}
