import * as React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TeefulyBadge } from "@/components/ui/badge-teefuly";
import { StarRating } from "@/components/ui/star-rating";
import { formatPrice, type Product } from "@/lib/types/product";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onToggleFavorite?: (product: Product, next: boolean) => void;
  initiallyFavorited?: boolean;
  priority?: boolean;
  className?: string;
}

const ProductCardImpl = React.forwardRef<HTMLElement, ProductCardProps>(
  function ProductCard(
    { product, onQuickView, onToggleFavorite, initiallyFavorited = false, priority = false, className },
    ref,
  ) {
    const [favorited, setFavorited] = React.useState(initiallyFavorited);
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [popKey, setPopKey] = React.useState(0);
    const titleId = React.useId();

    const handleFavorite = React.useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !favorited;
        setFavorited(next);
        setPopKey((k) => k + 1);
        onToggleFavorite?.(product, next);
      },
      [favorited, onToggleFavorite, product],
    );

    const handleQuickView = React.useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onQuickView?.(product);
      },
      [onQuickView, product],
    );

    const onSale = product.compare_price && product.compare_price > product.price_cents;

    return (
      <article
        ref={ref}
        aria-labelledby={titleId}
        className={cn(
          "group relative flex flex-col rounded-md bg-card border border-transparent",
          "transition-all duration-250 ease-out",
          "hover:border-border-hover hover:shadow-md",
          "focus-within:border-border-hover focus-within:shadow-md",
          className,
        )}
      >
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
          {/* Shimmer placeholder until image loads */}
          {!imageLoaded && (
            <div
              className="absolute inset-0 shimmer"
              aria-hidden="true"
            />
          )}

          <img
            src={product.images[0]}
            alt={product.title}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            onLoad={() => setImageLoaded(true)}
            className={cn(
              "h-full w-full object-cover will-change-transform",
              "transition-transform duration-[400ms] ease-out",
              "group-hover:scale-[1.04] group-focus-within:scale-[1.04]",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
          />

          {/* Category / status badge top-left */}
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 pointer-events-none">
            {product.badges.includes("bestseller") && (
              <TeefulyBadge variant="bestseller">Bestseller</TeefulyBadge>
            )}
            {product.badges.includes("new") && (
              <TeefulyBadge variant="new">New</TeefulyBadge>
            )}
            {onSale && <TeefulyBadge variant="sale">Sale</TeefulyBadge>}
          </div>

          {/* Wishlist top-right */}
          <button
            type="button"
            onClick={handleFavorite}
            aria-label={favorited ? `Remove ${product.title} from favorites` : `Add ${product.title} to favorites`}
            aria-pressed={favorited}
            className={cn(
              "absolute top-2.5 right-2.5 inline-flex h-9 w-9 items-center justify-center",
              "rounded-full bg-card/95 backdrop-blur-sm shadow-sm",
              "transition-colors duration-200",
              "hover:bg-card",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            )}
          >
            <Heart
              key={popKey}
              size={18}
              className={cn(
                "transition-colors duration-200",
                favorited ? "fill-primary text-primary animate-heart-pop" : "text-secondary",
              )}
              aria-hidden="true"
            />
          </button>

          {/* Quick View overlay — slides up on hover/focus */}
          {onQuickView && (
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 px-3 pb-3 pt-6",
                "bg-gradient-to-t from-black/35 via-black/10 to-transparent",
                "translate-y-full opacity-0",
                "transition-all duration-250 ease-out",
                "group-hover:translate-y-0 group-hover:opacity-100",
                "group-focus-within:translate-y-0 group-focus-within:opacity-100",
              )}
            >
              <Button
                size="sm"
                variant="default"
                onClick={handleQuickView}
                aria-label={`Quick view ${product.title}`}
                className="w-full bg-card text-foreground hover:bg-card hover:text-primary hover:scale-[1.01]"
              >
                Quick View
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5 p-3">
          {/* Shop row */}
          <div className="flex items-center gap-1.5 min-w-0">
            <img
              src={product.shop.avatar}
              alt={product.shop.name}
              loading="lazy"
              decoding="async"
              className="h-4 w-4 rounded-full object-cover shrink-0"
            />
            <span className="text-sm text-text-secondary truncate">
              {product.shop.name}
            </span>
          </div>

          {/* Title — covers card via ::after */}
          <h3
            id={titleId}
            className="text-base font-medium text-foreground leading-snug line-clamp-2"
          >
            <a
              href={`/product/${product.slug}`}
              className={cn(
                "outline-none",
                "after:absolute after:inset-0 after:rounded-md",
                "focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2",
              )}
            >
              {product.title}
            </a>
          </h3>

          {/* Rating */}
          <StarRating value={product.rating_avg} count={product.rating_count} size={13} />

          {/* Price row */}
          <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
            <span className="font-mono text-md font-medium text-foreground tabular-nums">
              {formatPrice(product.price_cents)}
            </span>
            {onSale && product.compare_price && (
              <span className="font-mono text-sm text-text-muted line-through tabular-nums">
                {formatPrice(product.compare_price)}
              </span>
            )}
            {product.free_shipping && (
              <TeefulyBadge variant="freeShipping" className="ml-auto relative z-10">
                Free shipping
              </TeefulyBadge>
            )}
          </div>
        </div>
      </article>
    );
  },
);

export const ProductCard = React.memo(ProductCardImpl);

/* ---------- Skeleton ---------- */

export function ProductCardSkeleton() {
  return (
    <div
      className="flex flex-col rounded-md bg-card border border-transparent"
      aria-hidden="true"
    >
      <div className="aspect-square rounded-md shimmer" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3 w-1/3 rounded-sm shimmer" />
        <div className="h-4 w-5/6 rounded-sm shimmer" />
        <div className="h-4 w-2/3 rounded-sm shimmer" />
        <div className="h-3 w-1/2 rounded-sm shimmer" />
        <div className="h-5 w-1/3 rounded-sm shimmer mt-1" />
      </div>
    </div>
  );
}
