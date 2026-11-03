import { createFileRoute, Link } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { UpiQrPayment } from "@/components/payment/UpiQrPayment";
import { BRAND } from "@/constants/brand";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";

type PayOnlineSearch = {
  amount?: number | undefined;
  order?: string | undefined;
  items?: string | undefined;
};

export const Route = createFileRoute("/pay-online")({
  validateSearch: (s: Record<string, unknown>): PayOnlineSearch => ({
    amount:
      typeof s["amount"] === "number"
        ? (s["amount"] as number)
        : typeof s["amount"] === "string" && !isNaN(Number(s["amount"]))
          ? Number(s["amount"])
          : undefined,
    order: typeof s["order"] === "string" ? (s["order"] as string) : undefined,
    items: typeof s["items"] === "string" ? (s["items"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pay Online — Official UPI QR Payment | The Nakashi Furnitures" },
      {
        name: "description",
        content:
          "Pay online securely via UPI QR Code, Google Pay, PhonePe, or Paytm for your furniture orders from The Nakashi Furnitures, Chennai.",
      },
    ],
  }),
  component: PayOnlinePage,
});

function PayOnlinePage() {
  const { amount, order, items } = Route.useSearch();

  return (
    <article className="min-h-screen bg-background pb-20 pt-6">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Link to="/" className="transition hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/cart" className="transition hover:text-foreground">
            Cart
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">Pay Online</span>
        </nav>

        {/* Page Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-yellow/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-charcoal">
            <Sparkles className="h-3.5 w-3.5" /> Instant UPI Payment
          </span>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Pay Online via QR Code
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Scan our official workshop QR code using any UPI app (Google Pay, PhonePe, Paytm, or
            BHIM) to make a fast, secure payment for your bespoke furniture order.
          </p>
        </div>

        {/* Live UPI QR & Payment Box */}
        <div className="max-w-4xl mx-auto">
          <UpiQrPayment amount={amount} orderReference={order} itemsSummary={items} />
        </div>

        {/* Workshop Guarantee & Help Banner */}
        <div className="mt-16 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-10">
          <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-stone-50/60 dark:bg-stone-900/40 p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">100% Verified Account</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Payments go directly to The Nakashi Furnitures registered business account.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-stone-50/60 dark:bg-stone-900/40 p-4">
            <Store className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">Chennai Workshop</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Visit our Pallikaranai showroom anytime to see your pieces in crafting.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-stone-50/60 dark:bg-stone-900/40 p-4">
            <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">Payment Support</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Need help? Call our workshop desk directly at +91 {BRAND.phone}.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </article>
  );
}
