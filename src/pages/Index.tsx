import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { useProducts } from "@/hooks/use-catalog";

const GRID_SIZE = 8;

const Index = () => {
  const { data, isLoading, isError } = useProducts({ limit: GRID_SIZE, sort: "relevance" });
  const products = data?.products ?? [];
  const showcase = products.filter((p) => p.is_featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartCount={2} />
      <CategoryNav />

      <main className="flex-1">
        <Hero showcase={showcase} />
        <TrustBar />

        <section
          aria-labelledby="phase1-grid"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
        >
          <div className="flex items-end justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <p className="text-sm font-medium tracking-wide text-primary uppercase mb-1">
                Live from the Edge
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

          {isError && (
            <p className="text-sm text-text-secondary mb-6">
              The catalog is momentarily unavailable. Please try again shortly.
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {isLoading &&
              Array.from({ length: GRID_SIZE }).map((_, i) => (
                <div key={`skeleton-${i}`} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <ProductCardSkeleton />
                </div>
              ))}

            {!isLoading &&
              products.map((p, i) => (
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
      </main>
    </div>
  );
};

export default Index;