import { memo } from "react";
import Link from "next/link";
import type { ScheduledFlightDTO } from "@/lib/formatFlight";
import { Card } from "@/components/ui/Card";
function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function FlightResultCardInner({ flight }: { flight: ScheduledFlightDTO }) {
  const soldOut = flight.seatsAvailable <= 0;



  return (
    <li>
      <Card as="article" className="group overflow-hidden p-5 transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-800/90">
              {flight.flightNumber} <span className="font-semibold text-slate-400">·</span> {flight.serviceLabel}
            </p>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              {flight.originLabel} <span aria-hidden="true">→</span> <span className="whitespace-normal">{flight.destLabel}</span>
            </h3>
            <dl className="grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <dt className="sr-only">Departure</dt>
                <dd>Depart <time dateTime={flight.departureAt}>{flight.departureLocal}</time></dd>
              </div>
              <div>
                <dt className="sr-only">Arrival</dt>
                <dd>Arrive <time dateTime={flight.arrivalAt}>{flight.arrivalLocal}</time></dd>
              </div>
            </dl>
            <p className="text-xs text-slate-500">{flight.aircraftLabel} · {fmtDuration(flight.durationMinutes)}</p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <p className="text-sm text-slate-600">
              From <span className="text-2xl font-semibold tabular-nums text-slate-900">${flight.priceNzd.toFixed(0)}</span>{" "}
              <span className="text-slate-500">NZD</span>
            </p>
            <p className="text-sm text-slate-600">
              Seats left: <span className="font-semibold tabular-nums text-slate-900">{flight.seatsAvailable}</span> / {flight.seatCapacity}
            </p>
            {soldOut ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Sold out</p>
            ) : (
              <Link href={`/flights/${flight._id}/book`}
                className="inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-full bg-[var(--brand)] px-5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[var(--brand-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 sm:w-auto">
                Book this flight
              </Link>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
}
export const FlightResultCard = memo(FlightResultCardInner);
