import type { ButtonHTMLAttributes, ReactNode } from "react";

const variantStyles =
{
  primary: "bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] focus-visible:ring-[var(--brand)]",
  secondary: "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-muted)] focus-visible:ring-slate-400",
  danger: "bg-[var(--danger)] text-white hover:bg-red-700 focus-visible:ring-red-600",
  ghost: "text-[var(--brand)] hover:bg-sky-50 focus-visible:ring-sky-400",
} as const;

type Variant = keyof typeof variantStyles;

export function Button({
  children, variant = "primary", className = "", isLoading, disabled, type = "submit", ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode; variant?: Variant; isLoading?: boolean;
}) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-[2.75rem] cursor-pointer items-center justify-center rounded-full px-5 text-sm font-semibold tracking-tight shadow-sm transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55 ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}
