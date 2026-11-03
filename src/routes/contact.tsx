import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/common/Button";
import { ScrollReveal, StaggerContainer, StaggerItem, FadeIn } from "@/components/animations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BRAND } from "@/constants/brand";
import { WHATSAPP_URL } from "@/constants/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us & FAQ — The Nakashi Furnitures" },
      {
        name: "description",
        content: `Contact The Nakashi Furnitures at No. 99, Velachery Main Road, Pallikaranai, Chennai. Owner: M. Zubair, Phone: ${BRAND.phone}, Email: ${BRAND.email}. Find FAQs on ordering, delivery, and payment.`,
      },
      { property: "og:title", content: "Contact Us & FAQ — The Nakashi Furnitures" },
      {
        property: "og:description",
        content: `Connect directly with owner M. Zubair at The Nakashi Furnitures, Pallikaranai, Chennai. Call, email, or chat on WhatsApp.`,
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ContactPage,
});

/* ------------------------------------------------------------------ */
/*  Verified Google Maps Directions URL                               */
/* ------------------------------------------------------------------ */

const MAPS_SEARCH_QUERY =
  "The Nakashi Furnitures, No. 99, Velachery Main Road, Pallikaranai, Chennai 600100";
const GOOGLE_MAPS_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  MAPS_SEARCH_QUERY,
)}`;
const GOOGLE_MAPS_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(
  "No. 99, Velachery Main Road, Pallikaranai, Chennai 600100",
)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

/* ------------------------------------------------------------------ */
/*  FAQ Data                                                          */
/* ------------------------------------------------------------------ */

const FAQS = [
  {
    id: "order",
    question: "How to place an order?",
    answer:
      "You can place an order directly by contacting us via WhatsApp (+91 9043278618), calling our showroom, or visiting us in person at Velachery Main Road, Pallikaranai. Browse our collection on this website, note the items or custom dimensions you desire, and reach out to our team to confirm specifications, finishes, and order details.",
  },
  {
    id: "enquire",
    question: "How to enquire about a product?",
    answer:
      "You can enquire about any piece by filling out the WhatsApp enquiry form on this page, clicking 'Enquire on WhatsApp' on any product card across the website, calling us directly at 9043278618, or emailing nakashi123@gmail.com with your query or reference photos.",
  },
  {
    id: "availability",
    question: "How to confirm product availability?",
    answer:
      "Our showroom inventory and workshop availability are updated continuously. To check whether a specific item is in stock for prompt dispatch or will be made to order, please send a message on WhatsApp or call 9043278618 with the product title or link.",
  },
  {
    id: "delivery",
    question: "How to check delivery charges?",
    answer:
      "Delivery charges depend on your delivery address (distance from our Pallikaranai showroom within Chennai or surrounding areas), floor level, and the dimensions of the furniture items. Share your location and desired pieces with us on WhatsApp or call to receive an accurate delivery quote.",
  },
  {
    id: "warranty",
    question: "How to know warranty information?",
    answer:
      "Warranty terms vary according to the specific furniture category, structural frame material, and mechanism. Please reach out to Mr. M. Zubair or our showroom team with the specific product you are considering, and we will share the exact warranty details for that piece.",
  },
  {
    id: "payment",
    question: "What payment options are available?",
    answer:
      "We accept convenient payment methods including UPI (Google Pay, PhonePe, Paytm, BHIM), direct bank transfer (IMPS/NEFT), debit/credit cards, and cash payments at our Pallikaranai showroom. Payment terms and scheduling will be communicated during order confirmation.",
  },
] as const;

function ContactPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-muted/40 via-background to-background py-14 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn delay={0.1} direction="up">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span>We Are Here to Assist You</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.2} direction="up">
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Get in Touch with <br />
                <em className="font-serif italic font-normal text-primary">
                  The Nakashi Furnitures
                </em>
              </h1>
            </FadeIn>
            <FadeIn delay={0.3} direction="up">
              <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Have questions about our furniture, showroom displays, custom sizing, or delivery in
                Chennai? Connect directly with owner <strong>M. Zubair</strong> and our team.
              </p>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Primary Contact Cards */}
      <section className="section-y bg-background">
        <Container>
          <StaggerContainer stagger={0.08} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Phone Card */}
            <StaggerItem direction="up">
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-7 shadow-soft transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/40 hover:shadow-card-hover h-full"
              >
                <div>
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
                    <Phone className="h-6 w-6" />
                  </div>
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Direct Line
                  </span>
                  <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                    Call Showroom
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Speak directly with our team for quick inquiries and stock status.
                  </p>
                  <p className="mt-3 font-display text-lg font-bold text-foreground">
                    +91 {BRAND.phone}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60">
                  <a
                    href={`tel:${BRAND.phone}`}
                    className={buttonVariants({
                      size: "md",
                      className: "w-full gap-2",
                    })}
                  >
                    <Phone className="h-4 w-4" /> Click to Call
                  </a>
                </div>
              </motion.div>
            </StaggerItem>

            {/* WhatsApp Card */}
            <StaggerItem direction="up">
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
                className="flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] p-7 shadow-soft transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-emerald-500/60 hover:shadow-card-hover h-full"
              >
                <div>
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 shadow-xs">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
                    Instant Messaging
                  </span>
                  <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                    WhatsApp Chat
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Share photos, request catalogs, or get quick custom quotes directly.
                  </p>
                  <p className="mt-3 font-display text-lg font-bold text-foreground">
                    +91 {BRAND.phone}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-emerald-500/20">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({
                      size: "md",
                      className:
                        "w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white shadow-soft",
                    })}
                  >
                    <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                  </a>
                </div>
              </motion.div>
            </StaggerItem>

            {/* Email Card */}
            <StaggerItem direction="up">
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-7 shadow-soft transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/40 hover:shadow-card-hover h-full"
              >
                <div>
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
                    <Mail className="h-6 w-6" />
                  </div>
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Written Inquiries
                  </span>
                  <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                    Email Support
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Send detailed project plans, floor plans, or bulk interior inquiries.
                  </p>
                  <p className="mt-3 break-all font-display text-sm font-semibold text-foreground">
                    {BRAND.email}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60">
                  <a
                    href={`mailto:${BRAND.email}?subject=Enquiry%20-%20The%20Nakashi%20Furnitures`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "md",
                      className: "w-full gap-2",
                    })}
                  >
                    <Mail className="h-4 w-4" /> Send Email
                  </a>
                </div>
              </motion.div>
            </StaggerItem>

            {/* Address & Directions Card */}
            <StaggerItem direction="up">
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-7 shadow-soft transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/40 hover:shadow-card-hover h-full"
              >
                <div>
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Showroom
                  </span>
                  <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                    Pallikaranai
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {BRAND.address}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Owner: <span className="font-semibold text-foreground">{BRAND.owner}</span>
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60">
                  <a
                    href={GOOGLE_MAPS_DIRECTIONS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({
                      variant: "outline",
                      size: "md",
                      className: "w-full gap-2",
                    })}
                  >
                    <Navigation className="h-4 w-4" /> Get Directions
                  </a>
                </div>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </Container>
      </section>

      {/* Contact Form & Location Interactive Grid */}
      <section className="section-y border-y border-border/80 bg-gradient-to-b from-muted/30 to-background">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Frontend-only WhatsApp Enquiry Form */}
            <div className="lg:col-span-7">
              <ScrollReveal direction="left">
                <FrontendContactForm />
              </ScrollReveal>
            </div>

            {/* Showroom Details & Map */}
            <div className="space-y-6 lg:col-span-5">
              <ScrollReveal direction="right">
                <div className="rounded-3xl border border-border/80 bg-card p-7 shadow-soft md:p-8">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground">
                        Showroom Location
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        The Nakashi Furnitures · Pallikaranai
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 rounded-2xl bg-muted/50 p-5 text-sm border border-border/60">
                    <p className="font-bold text-foreground text-base">{BRAND.name}</p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Proprietor:</strong> {BRAND.owner}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Address:</strong> {BRAND.address}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Phone:</strong> +91 {BRAND.phone}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Email:</strong> {BRAND.email}
                    </p>
                  </div>

                  <div className="mt-6">
                    <a
                      href={GOOGLE_MAPS_DIRECTIONS_URL}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({
                        variant: "primary",
                        size: "md",
                        className: "w-full gap-2",
                      })}
                    >
                      <Navigation className="h-4 w-4" /> Open in Google Maps
                      <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                    </a>
                  </div>

                  {/* Embedded Interactive Map */}
                  <div className="mt-6 overflow-hidden rounded-2xl border border-border/80 shadow-inner">
                    <iframe
                      title="The Nakashi Furnitures Location Map"
                      src={GOOGLE_MAPS_EMBED_URL}
                      width="100%"
                      height="240"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section-y bg-background scroll-mt-20">
        <Container>
          <ScrollReveal direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                <HelpCircle className="h-3.5 w-3.5 text-primary" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Everything You Need to Know
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Clear, transparent answers about ordering, availability, delivery, and payments.
              </p>
            </div>
          </ScrollReveal>

          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {FAQS.map((faq, idx) => (
                <ScrollReveal key={faq.id} direction="up" delay={idx * 0.05}>
                  <AccordionItem
                    value={faq.id}
                    className="rounded-2xl border border-border/80 bg-card px-6 py-2 shadow-soft transition-all duration-300 data-[state=open]:border-primary/40 data-[state=open]:shadow-card-hover"
                  >
                    <AccordionTrigger className="text-left font-display text-base font-semibold text-foreground hover:no-underline md:text-lg">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground md:text-base pt-1 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </ScrollReveal>
              ))}
            </Accordion>

            {/* Direct inquiry banner below FAQ */}
            <ScrollReveal direction="up" delay={0.3}>
              <div className="mt-12 rounded-3xl border border-border/80 bg-muted/40 p-8 text-center sm:p-10 shadow-soft">
                <h4 className="font-display text-xl font-bold text-foreground">
                  Have another question not answered above?
                </h4>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  Mr. M. Zubair and our team are available on WhatsApp to answer your specific
                  requirements.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3.5">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({ size: "md", className: "gap-2 shadow-soft" })}
                  >
                    <MessageCircle className="h-4 w-4" /> Message on WhatsApp
                  </a>
                  <a
                    href={`tel:${BRAND.phone}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "md",
                      className: "gap-2",
                    })}
                  >
                    <Phone className="h-4 w-4" /> Call {BRAND.phone}
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Frontend-Only Contact Form Component                              */
/* ------------------------------------------------------------------ */

function FrontendContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [enquiryType, setEnquiryType] = useState("Product Enquiry");
  const [product, setProduct] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState("");

  const constructWhatsAppText = () => {
    const lines = [
      "Hello Nakashi Furnitures, I would like to make an enquiry:",
      "",
      `*Name:* ${name.trim() || "[Not provided]"}`,
      phone.trim() ? `*Phone:* ${phone.trim()}` : null,
      `*Enquiry Topic:* ${enquiryType}`,
      product.trim() ? `*Product / Style:* ${product.trim()}` : null,
      "",
      `*Message:*`,
      message.trim() || "[General Inquiry]",
    ].filter(Boolean);

    return lines.join("\n");
  };

  const formattedMessage = constructWhatsAppText();

  const handleOpenWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setValidationError("Please enter your name.");
      return;
    }
    if (!message.trim()) {
      setValidationError("Please enter a short message or question.");
      return;
    }

    setValidationError("");
    const text = constructWhatsAppText();
    const url = `https://wa.me/91${BRAND.phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopy = () => {
    const text = constructWhatsAppText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-7 shadow-premium md:p-10">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 shadow-xs">
          <Send className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Enquire via WhatsApp
          </h2>
          <p className="text-xs text-muted-foreground">
            Direct frontend inquiry — pre-fills a message to chat with M. Zubair
          </p>
        </div>
      </div>

      <form onSubmit={handleOpenWhatsApp} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Your Name <span className="text-primary">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (validationError) setValidationError("");
            }}
            placeholder="e.g. Ramesh Kumar"
            className="mt-1.5 w-full rounded-xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contact-phone"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Contact Phone (Optional)
            </label>
            <input
              id="contact-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="mt-1.5 w-full rounded-xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            />
          </div>

          <div>
            <label
              htmlFor="contact-topic"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Enquiry Topic
            </label>
            <select
              id="contact-topic"
              value={enquiryType}
              onChange={(e) => setEnquiryType(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            >
              <option value="Product Enquiry">Product Enquiry</option>
              <option value="Product Availability">Product Availability</option>
              <option value="Custom Sizing & Fabric">Custom Sizing & Fabric</option>
              <option value="Delivery Charges & Schedule">Delivery Charges & Schedule</option>
              <option value="Showroom Visit">Showroom Visit Appointment</option>
              <option value="General Question">General Question</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="contact-product"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Product of Interest (Optional)
          </label>
          <input
            id="contact-product"
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="e.g. Chesterfield Velvet Sofa, Solid Wood Dining Table"
            className="mt-1.5 w-full rounded-xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
          />
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Your Message / Requirements <span className="text-primary">*</span>
          </label>
          <textarea
            id="contact-message"
            required
            rows={4}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (validationError) setValidationError("");
            }}
            placeholder="Tell us what you're looking for, dimensions, preferred colors, or questions..."
            className="mt-1.5 w-full rounded-xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
          />
        </div>

        {validationError && (
          <p className="text-xs font-medium text-destructive">{validationError}</p>
        )}

        {/* Live Preview */}
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-[10.5px]">
              WhatsApp Message Preview
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs font-semibold"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy text</span>
                </>
              )}
            </button>
          </div>
          <pre className="mt-2.5 whitespace-pre-wrap rounded-xl bg-background/90 p-3.5 font-mono text-xs text-muted-foreground border border-border/60">
            {formattedMessage}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row pt-2">
          <button
            type="submit"
            className={buttonVariants({
              size: "lg",
              className:
                "flex-1 gap-2 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white shadow-soft",
            })}
          >
            <MessageCircle className="h-4.5 w-4.5" /> Open in WhatsApp
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "gap-2",
            })}
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Message"}
          </button>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground pt-1">
          🔒 <strong>Frontend-only guarantee:</strong> Submitting this form does not send your data
          to any external tracking server. It directly compiles your message and opens WhatsApp to
          chat with store proprietor M. Zubair.
        </p>
      </form>
    </div>
  );
}
