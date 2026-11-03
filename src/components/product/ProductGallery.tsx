import React, { useState, useRef, useEffect } from "react";
import {
  Eye,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  frontImage: string;
  angle45Image?: string;
  productName: string;
  badge?: string;
  className?: string;
}

export function ProductGallery({
  frontImage,
  angle45Image,
  productName,
  badge,
  className,
}: ProductGalleryProps) {
  // 0 = Front-facing image, 1 = 45-degree angled image
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const [modalZoomScale, setModalZoomScale] = useState<number>(1);

  // Desktop hover zoom state
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const images = [
    {
      src: frontImage,
      label: "Front View",
      sublabel: "Straight elevation perspective",
      badge: "Front-Facing",
    },
    ...(angle45Image
      ? [
          {
            src: angle45Image,
            label: "45° Perspective",
            sublabel: "3D architectural angled view",
            badge: "45° Angled View",
          },
        ]
      : []),
  ];

  const currentImage = images[activeIndex] || images[0];

  // Mouse move handler for desktop hover-to-zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isZoomModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else if (e.key === "+" || e.key === "=") {
        setModalZoomScale((s) => Math.min(3, s + 0.5));
      } else if (e.key === "-") {
        setModalZoomScale((s) => Math.max(1, s - 0.5));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomModalOpen, images.length]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* PRIMARY IMAGE CONTAINER */}
      <div className="relative group">
        <div
          ref={imageContainerRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
          onClick={() => {
            setModalZoomScale(1);
            setIsZoomModalOpen(true);
          }}
          tabIndex={0}
          role="button"
          aria-label={`View enlarged ${currentImage.label} of ${productName}`}
          className={cn(
            "relative w-full aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5]",
            "overflow-hidden rounded-2xl border border-stone-200/80 bg-[#f8f7f4] dark:bg-stone-900/40",
            "cursor-crosshair shadow-xs transition-shadow duration-300 hover:shadow-md",
            "focus:outline-hidden focus:ring-2 focus:ring-primary/40",
          )}
        >
          {/* Subtle warm luxury backdrop illumination */}
          <div className="pointer-events-none absolute inset-0 bg-radial from-white/80 via-transparent to-stone-200/20" />

          {/* Main Display Image */}
          <img
            key={currentImage.src}
            src={currentImage.src}
            alt={`${productName} — ${currentImage.label}`}
            loading="eager"
            style={{
              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              transform: isHovering ? "scale(2.2)" : "scale(1)",
            }}
            className={cn(
              "h-full w-full object-cover object-center",
              "transition-transform duration-200 ease-out",
            )}
          />

          {/* Product Badge (e.g. Bestseller, New) */}
          {badge && (
            <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-brand-yellow px-3 py-1 text-xs font-semibold uppercase tracking-wider text-charcoal shadow-sm">
              <Sparkles className="h-3 w-3" /> {badge}
            </span>
          )}

          {/* View Angle Pill Badge */}
          <span className="absolute right-4 top-4 z-10 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-md border border-border/50">
            {currentImage.badge}
          </span>

          {/* Expand / Zoom action icon overlay button */}
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setModalZoomScale(1);
                setIsZoomModalOpen(true);
              }}
              aria-label="Open fullscreen zoom inspector"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md backdrop-blur-md transition-transform hover:scale-105 active:scale-95 hover:text-primary"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Desktop Hover Hint Pill */}
          <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-1.5 rounded-full bg-stone-900/70 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-xs transition-opacity duration-300 opacity-80 group-hover:opacity-100">
            <Eye className="h-3 w-3" />
            <span>Hover to zoom · Click to expand</span>
          </div>
        </div>
      </div>

      {/* THUMBNAIL NAVIGATION */}
      <div className="flex items-center gap-3">
        {images.map((img, idx) => {
          const isSelected = idx === activeIndex;
          return (
            <button
              key={img.label}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Switch to ${img.label}`}
              className={cn(
                "group relative flex flex-1 items-center gap-3 overflow-hidden rounded-xl border p-2 text-left transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-xs"
                  : "border-stone-200/90 bg-white hover:border-stone-400 dark:border-stone-800 dark:bg-stone-900",
              )}
            >
              {/* Thumbnail square image */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f8f7f4] border border-stone-200/60">
                <img
                  src={img.src}
                  alt={img.label}
                  className={cn(
                    "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
                    isSelected ? "scale-100" : "opacity-85",
                  )}
                />
              </div>

              {/* Text label */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "text-xs font-semibold tracking-wide",
                      isSelected ? "text-primary font-bold" : "text-foreground",
                    )}
                  >
                    {img.label}
                  </span>
                  {isSelected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                <p className="truncate text-[11px] text-muted-foreground">{img.sublabel}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* FULLSCREEN LUXURY ZOOM INSPECTOR LIGHTBOX */}
      <DialogPrimitive.Root open={isZoomModalOpen} onOpenChange={setIsZoomModalOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed inset-0 z-50 flex h-dvh w-screen flex-col overflow-hidden bg-stone-950/98 text-white focus:outline-none select-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
            <DialogPrimitive.Title className="sr-only">
              {productName} — High-Resolution Inspection
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Fullscreen detailed view for {productName} {currentImage.label}
            </DialogPrimitive.Description>

            {/* Top Bar Controls */}
            <div className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-8 bg-stone-950/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm sm:text-base font-medium text-white/90 truncate max-w-[200px] sm:max-w-md">
                  {productName}
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70 whitespace-nowrap">
                  {currentImage.badge} ({activeIndex + 1}/{images.length})
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                {/* Zoom Out */}
                <button
                  type="button"
                  onClick={() =>
                    setModalZoomScale((s) => Math.max(1, Number((s - 0.5).toFixed(1))))
                  }
                  disabled={modalZoomScale <= 1}
                  aria-label="Zoom out"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>

                {/* Zoom Level Indicator */}
                <span className="w-12 text-center text-xs font-mono text-white/80 select-none">
                  {Math.round(modalZoomScale * 100)}%
                </span>

                {/* Zoom In */}
                <button
                  type="button"
                  onClick={() =>
                    setModalZoomScale((s) => Math.min(3, Number((s + 0.5).toFixed(1))))
                  }
                  disabled={modalZoomScale >= 3}
                  aria-label="Zoom in"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>

                {/* Reset Zoom */}
                {modalZoomScale > 1 && (
                  <button
                    type="button"
                    onClick={() => setModalZoomScale(1)}
                    aria-label="Reset zoom"
                    className="hidden sm:flex h-9 px-3 items-center gap-1.5 rounded-lg bg-white/10 text-xs text-white transition hover:bg-white/20 active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>
                )}

                {/* Divider */}
                <div className="h-6 w-px bg-white/15 mx-1" />

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsZoomModalOpen(false)}
                  aria-label="Close fullscreen modal"
                  className="flex h-9 items-center gap-1.5 px-3 rounded-lg bg-white/15 text-white transition hover:bg-white/25 active:scale-95 cursor-pointer font-medium text-xs"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Close</span>
                  <kbd className="hidden md:inline rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/60">
                    ESC
                  </kbd>
                </button>
              </div>
            </div>

            {/* Centered High-Resolution Canvas */}
            <div className="relative flex flex-1 items-center justify-center overflow-auto p-4 md:p-8">
              <div
                onClick={() => {
                  setModalZoomScale((s) => (s === 1 ? 2 : 1));
                }}
                className={cn(
                  "relative max-h-full max-w-full transition-transform duration-300 ease-out",
                  modalZoomScale === 1 ? "cursor-zoom-in" : "cursor-zoom-out",
                )}
                style={{ transform: `scale(${modalZoomScale})` }}
                title={modalZoomScale === 1 ? "Click to zoom 2x" : "Click to reset zoom"}
              >
                <img
                  src={currentImage.src}
                  alt={`${productName} — ${currentImage.label}`}
                  className="max-h-[68vh] sm:max-h-[73vh] max-w-[90vw] rounded-xl object-contain shadow-2xl drop-shadow-2xl"
                  draggable={false}
                />
              </div>

              {/* Left / Right Angle Switchers in Modal */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                      setModalZoomScale(1);
                    }}
                    aria-label="Previous angle"
                    className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-stone-900/80 hover:bg-stone-800 text-white border border-white/20 backdrop-blur-md shadow-xl transition hover:scale-105 active:scale-95 cursor-pointer z-10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                      setModalZoomScale(1);
                    }}
                    aria-label="Next angle"
                    className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-stone-900/80 hover:bg-stone-800 text-white border border-white/20 backdrop-blur-md shadow-xl transition hover:scale-105 active:scale-95 cursor-pointer z-10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Interaction Tip (only displayed at 1x so it doesn't obstruct zoomed inspection) */}
              {modalZoomScale === 1 && (
                <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 rounded-full bg-stone-900/90 px-3.5 py-1 text-[11px] text-white/70 backdrop-blur-xs border border-white/10 shadow-lg">
                  <span>Click image to zoom 2x</span>
                  <span>•</span>
                  <span>Arrows to switch views</span>
                  <span>•</span>
                  <span>Esc to exit</span>
                </div>
              )}
            </div>

            {/* Bottom Thumbnail Strip in Modal */}
            {images.length > 1 && (
              <div className="flex h-20 shrink-0 items-center justify-center gap-3 border-t border-white/10 px-6 bg-stone-950/80 backdrop-blur-md">
                {images.map((img, i) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => {
                      setActiveIndex(i);
                      setModalZoomScale(1);
                    }}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border p-1.5 text-left transition cursor-pointer",
                      i === activeIndex
                        ? "border-primary bg-primary/20 ring-1 ring-primary shadow-sm"
                        : "border-white/15 bg-white/5 opacity-60 hover:opacity-100 hover:border-white/30",
                    )}
                  >
                    <img
                      src={img.src}
                      alt={img.label}
                      className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg object-cover bg-stone-900"
                    />
                    <div className="pr-2">
                      <p className="text-xs font-semibold text-white">{img.label}</p>
                      <p className="text-[10px] text-white/60">{img.badge}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
