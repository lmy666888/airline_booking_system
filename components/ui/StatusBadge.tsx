import type { TripPhase } from "@/lib/booking/tripPhase";

// maps both trip phases and booking statuses to badge style
const badges: Record<string, { label: string; cls: string }> = {
  upcoming:  { label: "Upcoming",  cls: "border-sky-200 bg-sky-50 text-sky-900" },
  confirmed: { label: "Confirmed", cls: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  completed: { label: "Completed", cls: "border-slate-200 bg-slate-100 text-slate-800" },
  cancelled: { label: "Cancelled", cls: "border-red-200 bg-red-50 text-red-900" },
};


export function StatusBadge({ kind, value }: {
  kind: "trip" | "booking";
  value: TripPhase | "confirmed" | "cancelled" | "completed";
}) {
  const b = badges[value];
  if (!b) return null;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${b.cls}`}>
      {b.label}
    </span>
  );
}
