import { cn } from "@/lib/utils";

/**
 * Small inline wordmark. Two stacked leaves + the name "Willow".
 * Pure SVG so it ships with the bundle (no remote font icons).
 */
export function WillowMark({
  className,
  withName = true,
}: {
  className?: string;
  withName?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-5 text-foreground"
      >
        <path
          d="M4 18c4.5 0 8-3.5 8-8 0-2.2-1.4-3.5-3.5-3.5C5.6 6.5 4 9.5 4 13.5V18z"
          fill="currentColor"
          fillOpacity="0.85"
        />
        <path
          d="M20 6c-4.5 0-8 3.5-8 8 0 2.2 1.4 3.5 3.5 3.5 2.9 0 4.5-3 4.5-7V6z"
          fill="currentColor"
          fillOpacity="0.5"
        />
      </svg>
      {withName && (
        <span className="text-base font-medium tracking-tight">Willow</span>
      )}
    </span>
  );
}
