import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeefulyBadge } from "@/components/ui/badge-teefuly";
import { StarRating } from "@/components/ui/star-rating";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { formatPrice } from "@/lib/types/product";

const HERO_BG = {
  background:
    "radial-gradient(ellipse at 20% 50%, hsl(22 100% 96%) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, hsl(210 100% 95%) 0%, transparent 60%), hsl(var(--background))",
};

export const Hero = React.memo(function Hero() {
  const showcase = React.useMemo(
    () => MOCK_PRODUCTS.filter((p) => p.is_featured).slice(0, 3),
    [],
  );

  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden"
      style={HERO_BG}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center min-h-[420px] lg:min-h-[480px]">
          {/* Left — copy */}
          <div className="lg:col-span-7 max-w-xl">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary-light rounded-full px-3 py-1 mb-5">
              <span aria-hidden="true">🎨</span> Unique designs, made just for you
            </p>
            <h1
              id="hero-title"
              className="font-display text-3xl sm:text-4xl lg:text-4xl text-foreground leading-[1.05]"
            >
              Discover Art That
              <br />
              <span className="text-primary">Tells Your Story</span>
            </h1>
            <p className="mt-5 text-md text-text-secondary max-w-lg leading-relaxed">
              Shop thousands of unique designs on premium quality products, created by
              independent artists worldwide.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button size="lg" className="gap-2">
                Shop Now <ArrowRight size={16} aria-hidden="true" />
              </Button>
              <Button size="lg" variant="ghost">
                Explore Trending
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <StarRating value={4.9} showCount={false} size={14} />
                <span className="font-medium text-foreground">4.9/5</span>
              </span>
              <span aria-hidden="true" className="text-text-muted">·</span>
              <span>12,000+ happy customers</span>
              <span aria-hidden="true" className="text-text-muted">·</span>
              <span>Free returns</span>
              <span aria-hidden="true" className="text-text-muted">·</span>
              <span>Ships in 3–5 days</span>
            </div>
          </div>

          {/* Right — floating product stack */}
          <div className="lg:col-span-5 relative h-[340px] sm:h-[420px] hidden md:block">
            {/* Floating chips */}
            <div
              aria-hidden="true"
              className="absolute top-6 left-2 z-30 animate-float"
              style={{ animationDelay: "0.5s" }}
            >
              <TeefulyBadge variant="bestseller" className="shadow-md">
                ★ Bestseller
              </TeefulyBadge>
            </div>
            <div
              aria-hidden="true"
              className="absolute bottom-12 right-4 z-30 animate-float"
              style={{ animationDelay: "1.2s" }}
            >
              <TeefulyBadge variant="freeShipping" className="shadow-md">
                Free shipping
              </TeefulyBadge>
            </div>
            <div
              aria-hidden="true"
              className="absolute top-1/2 -left-2 z-30 animate-float hidden lg:flex gap-1 bg-card rounded-full px-2 py-1 shadow-md"
              style={{ animationDelay: "0.8s" }}
            >
              {["#F1641E", "#2E3A59", "#00B67A", "#E099F5"].map((c) => (
                <span
                  key={c}
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Cards */}
            {showcase.map((p, i) => {
              const positions = [
                { rotate: -6, x: 0, y: 30, z: 10, delay: "0s" },
                { rotate: 4, x: 90, y: 0, z: 20, delay: "0.4s" },
                { rotate: -2, x: 180, y: 60, z: 15, delay: "0.8s" },
              ];
              const pos = positions[i];
              return (
                <div
                  key={p.id}
                  className="absolute top-0 left-0 w-[200px] sm:w-[220px] rounded-md bg-card shadow-lg overflow-hidden animate-float"
                  style={{
                    transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotate}deg)`,
                    zIndex: pos.z,
                    animationDelay: pos.delay,
                  }}
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img
                      src={p.images[0]}
                      alt=""
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs text-text-secondary truncate">{p.shop.name}</p>
                    <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                    <p className="font-mono text-sm font-medium text-foreground mt-0.5">
                      {formatPrice(p.price_cents)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});
