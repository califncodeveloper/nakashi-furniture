import { cn } from "@/lib/utils";

interface LoadingProps {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Loading({ label = "Loading", fullScreen, className }: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12",
        fullScreen && "min-h-screen",
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="h-14 w-14 rounded-2xl border-2 border-primary/20 border-t-primary animate-spin" />
        <img
          src="/nakashi-icon.png"
          alt="The Nakashi Furnitures"
          width={36}
          height={36}
          className="absolute h-9 w-9 rounded-xl object-contain animate-pulse"
        />
      </div>
      <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
    </div>
  );
}
