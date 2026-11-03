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
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 rounded-full border-2 border-border" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
        <span className="absolute inset-[38%] rounded-full bg-brand-yellow" />
      </div>
      <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
    </div>
  );
}
