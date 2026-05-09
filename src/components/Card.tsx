import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

export function Card({ children, style }: CardProps) {
  return (
    <div
      style={{
        background: "var(--color-background-primary, #fff)",
        border: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
        borderRadius: 12,
        padding: "1rem 1.25rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
