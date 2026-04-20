import * as React from "react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "T-Shirts",
  "Hoodies",
  "Mugs",
  "Posters",
  "Phone Cases",
  "Tote Bags",
  "Stickers",
  "Hats",
  "Accessories",
];

export const CategoryNav = React.memo(function CategoryNav() {
  const [active, setActive] = React.useState("All");
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = React.useState(false);
  const [showRightFade, setShowRightFade] = React.useState(true);

  const updateFades = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 4);
    setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    updateFades();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateFades, { passive: true });
    window.addEventListener("resize", updateFades);
    return () => {
      el.removeEventListener("scroll", updateFades);
      window.removeEventListener("resize", updateFades);
    };
  }, [updateFades]);

  return (
    <nav
      aria-label="Product categories"
      className="relative border-b border-border bg-card"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Left fade */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-card to-transparent z-10 transition-opacity duration-200",
            showLeftFade ? "opacity-100" : "opacity-0",
          )}
        />
        {/* Right fade */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent z-10 transition-opacity duration-200",
            showRightFade ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          ref={scrollerRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none py-3"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                aria-pressed={isActive}
                className={cn(
                  "relative shrink-0 px-4 h-9 rounded-full text-sm font-medium",
                  "transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-muted text-secondary hover:bg-primary-light hover:text-primary",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});
