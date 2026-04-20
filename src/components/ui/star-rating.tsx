import * as React from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  count?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
  showCount?: boolean;
}

/**
 * Accessible star rating with half-star support.
 * Renders 5 SVG stars; each star uses a per-star linear gradient
 * to fill 0-100% with the accent color.
 */
export const StarRating = React.memo(function StarRating({
  value,
  count,
  size = 14,
  interactive = false,
  onChange,
  className,
  showCount = true,
}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, value));
  const gradientIdBase = React.useId();

  const renderStar = (index: number) => {
    const fill = Math.max(0, Math.min(1, clamped - index)) * 100;
    const gradientId = `${gradientIdBase}-${index}`;

    const star = (
      <svg
        key={index}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
            <stop offset={`${fill}%`} stopColor="hsl(var(--accent))" />
            <stop offset={`${fill}%`} stopColor="hsl(var(--border))" />
          </linearGradient>
        </defs>
        <path
          d="M12 2.5l2.92 6.32 6.58.78-4.9 4.55 1.34 6.85L12 17.77l-6.04 3.23 1.34-6.85L2.4 9.6l6.58-.78L12 2.5z"
          fill={`url(#${gradientId})`}
        />
      </svg>
    );

    if (!interactive) return star;
    return (
      <button
        key={index}
        type="button"
        onClick={() => onChange?.(index + 1)}
        className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        aria-label={`Rate ${index + 1} out of 5`}
      >
        {star}
      </button>
    );
  };

  return (
    <div
      className={cn("inline-flex items-center gap-1.5", className)}
      role="img"
      aria-label={`Rated ${clamped.toFixed(1)} out of 5${count ? `, ${count} reviews` : ""}`}
    >
      <span className="inline-flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map(renderStar)}
      </span>
      {showCount && (
        <span className="text-xs text-text-secondary tabular-nums">
          {clamped.toFixed(1)}
          {typeof count === "number" && (
            <span className="text-text-muted"> ({count.toLocaleString()})</span>
          )}
        </span>
      )}
    </div>
  );
});
