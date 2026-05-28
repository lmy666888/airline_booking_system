import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { Card } from "@/components/ui/Card";


export default function Home()
{
  return (
    <PageShell>
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-950 via-slate-900 to-slate-950 px-6 py-12 text-white shadow-2xl sm:px-10 sm:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-200/90">
          Dairy Flat Airport · NZNE
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Point-to-point luxury from North Auckland
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
          Dairy Flat Airways connects our hub with Sydney, Rotorua, Great Barrier Island, the
          Chatham Islands, and Lake Tekapo — real calendar schedules, timezone-aware departures,
          and a compact fleet matched to each route.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/search"
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-900 shadow-sm transition duration-200 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Search flights
          </Link>
          <Link
            href="/manage"
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-white/35 px-6 text-sm font-semibold text-white transition duration-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Manage booking
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-5 md:grid-cols-3">
        <Card as="article" className="p-6 transition duration-200 hover:-translate-y-0.5">
          <h2 className="text-base font-semibold text-slate-900">Fleet matched to the mission</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            SyberJet SJ30i prestige runs to Sydney, paired Cirrus SF50 shuttles for Rotorua and
            Claris, and HondaJet Elite services for the Chatham Islands and Tekapo.
          </p>
        </Card>
        <Card as="article" className="p-6 transition duration-200 hover:-translate-y-0.5">
          <h2 className="text-base font-semibold text-slate-900">Rolling weekly timetable</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Routes repeat every week on real calendar dates, with departures expressed in local
            time for Auckland, Sydney, and the Chatham Islands.
          </p>
        </Card>
        <Card as="article" className="p-6 transition duration-200 hover:-translate-y-0.5">
          <h2 className="text-base font-semibold text-slate-900">No accounts required</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Book with your contact details, receive a unique booking reference, and manage your
            itinerary using email verification instead of passwords.
          </p>
        </Card>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Our routes</h2>
        <p className="mt-2 text-sm text-slate-600">
          All services operate from Dairy Flat (NZNE). Times shown are local departures.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              dest: "Sydney (YSSY)",
              freq: "Weekly — Fri outbound, Sun return",
              aircraft: "SyberJet SJ30i · 6 seats",
              price: 2290,
              tz: "GMT+10",
            },
            {
              dest: "Rotorua (NZRO)",
              freq: "Mon–Fri — twice daily each way",
              aircraft: "Cirrus SF50 · 4 seats",
              price: 385,
              tz: "GMT+12",
            },
            {
              dest: "Claris, Great Barrier (NZGB)",
              freq: "Mon/Wed/Fri out · Tue/Thu/Sat return",
              aircraft: "Cirrus SF50 · 4 seats",
              price: 295,
              tz: "GMT+12",
            },
            {
              dest: "Tuuta, Chatham Islands (NZCI)",
              freq: "Tue/Fri out · Wed/Sat return",
              aircraft: "HondaJet Elite · 5 seats",
              price: 1760,
              tz: "GMT+12:45",
            },
            {
              dest: "Lake Tekapo (NZTL)",
              freq: "Mon out · Tue return",
              aircraft: "HondaJet Elite · 5 seats",
              price: 275,
              tz: "GMT+12",
            },
          ].map((r) =>

          (
            <Card key={r.dest} as="article" className="p-5">
              <h3 className="text-sm font-semibold text-slate-900">{r.dest}</h3>
              <p className="mt-1 text-xs text-slate-500">{r.tz}</p>
              <p className="mt-2 text-sm text-slate-600">{r.freq}</p>
              <p className="mt-1 text-xs text-slate-500">{r.aircraft}</p>
              <p className="mt-2 text-sm font-semibold tabular-nums text-slate-900">
                From ${r.price} NZD
              </p>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
