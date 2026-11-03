import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/types/product";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to="/shop"
      search={{ category: category.slug }}
      className="group relative block overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/40 hover:shadow-card-hover hover:-translate-y-1.5"
      aria-label={`Shop ${category.name}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-offwhite">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          width={800}
          height={1000}
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108"
        />

        {/* Ambient vignette and bottom shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent transition-opacity duration-300" />

        {/* Corner hover glow */}
        <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Text and arrow container positioned at the bottom of the image */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between text-white">
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-yellow drop-shadow-xs">
              Collection
            </span>
            <h3 className="font-display text-lg font-bold tracking-tight sm:text-xl text-white group-hover:text-brand-yellow transition-colors duration-300">
              {category.name}
            </h3>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-all duration-300 group-hover:bg-brand-yellow group-hover:text-charcoal group-hover:scale-110 shadow-soft">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
