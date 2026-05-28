import type { ReactNode } from "react";

export function PageShell({ children, title, className = "" }: {
  children: ReactNode; title?: string; className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-14 ${className}`}>
      {title && <h1 className="sr-only">{title}</h1>}
      {children}
    </div>
  );
}
