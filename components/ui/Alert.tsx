import type { ReactNode } from "react";

const toneStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  error: "border-red-200 bg-red-50 text-red-950",
  info: "border-sky-200 bg-sky-50 text-sky-950",
} as const;

type Tone = keyof typeof toneStyles;

export function Alert({ tone, title, children, className = "" }: {
  tone: Tone; title?: string; children: ReactNode; className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${toneStyles[tone]} ${className}`}
    >
      {title && <p className="font-semibold">{title}</p>}
      <div className={title ? "mt-1" : ""}>{children}</div>
    </div>
  );
}
