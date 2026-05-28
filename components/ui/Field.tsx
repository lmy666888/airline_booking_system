import type { ReactNode } from "react";

export function Field({ id, label, hint, error, children }: {
  id: string; label: string; hint?: string; error?: string | null; children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-[var(--text)]">{label}</label>
      {children}
      {hint && <p id={`${id}-hint`} className="text-xs text-slate-500">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-xs font-medium text-red-700" role="alert">{error}</p>}
    </div>
  );
}
