import type { HTMLAttributes } from "react";

type CardSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  padding?: "sm" | "md" | "lg";
};

const padMap = { sm: "p-5", md: "p-5", lg: "p-6" };

export function CardSurface({
  interactive = false,
  padding = "md",
  className = "",
  children,
  ...rest
}: CardSurfaceProps) {
  return (
    <div
      {...rest}
      className={`rounded-2xl bg-card border border-border/60 ${padMap[padding]} shadow-[var(--shadow-card)] ${
        interactive ? "hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}