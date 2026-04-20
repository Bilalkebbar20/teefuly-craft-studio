import * as React from "react";
import { Truck, RefreshCw, Palette, Star } from "lucide-react";

const ITEMS = [
  { icon: Truck, label: "Free Shipping over $35" },
  { icon: RefreshCw, label: "Easy 30-day Returns" },
  { icon: Palette, label: "100% Original Designs" },
  { icon: Star, label: "50,000+ Happy Customers" },
];

export const TrustBar = React.memo(function TrustBar() {
  return (
    <section
      aria-label="Why shop with Teefuly"
      className="border-y border-border bg-card"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {ITEMS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 text-sm text-secondary"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="font-medium">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
});
