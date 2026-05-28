"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import type { ScheduledFlightDTO } from "@/lib/formatFlight";
import type { TripPhase } from "@/lib/booking/tripPhase";

import { parseApiResponse } from "@/lib/api/client";
import { PageShell } from "@/components/ui/PageShell";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { StatusBadge } from "@/components/ui/StatusBadge";

import { SkeletonBlock } from "@/components/ui/Skeleton";

type InvoicePayload =
{
  bookingReference: string;
  status: "confirmed" | "cancelled" | "completed";
  tripPhase: TripPhase;
  passenger: {
    title: string;
    givenName: string;
    familyName: string;
    email: string;
  };
  priceNzd: number;
  flight: ScheduledFlightDTO;
  createdAt?: string;
  cancelledAt?: string | null;
  completedAt?: string | null;
};
export function InvoiceClient()
{
  const params = useParams<{ reference: string | string[] | undefined }>();
  const searchParams = useSearchParams();
  const rawRef = params.reference;
  const reference =
    typeof rawRef === "string" ? rawRef : Array.isArray(rawRef) ? (rawRef[0] ?? "") : "";
  const email = searchParams.get("email")?.trim() ?? "";
  const [data, setData] = useState<InvoicePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);



  useEffect(() =>
  {
    const id = ++requestId.current;
    let cancelled = false;
    async function load()
    {
      if (!email) {
        setError(
          "This secure link is missing the email parameter. Use the link from your confirmation, or open the booking from Manage.",
        );
        setLoading(false);
        setData(null);
        return;
      }

      if (!reference)
      {
        setError("That booking link is missing a valid record locator.");
        setLoading(false);
        setData(null);
        return;
      }

      setError(null);
      setLoading(true);
      try {
        const res = await fetch(
          `/api/bookings/${encodeURIComponent(reference)}?email=${encodeURIComponent(email)}`,
          { cache: "no-store" },
        );
        const out = await parseApiResponse<InvoicePayload>(res);
        if (cancelled || id !== requestId.current) {
          return;
        }
        if (!out.ok) {
          setError(out.message);
          setData(null);
          return;
        }
        setData(out.data);
      } catch {
        if (!cancelled && id === requestId.current) {
          setError("We could not reach the server. Check your connection and try again.");
        }
      } finally {
        if (!cancelled && id === requestId.current) {
          setLoading(false);
        }
      }
    }
    void load();
    return () =>
    {
      cancelled = true;
    };
  }, [reference, email]);

  if (!email)
  {
    return (
      <PageShell title="Electronic ticket">
        <Alert tone="error" title="Missing secure link">
          Open this page using the link from your confirmation so your email is included in the URL.
        </Alert>
        <Link
          href="/manage"
          className="mt-6 inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Manage booking
        </Link>
      </PageShell>
    );
  }

  if (loading)

  {
    return (
      <PageShell title="Electronic ticket">
        <Card className="p-8">
          <SkeletonBlock label="Loading electronic ticket" />
        </Card>
      </PageShell>
    );
  }

  if (error || !data)
   {
    return (
      <PageShell title="Electronic ticket">
        <Alert tone="error" title="Unable to load e-ticket">
          {error}
        </Alert>
        <Link
          href="/manage"
          className="mt-6 inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Manage booking
        </Link>
      </PageShell>
    );
  }
  const issued = data.createdAt ? new Date(data.createdAt).toLocaleString("en-NZ") : "—";
  return (
    <PageShell title="Electronic ticket">
      <div className="mx-auto max-w-3xl">
        <Card className="overflow-hidden shadow-[0_20px_60px_rgb(15_23_42/0.12)]">
          <div className="border-b border-dashed border-slate-300 bg-gradient-to-r from-sky-950 to-slate-900 px-6 py-5 text-white sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-200/90">
                  Electronic ticket / tax invoice
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight">Dairy Flat Airways</p>
                <p className="text-xs text-slate-200/90">NZNE hub · coursework demonstration</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-200/90">
                  Record locator
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold tracking-[0.12em]">
                  {data.bookingReference}
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-6 bg-[var(--surface-muted)] px-6 py-5 sm:grid-cols-3 sm:px-8">
            <div className="sm:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Barcode</p>
              <div
                className="dfa-ticket-bar mt-2 h-10 w-full max-w-md rounded-md"
                aria-hidden="true"
              />
              <p className="sr-only">Decorative barcode placeholder for demonstration purposes.</p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <StatusBadge kind="booking" value={data.status} />
              <StatusBadge kind="trip" value={data.tripPhase} />
            </div>
          </div>



          <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 sm:px-8">
            <section aria-labelledby="passenger-label">
              <h2 id="passenger-label" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Passenger
              </h2>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {data.passenger.title} {data.passenger.givenName} {data.passenger.familyName}
              </p>
              <p className="mt-1 text-sm text-slate-600">{data.passenger.email}</p>
            </section>


            <section aria-labelledby="fare-label">
              <h2 id="fare-label" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Amount (NZD)
              </h2>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
                ${data.priceNzd.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-slate-500">GST inclusive · fictitious coursework fare</p>
            </section>
            <section className="sm:col-span-2" aria-labelledby="flight-label">
              <h2 id="flight-label" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Flight
              </h2>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {data.flight.flightNumber} · {data.flight.serviceLabel}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {data.flight.originLabel} <span aria-hidden="true">→</span> {data.flight.destLabel}
              </p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Departure
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900">{data.flight.departureLocal}</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Arrival
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900">{data.flight.arrivalLocal}</dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {Math.floor(data.flight.durationMinutes / 60) > 0
                      ? `${Math.floor(data.flight.durationMinutes / 60)}h ${data.flight.durationMinutes % 60}m`
                      : `${data.flight.durationMinutes}m`}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Aircraft</dt>
                  <dd className="mt-1 font-medium text-slate-900">{data.flight.aircraftLabel}</dd>
                </div>
              </dl>
            </section>

            <section className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              <dl className="grid gap-2 sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-slate-500">Issued</dt>
                  <dd className="mt-0.5">{issued}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Cancelled at</dt>
                  <dd className="mt-0.5">
                    {data.cancelledAt ? new Date(data.cancelledAt).toLocaleString("en-NZ") : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Completed at</dt>
                  <dd className="mt-0.5">
                    {data.completedAt ? new Date(data.completedAt).toLocaleString("en-NZ") : "—"}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </Card>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/search"
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full bg-[var(--brand)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-hover)]"
          >
            Book another flight
          </Link>
          <Link
            href="/manage"
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Manage bookings
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
