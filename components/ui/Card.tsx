import type { ReactNode } from "react";

export function Card({ children, className = "", as: Tag = "div" }: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside";
}) {
  return (
    <Tag className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] ${className}`}>
      {children}
    </Tag>
  );
}
