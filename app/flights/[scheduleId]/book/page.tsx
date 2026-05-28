"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { ScheduledFlightDTO } from "@/lib/formatFlight";
import { parseApiResponse } from "@/lib/api/client";
import { createBookingBodySchema } from "@/lib/validation/booking";

import { firstZodIssueMessage } from "@/lib/api/zodErrors";
import { PageShell } from "@/components/ui/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { Alert } from "@/components/ui/Alert";
import { Field } from "@/components/ui/Field";
import { SkeletonBlock } from "@/components/ui/Skeleton";

const inputClass = "min-h-11 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200";
export default function BookFlightPage()

{
  const params = useParams<{ scheduleId: string }>();
  const router = useRouter();
  const scheduleId = params.scheduleId;
  const submitLock = useRef(false);


  const [flight, setFlight] = useState<ScheduledFlightDTO | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [title, setTitle] = useState("Mr");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() =>

  {
    let cancelled = false;
    async function load() {
      setLoadState("loading");
      setLoadError(null);
      try
      {
        const res = await fetch(`/api/schedules/${scheduleId}`, { cache: "no-store" });
        const out = await parseApiResponse<{ schedule: ScheduledFlightDTO }>(res);
        if (!out.ok) {
          if (!cancelled) {
            setLoadError(out.message);
            setLoadState("error");
          }
          return;
        }
        if (!cancelled) {
          setFlight(out.data.schedule);
          setLoadState("ready");
        }
      } catch
      {
        if (!cancelled) {
          setLoadError("We could not reach the server. Check your connection and try again.");
          setLoadState("error");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [scheduleId]);
  async function handleSubmit(event: React.FormEvent)
  {
    event.preventDefault();
    if (!flight || submitLock.current) {
      return;
    }
    const candidate = {
      scheduledFlightId: scheduleId,
      passengerTitle: title,
      passengerGivenName: givenName,
      passengerFamilyName: familyName,
      passengerEmail: email,
    };
    const parsed = createBookingBodySchema.safeParse(candidate);
    if (!parsed.success) {
      setFormError(firstZodIssueMessage(parsed.error));
      return;
    }



    submitLock.current = true;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/bookings",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const out = await parseApiResponse<{
        bookingReference: string;
        invoice: { bookingReference: string };
      }>(res);
      if (!out.ok) {
        setFormError(out.message);
        return;
      }
      router.push(
        `/invoice/${encodeURIComponent(out.data.bookingReference)}?email=${encodeURIComponent(parsed.data.passengerEmail.trim().toLowerCase())}`,
      );
    } catch {
      setFormError("We could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  }

  if (loadState === "error") {
    return (
      <PageShell title="Unable to load flight">
        <Alert tone="error" title="Unable to load flight">
          {loadError}
        </Alert>
        <Link
          href="/search"
          className="mt-6 inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Back to search
        </Link>
      </PageShell>
    );
  }

  if (loadState === "loading" || !flight) {
    return (
      <PageShell title="Loading flight">
        <Card className="p-8">
          <SkeletonBlock label="Loading flight details" />
        </Card>
      </PageShell>
    );
  }

  const soldOut = flight.seatsAvailable <= 0;

  return (
    <PageShell title="Confirm booking">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-800/90">
          {flight.flightNumber} · {flight.serviceLabel}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Confirm booking
        </h1>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">
          {flight.originLabel} → {flight.destLabel}
        </p>
        <dl className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">Departure</dt>
            <dd className="font-semibold text-slate-900">{flight.departureLocal}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Arrival</dt>
            <dd className="font-semibold text-slate-900">{flight.arrivalLocal}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Duration</dt>
            <dd className="font-semibold text-slate-900">
              {Math.floor(flight.durationMinutes / 60) > 0
                ? `${Math.floor(flight.durationMinutes / 60)}h ${flight.durationMinutes % 60}m`
                : `${flight.durationMinutes}m`}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Fare</dt>
            <dd className="font-semibold tabular-nums text-slate-900">${flight.priceNzd.toFixed(0)} NZD</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Availability</dt>
            <dd className="font-semibold tabular-nums text-slate-900">
              {flight.seatsAvailable} / {flight.seatCapacity} seats
            </dd>
          </div>
        </dl>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <Card as="section" className="p-6 sm:p-8 lg:col-span-3" aria-labelledby="passenger-heading">
          <h2 id="passenger-heading" className="text-lg font-semibold text-slate-900">
            Passenger details
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Must match your travel documents. Email is used to retrieve or cancel this booking.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <Field id="title" label="Title">
              <select
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
              >
                {["Mr", "Mrs", "Ms", "Miss", "Mx"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="given" label="Given names">
                <input
                  id="given"
                  value={givenName}
                  onChange={(e) => setGivenName(e.target.value)}
                  className={inputClass}
                  autoComplete="given-name"
                  required
                />
              </Field>
              <Field id="family" label="Family name">
                <input
                  id="family"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className={inputClass}
                  autoComplete="family-name"
                  required
                />
              </Field>
            </div>

            <Field id="email" label="Email" hint="We never send marketing without consent.">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                autoComplete="email"
                required
              />
            </Field>

            {formError ? (
              <Alert tone="error" title="Could not complete booking">
                {formError}
              </Alert>
            ) : null}


            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" variant="primary" isLoading={submitting} disabled={soldOut}>
                {submitting ? "Booking…" : "Complete booking"}
              </Button>
              <Button type="button" variant="secondary" disabled={submitting} onClick={() => router.push("/search")}>
                Back to results
              </Button>
            </div>

            {soldOut ? (
              <Alert tone="info" title="Sold out">
                This flight is full. Please pick another schedule from search results.
              </Alert>
            ) : null}
          </form>
        </Card>
        <Card as="aside" className="h-fit p-6 sm:p-8 lg:col-span-2" aria-label="Booking summary">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Summary</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{flight.aircraftLabel}</p>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            By continuing you agree to our coursework demo terms: fares are fictitious, no payment is
            processed, and seat assignment may be introduced in a future release.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
