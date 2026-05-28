"use client";

import { useState } from "react";
import Link from "next/link";
import type { ScheduledFlightDTO } from "@/lib/formatFlight";
import type { TripPhase } from "@/lib/booking/tripPhase";
import { parseApiResponse } from "@/lib/api/client";
import { PageShell } from "@/components/ui/PageShell";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

import { Field } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";


import { SkeletonBlock } from "@/components/ui/Skeleton";

type BookingRow =

 {
  bookingReference: string;
  status: "confirmed" | "cancelled" | "completed";
  tripPhase: TripPhase;
  passenger:
  {
    title: string;
    givenName: string;
    familyName: string;
    email: string;
  };
  priceNzd: number;
  flight: ScheduledFlightDTO;
  createdAt?: string;
};
const inputClass ="min-h-11 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200";
export default function ManagePage()
{
  const [cancelRef, setCancelRef] = useState("");
  const [cancelEmail, setCancelEmail] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupFamily, setLookupFamily] = useState("");
  const [lookupResults, setLookupResults] = useState<BookingRow[]>([]);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);



  async function handleCancel(event: React.FormEvent)

  {
    event.preventDefault();
    setCancelBusy(true);
    setCancelSuccess(null);
    setCancelError(null);
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(cancelRef.trim())}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passengerEmail: cancelEmail.trim() }),
      });
      const out = await parseApiResponse<{ message: string }>(res);
      if (!out.ok) {
        setCancelError(out.message);
        return;
      }
      setCancelSuccess(out.data.message);
      setCancelRef("");
      setCancelEmail("");
    } catch {
      setCancelError("We could not reach the server. Check your connection and try again.");
    } finally {
      setCancelBusy(false);
    }
  }

  async function handleLookup(event: React.FormEvent)
  {

    event.preventDefault();
    setLookupBusy(true);
    setLookupError(null);
    setLookupResults([]);
    setLookupDone(false);
    try {
      const params = new URLSearchParams({ email: lookupEmail.trim().toLowerCase() });
      if (lookupFamily.trim()) {
        params.set("familyName", lookupFamily.trim());
      }
      const res = await fetch(`/api/bookings/by-passenger?${params.toString()}`, { cache: "no-store" });
      const out = await parseApiResponse<{ bookings: BookingRow[] }>(res);
      if (!out.ok) {
        setLookupError(out.message);
        setLookupDone(true);
        return;
      }
      setLookupResults(out.data.bookings);
      setLookupDone(true);
    } catch {
      setLookupError("We could not reach the server. Check your connection and try again.");
      setLookupDone(true);
    } finally {
      setLookupBusy(false);
    }
  }
  return (
    <PageShell title="Manage booking">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-800/90">Self-service</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Manage booking
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          Cancel a confirmed booking or list upcoming segments tied to an email address. Keep your
          booking reference private — it acts like a boarding pass control number.
        </p>
      </header>
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card as="section" className="p-6 sm:p-8" aria-labelledby="cancel-heading">
          <h2 id="cancel-heading" className="text-lg font-semibold text-slate-900">
            Cancel a booking
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Only <strong>confirmed</strong> bookings on <strong>future</strong> departures can be
            cancelled here.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleCancel}>
            <Field id="booking-ref" label="Booking reference">
              <input
                id="booking-ref"
                value={cancelRef}
                onChange={(e) => setCancelRef(e.target.value)}
                className={`${inputClass} font-mono uppercase tracking-wide`}
                placeholder="e.g. 3KPL9F2QRT"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={cancelError ? true : undefined}
                required
              />
            </Field>
            <Field id="cancel-email" label="Passenger email">
              <input
                id="cancel-email"
                type="email"
                value={cancelEmail}
                onChange={(e) => setCancelEmail(e.target.value)}
                className={inputClass}
                autoComplete="email"
                required
              />
            </Field>
            {cancelSuccess ? (
              <Alert tone="success" title="Success">
                {cancelSuccess}
              </Alert>
            ) : null}
            {cancelError ? (
              <Alert tone="error" title="Could not cancel">
                {cancelError}
              </Alert>
            ) : null}
            <Button type="submit" variant="danger" isLoading={cancelBusy}>
              {cancelBusy ? "Cancelling…" : "Cancel booking"}
            </Button>
          </form>
        </Card>

        <Card as="section" className="p-6 sm:p-8" aria-labelledby="lookup-heading">
          <h2 id="lookup-heading" className="text-lg font-semibold text-slate-900">
            Find my flights
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Look up all flights booked under an email address, including past and cancelled
            bookings.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleLookup}>
            <Field id="lookup-email" label="Email on the booking">
              <input
                id="lookup-email"
                type="email"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                className={inputClass}
                autoComplete="email"
                required
              />
            </Field>
            <Field
              id="lookup-family"
              label="Family name (optional)"
              hint="If provided, results must match exactly (case-insensitive)."
            >
              <input
                id="lookup-family"
                value={lookupFamily}
                onChange={(e) => setLookupFamily(e.target.value)}
                className={inputClass}
                autoComplete="family-name"
                aria-describedby="lookup-family-hint"
              />
            </Field>
            {lookupError ? (
              <Alert tone="error" title="Lookup failed">
                {lookupError}
              </Alert>
            ) : null}
            <Button type="submit" variant="primary" isLoading={lookupBusy}>
              {lookupBusy ? "Searching…" : "Look up bookings"}
            </Button>
          </form>
        </Card>
      </section>



      <section className="mt-12" aria-labelledby="itinerary-heading">
        <h2 id="itinerary-heading" className="text-lg font-semibold text-slate-900">
          Booking history
        </h2>


        {lookupBusy ? (
          <Card className="mt-4 p-8">
            <SkeletonBlock label="Loading bookings" />
          </Card>
        ) : null}

        {!lookupBusy && lookupDone && lookupResults.length === 0 && !lookupError ? (
          <Card className="mt-4 border-dashed p-8 text-center">
            <p className="text-sm font-semibold text-slate-800">No bookings found</p>
            <p className="mt-2 text-sm text-slate-600">
              No bookings were found for that email address.
            </p>
          </Card>
        ) : null}


        {!lookupBusy && lookupResults.length > 0 ? (
          <ul className="mt-4 space-y-3" role="list">
            {lookupResults.map((row) => (
              <li key={row.bookingReference}>
                <Card className="p-5 transition duration-200 hover:-translate-y-0.5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-sm font-semibold tracking-wide text-slate-900">
                          {row.bookingReference}
                        </p>
                        <StatusBadge kind="trip" value={row.tripPhase} />
                        <StatusBadge kind="booking" value={row.status} />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-800/90">
                        {row.flight.flightNumber} · {row.flight.serviceLabel}
                      </p>
                      <p className="text-base font-semibold text-slate-900">
                        {row.flight.originLabel} → {row.flight.destLabel}
                      </p>
                      <p className="text-sm text-slate-600">
                        {row.passenger.title} {row.passenger.givenName} {row.passenger.familyName}
                      </p>
                      <p className="text-sm text-slate-600">
                        Depart <time dateTime={row.flight.departureAt}>{row.flight.departureLocal}</time>{" "}
                        · <span className="font-semibold tabular-nums">${row.priceNzd.toFixed(0)} NZD</span>
                      </p>
                    </div>
                    <Link
                      href={`/invoice/${encodeURIComponent(row.bookingReference)}?email=${encodeURIComponent(row.passenger.email)}`}
                      className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-[var(--border-strong)] px-4 text-sm font-semibold text-sky-900 transition hover:bg-sky-50"
                    >
                      Open e-ticket
                    </Link>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </PageShell>
  );
}
