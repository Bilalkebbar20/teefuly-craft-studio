import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

const Index = () => {
  const products = MOCK_PRODUCTS.slice(0, 8);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartCount={2} />
      <CategoryNav />

      <main className="flex-1">
        <Hero />
        <TrustBar />

        <section
          aria-labelledby="phase1-grid"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
        >
          <div className="flex items-end justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <p className="text-sm font-medium tracking-wide text-primary uppercase mb-1">
                Phase 1 + 2 Preview
              </p>
              <h2
                id="phase1-grid"
                className="font-display text-xl sm:text-2xl text-foreground"
              >
                Handpicked for You
              </h2>
            </div>
            <a
              href="/shop"
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors hidden sm:inline-block"
            >
              See all →
            </a>
          </div>

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

          <div className="mt-12">
            <h3 className="font-display text-lg text-foreground mb-4">Loading state</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
