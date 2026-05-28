"use client";

import { useMemo, useState, useCallback } from "react";
import { DateTime } from "luxon";
import type { ScheduledFlightDTO } from "@/lib/formatFlight";

import { parseApiResponse } from "@/lib/api/client";
import { PageShell } from "@/components/ui/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { Alert } from "@/components/ui/Alert";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { FlightResultCard } from "@/components/FlightResultCard";
import { Field } from "@/components/ui/Field";

const ICAO_OPTIONS = [
  { value: "", label: "Any airport" },
  { value: "NZNE", label: "Dairy Flat (NZNE)" },
  { value: "YSSY", label: "Sydney (YSSY)" },
  { value: "NZRO", label: "Rotorua (NZRO)" },
  { value: "NZGB", label: "Claris / Great Barrier (NZGB)" },
  { value: "NZCI", label: "Tuuta / Chatham (NZCI)" },
  { value: "NZTL", label: "Lake Tekapo (NZTL)" },
] as const;

function defaultRange()
{
  const start = DateTime.now().setZone("Pacific/Auckland").startOf("day");
  const end = start.plus({ weeks: 3 });
  return { date1: start.toISODate()!, date2: end.toISODate()! };
}

export default function SearchPage()
{
  const initial = useMemo(() => defaultRange(), []);
  const [date1, setDate1] = useState(initial.date1);
  const [date2, setDate2] = useState(initial.date2);
  const [orig, setOrig] = useState("NZNE");


  const [dest, setDest] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ScheduledFlightDTO[]>([]);
  const [hasSearched, setHasSearched] = useState(false);



  const inputClass =

    "min-h-11 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200";



  const runSearch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try

    {
      const params = new URLSearchParams({ date1, date2 });
      if (orig) {
        params.set("orig", orig);
      }
      if (dest) {
        params.set("dest", dest);
      }
      const res = await fetch(`/api/schedules?${params.toString()}`, { cache: "no-store" });
      const out = await parseApiResponse<{ schedules: ScheduledFlightDTO[] }>(res);
      if (!out.ok) {
        setResults([]);
        setError(out.message);
        setHasSearched(true);
        return;
      }
      setResults(out.data.schedules);
      setHasSearched(true);
    } catch {
      setResults([]);
      setError("We could not reach the server. Check your connection and try again.");
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }, [date1, date2, orig, dest]);

  async function handleSearch(event: React.FormEvent)

  {
    event.preventDefault();
    await runSearch();
  }
  function swapOrigDest() {
    const o = orig;
    const d = dest;
    setOrig(d);
    setDest(o);
  }
  return (
    <PageShell title="Search flights">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-800/90">Schedules</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Search flights
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          Choose a departure window and optional endpoints. Infrequent routes (Sydney prestige,
          Chatham, Tekapo) benefit from a wider date range.
        </p>
      </header>



      <Card className="mt-8 p-6 sm:p-8">
        <form onSubmit={handleSearch} className="grid gap-5 md:grid-cols-2" noValidate>
          <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:gap-3">
            <div className="min-w-0 flex-1">
              <Field
                id="origin"
                label="From (origin)"
                hint="ICAO airport code. Default is Dairy Flat (NZNE)."
              >
                <select
                  id="origin"
                  value={orig}
                  onChange={(e) => setOrig(e.target.value)}
                  className={inputClass}
                  aria-describedby="origin-hint"
                >
                  {ICAO_OPTIONS.map((opt) => (
                    <option key={`${opt.value}-orig`} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="flex justify-center md:shrink-0">
              <button
                type="button"
                onClick={swapOrigDest}
                className="inline-flex h-11 min-w-[5.5rem] items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                aria-label="Swap origin and destination"
              >
                ↔ Swap
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <Field id="destination" label="To (destination)">
                <select
                  id="destination"
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  className={inputClass}
                >
                  {ICAO_OPTIONS.map((opt) => (
                    <option key={`${opt.value}-dest`} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>


          <Field id="start" label="Start date (NZ hub calendar day)">
            <input
              id="start"
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className={inputClass}
              required
              aria-required="true"
            />
          </Field>


          <Field id="end" label="End date">
            <input
              id="end"
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className={inputClass}
              required
              aria-required="true"
            />
          </Field>
          <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" variant="primary" isLoading={loading} className="sm:min-w-[11rem]">
              {loading ? "Searching…" : "Search schedules"}
            </Button>
            {error ? (
              <Alert tone="error" className="sm:max-w-md">
                {error}
              </Alert>
            ) : null}
          </div>
        </form>
      </Card>
      <section className="mt-10" aria-labelledby="results-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="results-heading" className="text-lg font-semibold text-slate-900">
            Results
          </h2>
          {hasSearched && !loading ? (
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {results.length} leg{results.length === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
        <div className="mt-4">
          {loading ? (
            <Card className="p-8">
              <SkeletonBlock label="Loading schedules" />
            </Card>
          ) : null}
          {!loading && !hasSearched ? (
            <Card className="border-dashed p-8 text-center">
              <p className="text-sm font-medium text-slate-700">Ready when you are</p>
              <p className="mt-2 text-sm text-slate-500">
                Run a search to see scheduled departures with remaining seats.
              </p>
            </Card>
          ) : null}
          {!loading && hasSearched && results.length === 0 && !error ? (
            <Card className="border-dashed p-8 text-center">
              <p className="text-sm font-semibold text-slate-800">No flights in this window</p>
              <p className="mt-2 text-sm text-slate-600">
                Try widening your dates or changing the origin / destination filters.
              </p>
            </Card>
          ) : null}
          {!loading && results.length > 0 ? (
            <ul className="mt-4 space-y-4" role="list">
              {results.map((flight) => (
                <FlightResultCard key={flight._id} flight={flight} />
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
