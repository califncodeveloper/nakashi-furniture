import { useState } from "react";
import { BRAND } from "@/constants/brand";
import { X } from "lucide-react";

interface FloatingWhatsAppProps {
  greeting?: string;
  className?: string;
}

export function FloatingWhatsApp({
  greeting = "Hello The Nakashi Furnitures, I am visiting your website and would like to know more about your handcrafted teakwood furniture.",
  className = "",
}: FloatingWhatsAppProps) {
  const [showTooltip, setShowTooltip] = useState<boolean>(true);

  const cleanPhone = BRAND.phone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(greeting)}`;

  return (
    <aside
      aria-label="WhatsApp quick chat"
      className={`fixed bottom-4 right-4 z-40 flex items-center gap-2.5 sm:bottom-6 sm:right-6 select-none print:hidden ${className}`}
    >
      {/* Friendly floating callout bubble (dismissible) */}
      {showTooltip && (
        <div className="relative hidden md:flex items-center gap-2 rounded-2xl border border-stone-200/90 bg-white/95 px-3.5 py-2 text-xs text-charcoal shadow-lg backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95 dark:text-stone-100 animate-in fade-in slide-in-from-right-3 duration-500">
          <div className="flex flex-col">
            <span className="font-semibold text-[11px] text-[#128C7E] dark:text-[#25D366] flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#25D366] animate-pulse inline-block" />
              Online Workshop
            </span>
            <span className="text-[12px] font-medium leading-tight">Chat with us on WhatsApp</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTooltip(false);
            }}
            aria-label="Dismiss chat tip"
            className="ml-1 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition"
          >
            <X className="h-3 w-3" />
          </button>

          {/* Speech bubble pointer arrow pointing right towards the WhatsApp button */}
          <span
            className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rotate-45 border-r border-t border-stone-200/90 bg-white dark:border-stone-800 dark:bg-stone-900"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with The Nakashi Furnitures on WhatsApp (+91 9043278618)"
        className="group relative flex h-[50px] w-[50px] sm:h-[58px] sm:w-[58px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/35 transition-all duration-300 hover:scale-110 hover:bg-[#20ba59] hover:shadow-2xl hover:shadow-[#25D366]/50 active:scale-95 focus:outline-hidden focus-visible:ring-4 focus-visible:ring-[#25D366]/40 cursor-pointer"
      >
        {/* Subtle breathing glow ring animation */}
        <span
          className="pointer-events-none absolute -inset-1 rounded-full bg-[#25D366] opacity-30 blur-xs transition-opacity duration-500 group-hover:opacity-60 animate-pulse"
          aria-hidden="true"
        />

        {/* Live Green Online Badge Indicator */}
        <span
          className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-white dark:ring-stone-950"
          aria-hidden="true"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </span>

        {/* Official WhatsApp Silhouette SVG */}
        <svg
          className="h-7 w-7 sm:h-8 sm:w-8 fill-current transition-transform duration-300 group-hover:rotate-6"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </aside>
  );
}
