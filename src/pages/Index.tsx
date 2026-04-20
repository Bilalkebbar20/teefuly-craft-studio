import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

const Index = () => {
  const products = MOCK_PRODUCTS.slice(0, 8);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <header className="mb-8 sm:mb-12">
          <p className="text-sm font-medium tracking-wide text-primary uppercase mb-2">
            Phase 1 Preview
          </p>
          <h1 className="font-display text-2xl sm:text-3xl text-foreground">
            ProductCard — Pixel-perfect grid
          </h1>
          <p className="mt-2 text-base text-text-secondary max-w-2xl">
            Hover a card to see image scale, quick-view slide-up, and elevation. Tap the heart to
            see the favorite pop animation. Tab through with the keyboard — every interactive
            element is reachable.
          </p>
        </header>

        <section aria-label="Product preview grid">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p, i) => (
              <div
                key={p.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <ProductCard
                  product={p}
                  priority={i < 4}
                  onQuickView={() => {}}
                  onToggleFavorite={() => {}}
                />
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Loading state preview" className="mt-12">
          <h2 className="font-display text-xl text-foreground mb-4">
            Loading state
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Index;
