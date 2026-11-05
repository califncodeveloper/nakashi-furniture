import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/common/Button";
import { cart, useCart } from "@/lib/cart";
import { getAllProducts, getProductSlug } from "@/lib/productService";
import type { Product } from "@/types/product";
import { BRAND, formatPrice } from "@/constants/brand";
import {
  ArrowLeft,
  MessageCircle,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { UpiQrPayment } from "@/components/payment/UpiQrPayment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FadeIn, ScrollReveal } from "@/components/animations";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — The Nakashi Furnitures" },
      { name: "description", content: "Review your selected handcrafted furniture items." },
      { property: "og:title", content: "Your Cart — The Nakashi Furnitures" },
      { property: "og:description", content: "Review your selected furniture pieces." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const lines = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [, setIsLoading] = useState<boolean>(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    getAllProducts().then((products) => {
      if (isMounted) {
        setAllProducts(products);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const cartItems = lines
    .map((l) => {
      const product = allProducts.find((p) => p.id === l.id);
      return product ? { ...product, qty: l.qty } : null;
    })
    .filter(Boolean) as (Product & { qty: number })[];

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + (item.price || 0) * item.qty;
  }, 0);

  const totalItemsCount = lines.reduce((sum, l) => sum + l.qty, 0);

  const getWhatsAppCartUrl = () => {
    const phone = BRAND.phone.replace(/[^0-9]/g, "");
    const itemsList = cartItems
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.name}* (Qty: ${item.qty}) — ${item.price ? formatPrice(item.price * item.qty) : "Quote Needed"}`,
      )
      .join("\n");

    const message = [
      `Hello The Nakashi Furnitures,`,
      ``,
      `I would like to place an order for the following items:`,
      itemsList,
      ``,
      `*Total Cart Value: ${formatPrice(totalPrice)}*`,
      ``,
      `Please let me know payment modes, Chennai delivery schedule, and invoice details. Thank you!`,
    ].join("\n");

    return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="bg-background text-foreground pb-20">
      <section className="border-b border-border/80 bg-gradient-to-b from-muted/40 via-muted/20 to-background py-10 md:py-14">
        <Container>
          <FadeIn delay={0.1} direction="up">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-primary font-bold">Shopping Bag</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.2} direction="up">
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Your Furniture Selection
            </h1>
          </FadeIn>
          <FadeIn delay={0.3} direction="up">
            <p className="mt-2 text-sm text-muted-foreground">
              Review your pieces before completing your order or scheduling delivery with our
              Chennai workshop.
            </p>
          </FadeIn>
        </Container>
      </section>

      <Container className="pt-10">
        {lines.length === 0 ? (
          <ScrollReveal direction="up">
            <div className="my-10 rounded-3xl border border-dashed border-border p-14 text-center bg-card shadow-soft">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">
                Your shopping bag is empty
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                Discover our collection of handcrafted solid teakwood sofas, beds, dining sets, and
                cabinetry.
              </p>
              <div className="mt-7">
                <Link
                  to="/shop"
                  className={buttonVariants({ size: "lg", className: "shadow-soft" })}
                >
                  Explore Shop Collection
                </Link>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
            {/* CART ITEMS LIST */}
            <div className="lg:col-span-8">
              <div className="rounded-3xl border border-border/80 bg-card shadow-soft overflow-hidden">
                <div className="border-b border-border/80 bg-muted/30 px-6 py-4 flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Selected Pieces ({totalItemsCount})
                  </span>
                  <button
                    type="button"
                    onClick={() => cart.clear()}
                    className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <ul className="divide-y divide-border/60">
                  <AnimatePresence initial={false}>
                    {cartItems.map((item) => {
                      const slug = getProductSlug(item);
                      return (
                        <motion.li
                          key={item.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="flex flex-col sm:flex-row gap-5 p-6 items-start sm:items-center transition-colors hover:bg-muted/15"
                        >
                          <Link
                            to="/product/$slug"
                            params={{ slug }}
                            className="shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-offwhite"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-24 w-24 object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                              {item.category}
                            </span>
                            <Link
                              to="/product/$slug"
                              params={{ slug }}
                              className="block font-display text-base font-bold text-foreground hover:text-primary transition-colors truncate"
                            >
                              {item.name}
                            </Link>
                            {item.sku && (
                              <span className="text-[11px] font-mono text-muted-foreground">
                                SKU: {item.sku}
                              </span>
                            )}
                            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              <span className="font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
                                {item.price ? formatPrice(item.price * item.qty) : "Price on request"}
                              </span>
                              {item.price && item.qty > 1 && (
                                <span className="text-xs text-muted-foreground/80 font-normal">
                                  ({formatPrice(item.price)} each)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <div className="flex items-center rounded-xl border border-border/80 bg-background shadow-xs">
                              <button
                                type="button"
                                onClick={() => cart.setQty(item.id, item.qty - 1)}
                                className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => cart.setQty(item.id, item.qty + 1)}
                                className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => cart.remove(item.id)}
                              aria-label={`Remove ${item.name} from cart`}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-400 hover:text-primary hover:bg-muted/80 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground px-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-1.5 font-medium hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Continue Browsing
                </Link>
                <span>Need bespoke sizing? Talk to our Chennai workshop</span>
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="lg:col-span-4">
              <ScrollReveal direction="left" delay={0.1}>
                <div className="rounded-3xl border border-border/80 bg-card p-7 shadow-premium">
                  <h3 className="font-display text-xl font-bold text-foreground">Order Summary</h3>

                  <div className="mt-5 space-y-3.5 text-sm border-t border-border/80 pt-4">
                    <div className="flex justify-between items-baseline text-muted-foreground">
                      <span>Subtotal ({totalItemsCount} items)</span>
                      <span className="font-semibold text-foreground tracking-tight">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>White-Glove Delivery (Chennai)</span>
                      <span className="font-semibold text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>In-Room Setup & Placement</span>
                      <span className="font-semibold text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Taxes (GST 18%)</span>
                      <span className="text-muted-foreground">Included</span>
                    </div>

                    <div className="border-t border-border/80 pt-4 flex justify-between items-baseline text-base font-bold text-foreground">
                      <span>Estimated Total</span>
                      <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-primary">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="mt-7 space-y-3">
                    <button
                      type="button"
                      id="cart-pay-online-button"
                      onClick={() => setIsQrModalOpen(true)}
                      className={buttonVariants({
                        variant: "primary",
                        size: "lg",
                        className: "w-full gap-2 shadow-soft font-semibold",
                      })}
                    >
                      <QrCode className="h-4.5 w-4.5" /> Pay Online (Scan UPI QR)
                    </button>

                    <a
                      id="cart-whatsapp-button"
                      href={getWhatsAppCartUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({
                        variant: "primary",
                        size: "lg",
                        className:
                          "w-full gap-2 bg-[#25D366] text-white hover:bg-[#1ea851] shadow-soft font-semibold",
                      })}
                    >
                      <MessageCircle className="h-4.5 w-4.5" /> Order via WhatsApp
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = `tel:${BRAND.phone}`;
                      }}
                      className={buttonVariants({
                        variant: "outline",
                        size: "md",
                        className: "w-full gap-2",
                      })}
                    >
                      Call Workshop (+91 {BRAND.phone})
                    </button>

                    <div className="pt-1 text-center">
                      <Link
                        to="/pay-online"
                        search={{
                          amount: totalPrice,
                          order: `CART-${Date.now().toString().slice(-6)}`,
                          items: cartItems.map((i) => `${i.name} (x${i.qty})`).join(", "),
                        }}
                        className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                      >
                        <span>Prefer full-screen payment page? Open Pay Online →</span>
                      </Link>
                    </div>
                  </div>

                  <div className="mt-7 space-y-2.5 text-xs text-muted-foreground border-t border-border/80 pt-4">
                    <p className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary shrink-0" />
                      <span>Complimentary direct delivery across Chennai</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>5-Year Teakwood structural warranty included</span>
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        )}

        {/* PAY ONLINE MODAL WITH UPI QR CODE */}
        <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-8 sm:rounded-3xl border border-border/80 shadow-premium">
            <DialogHeader className="text-left mb-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <QrCode className="h-4 w-4" />
                </span>
                <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  Pay Online — UPI QR Code
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Scan with Google Pay, PhonePe, Paytm, or BHIM to pay {formatPrice(totalPrice)}{" "}
                directly to The Nakashi Furnitures.
              </DialogDescription>
            </DialogHeader>

            <UpiQrPayment
              amount={totalPrice}
              orderReference={`CART-${Date.now().toString().slice(-6)}`}
              itemsSummary={cartItems
                .map(
                  (i) =>
                    `• ${i.name} (x${i.qty}) - ${i.price ? formatPrice(i.price * i.qty) : "Custom"}`,
                )
                .join("\n")}
              className="mt-2"
            />
          </DialogContent>
        </Dialog>
      </Container>
    </div>
  );
}
