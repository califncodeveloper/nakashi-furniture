import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { BRAND, formatPrice } from "@/constants/brand";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UpiQrPaymentProps {
  amount?: number;
  orderReference?: string;
  itemsSummary?: string;
  className?: string;
  onSuccessNotice?: () => void;
}

export function UpiQrPayment({
  amount,
  orderReference,
  itemsSummary,
  className,
}: UpiQrPaymentProps) {
  const [customAmount, setCustomAmount] = useState<string>(
    amount && amount > 0 ? String(amount) : "",
  );
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const activeAmount = customAmount ? parseFloat(customAmount) : amount || 0;

  const note = orderReference
    ? `Order ${orderReference} - The Nakashi Furnitures`
    : "Nakashi Furniture Order";

  // Standard UPI URI format
  const upiUri = `upi://pay?pa=${encodeURIComponent(BRAND.upiId)}&pn=${encodeURIComponent(
    BRAND.upiName,
  )}${activeAmount > 0 ? `&am=${activeAmount}` : ""}&cu=INR&tn=${encodeURIComponent(note)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(BRAND.upiId);
    setCopiedUpi(true);
    toast.success("UPI ID copied to clipboard!", {
      description: BRAND.upiId,
    });
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(BRAND.upiNumber);
    setCopiedPhone(true);
    toast.success("Mobile / GPay number copied!", {
      description: BRAND.upiNumber,
    });
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const getWhatsAppConfirmationUrl = () => {
    const cleanPhone = BRAND.phone.replace(/[^0-9]/g, "");
    const amountText = activeAmount > 0 ? formatPrice(activeAmount) : "payment";
    const refText = orderReference ? ` for Order Reference: *${orderReference}*` : "";
    const itemsText = itemsSummary ? `\n\n*Ordered Items:*\n${itemsSummary}` : "";

    const message = [
      `Hello The Nakashi Furnitures,`,
      ``,
      `I have initiated / completed an online UPI payment of *${amountText}*${refText}.`,
      itemsText,
      ``,
      `Please find attached my payment confirmation screenshot. Kindly confirm my order and share the delivery schedule.`,
      ``,
      `Customer Name: `,
      `Delivery Address in Chennai: `,
    ].join("\n");

    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleDownloadQr = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 50, 50, 500, 500);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `nakashi-upi-qr-${activeAmount || "payment"}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success("QR Code downloaded successfully!");
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-8 items-start", className)}>
      {/* LEFT COLUMN: QR CODE CARD */}
      <div className="lg:col-span-5 flex flex-col items-center">
        <div className="w-full max-w-sm rounded-2xl border-2 border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-lg text-center relative overflow-hidden">
          {/* Subtle gold luxury accent ribbon */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-yellow via-primary to-brand-yellow" />

          {/* Brand Logo */}
          <div className="flex justify-center mb-3">
            <img
              src="/nakashi-logo.png"
              alt="The Nakashi Furnitures"
              width={252}
              height={150}
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <QrCode className="h-4 w-4" />
            </span>
            <span className="font-display font-bold text-sm tracking-wide text-foreground">
              Scan & Pay with Any UPI
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground mb-4">
            Supports Google Pay, PhonePe, Paytm, BHIM, Cred, and all Indian banking UPI apps.
          </p>

          {/* QR Code Container */}
          <div
            ref={qrRef}
            className="mx-auto flex aspect-square w-64 max-w-full items-center justify-center rounded-2xl border border-stone-200 bg-white p-4 shadow-inner dark:border-stone-800 dark:bg-white"
          >
            <QRCodeSVG
              value={upiUri}
              size={220}
              level="H"
              includeMargin={false}
              className="h-full w-full object-contain"
            />
          </div>

          {/* Amount Badge */}
          <div className="mt-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 p-3 border border-stone-200/80 dark:border-stone-700/80">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Payment Amount
            </p>
            {amount && amount > 0 ? (
              <p className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-primary mt-1 leading-none">
                {formatPrice(activeAmount)}
              </p>
            ) : (
              <div className="mt-1 flex items-center justify-center gap-1">
                <span className="text-sm font-semibold text-foreground">₹</span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-32 rounded-lg border border-border bg-background px-2.5 py-1 text-center font-display text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">
              Account: <strong className="text-foreground">{BRAND.upiName}</strong>
            </p>
          </div>

          {/* Action buttons under QR */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleDownloadQr}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted active:scale-95"
            >
              <Download className="h-3.5 w-3.5" /> Download QR
            </button>

            {/* Mobile UPI Deep link */}
            <a
              href={upiUri}
              className="inline-flex sm:hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-brand-red-hover active:scale-95"
            >
              <Smartphone className="h-3.5 w-3.5" /> Open in UPI App
            </a>
          </div>
        </div>

        {/* Accepted Payment Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-sm text-center">
          {["Google Pay", "PhonePe", "Paytm", "BHIM UPI", "Net Banking"].map((app) => (
            <span
              key={app}
              className="rounded-md border border-border/70 bg-stone-100/80 dark:bg-stone-800/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {app}
            </span>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: PAYMENT DETAILS & INSTRUCTIONS */}
      <div className="lg:col-span-7 space-y-5">
        {/* UPI Details Box */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-xs">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">
            Direct UPI & Account Details
          </h3>

          <div className="space-y-3">
            {/* UPI ID */}
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-stone-50/80 dark:bg-stone-800/40 p-3.5">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Official UPI ID / VPA
                </p>
                <p className="font-mono text-sm font-bold text-foreground mt-0.5">{BRAND.upiId}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="flex items-center gap-1 rounded-lg bg-background border border-border px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs hover:bg-muted active:scale-95 transition"
              >
                {copiedUpi ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile / GPay Number */}
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-stone-50/80 dark:bg-stone-800/40 p-3.5">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  GPay / PhonePe Mobile Number
                </p>
                <p className="font-mono text-sm font-bold text-foreground mt-0.5">
                  +91 {BRAND.upiNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="flex items-center gap-1 rounded-lg bg-background border border-border px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs hover:bg-muted active:scale-95 transition"
              >
                {copiedPhone ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Payee Name */}
            <div className="rounded-xl border border-border/80 bg-stone-50/80 dark:bg-stone-800/40 p-3.5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Verified Payee
              </p>
              <p className="text-sm font-medium text-foreground mt-0.5">
                {BRAND.upiName} ({BRAND.owner}) · Pallikaranai, Chennai
              </p>
            </div>
          </div>
        </div>

        {/* 3 Simple Steps */}
        <div className="rounded-2xl border border-border bg-[#faf9f6] dark:bg-stone-900/40 p-6 shadow-xs">
          <h4 className="font-display text-base font-semibold text-foreground mb-4">
            How It Works (3 Easy Steps)
          </h4>

          <ol className="space-y-3.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[11px]">
                1
              </span>
              <div>
                <strong className="text-foreground font-medium block">
                  Scan QR code or copy the UPI ID
                </strong>
                <span>
                  Open Google Pay, PhonePe, Paytm, or your bank app and scan the code above.
                </span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[11px]">
                2
              </span>
              <div>
                <strong className="text-foreground font-medium block">
                  Enter the exact amount and confirm
                </strong>
                <span>
                  Complete payment in your app for{" "}
                  <strong className="text-foreground">
                    {activeAmount > 0 ? formatPrice(activeAmount) : "the required order amount"}
                  </strong>
                  .
                </span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[11px]">
                3
              </span>
              <div>
                <strong className="text-foreground font-medium block">
                  Share screenshot on WhatsApp for instant confirmation
                </strong>
                <span>
                  Tap the button below to send your payment screenshot and delivery address. Our
                  workshop team will immediately confirm your order and book white-glove delivery!
                </span>
              </div>
            </li>
          </ol>

          {/* WhatsApp Confirmation CTA Button */}
          <div className="mt-6 pt-4 border-t border-border">
            <a
              href={getWhatsAppConfirmationUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] text-white font-semibold text-sm transition hover:bg-[#1ea851] shadow-md active:scale-[0.99]"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Share Payment Screenshot on WhatsApp</span>
              <ExternalLink className="h-4 w-4 opacity-80" />
            </a>

            <p className="mt-2.5 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Direct workshop verified · Instant invoice & receipt on WhatsApp</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
