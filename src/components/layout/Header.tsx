import * as React from "react";
import { Search, ShoppingBag, Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  cartCount?: number;
}

export const Header = React.memo(function Header({ cartCount = 0 }: HeaderProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-card/95 backdrop-blur-sm",
        "transition-shadow duration-200",
        scrolled ? "shadow-sm border-b border-border" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-6 h-16 sm:h-[72px]">
          {/* Logo */}
          <a
            href="/"
            aria-label="Teefuly home"
            className="flex items-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
            >
              {/* Tee SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7l4-3h8l4 3-3 3-2-1v12H9V9L7 10 4 7z" />
              </svg>
            </span>
            <span className="font-display text-lg sm:text-xl text-foreground">Teefuly</span>
          </a>

          {/* Search — hidden on mobile, icon shown instead */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <label className="relative w-full">
              <span className="sr-only">Search Teefuly</span>
              <Search
                size={18}
                aria-hidden="true"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
              <input
                type="search"
                placeholder="Search for anything..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={cn(
                  "w-full h-11 pl-11 pr-4 rounded-full bg-muted text-base text-foreground placeholder:text-text-muted",
                  "border border-transparent transition-all duration-200",
                  "focus:outline-none focus:bg-card focus:border-primary",
                  searchFocused && "shadow-md",
                )}
              />
            </label>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              className="md:hidden"
            >
              <Search size={20} aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Favorites"
              className="hidden sm:inline-flex"
            >
              <Heart size={20} aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Cart, ${cartCount} items`}
              className="relative"
            >
              <ShoppingBag size={20} aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
            <a
              href="/signin"
              className="hidden sm:inline-block text-sm font-medium text-foreground hover:text-primary transition-colors px-2"
            >
              Sign in
            </a>
            <Button size="sm" className="hidden sm:inline-flex">
              Get started
            </Button>
            <Button variant="ghost" size="icon" aria-label="Menu" className="sm:hidden">
              <Menu size={20} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
});
