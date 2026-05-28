import { DateTime } from "luxon";




export const SCHEDULE_RANGE = {
  start: { year: 2026, month: 5, day: 27 },
  end:   { year: 2026, month: 9, day: 30 },
} as const;




const NZ = "Pacific/Auckland";
const SYD = "Australia/Sydney";
const CHATHAM = "Pacific/Chatham";
export type ScheduleRow =
{
  flightNumber: string;
  originIcao: string; destIcao: string;
  departureAt: Date; arrivalAt: Date;
  departureTimeZone: string; arrivalTimeZone: string;
  aircraftLabel: string;
  seatCapacity: number; seatsSold: number;
  priceNzd: number; serviceLabel: string;
};

function utcDep(zone: string, y: number, month: number, day: number, hour: number, minute: number)
{
  return DateTime.fromObject({ year: y, month, day, hour, minute }, { zone }).toUTC();
}

function add(rows: ScheduleRow[], p: {
  flightNumber: string; originIcao: string; destIcao: string;
  depZone: string; arrZone: string;
  y: number; month: number; day: number; hour: number; minute: number;
  dur: number; seats: number; price: number;
  aircraft: string; label: string;
}) {
  const dep = utcDep(p.depZone, p.y, p.month, p.day, p.hour, p.minute);
  rows.push({
    flightNumber: p.flightNumber,
    originIcao: p.originIcao, destIcao: p.destIcao,
    departureAt: dep.toJSDate(),
    arrivalAt: dep.plus({ minutes: p.dur }).toJSDate(),
    departureTimeZone: p.depZone, arrivalTimeZone: p.arrZone,
    aircraftLabel: p.aircraft,
    seatCapacity: p.seats, seatsSold: 0,
    priceNzd: p.price, serviceLabel: p.label,
  });
}



export function buildSchedule(): ScheduleRow[]
{
  const rows: ScheduleRow[] = [];
  const start = DateTime.fromObject(SCHEDULE_RANGE.start, { zone: NZ }).startOf("day");
  const end   = DateTime.fromObject(SCHEDULE_RANGE.end, { zone: NZ }).startOf("day");
  if (!start.isValid || !end.isValid || start > end) {
    throw new Error("Invalid SCHEDULE_RANGE");
  }

  for (let d = start; d <= end; d = d.plus({ days: 1 }))
  {
    const y = d.year, month = d.month, day = d.day, wd = d.weekday;

    //  Rotorua shuttle
    if (wd >= 1 && wd <= 5) {
      add(rows, {
      flightNumber: "DFR101", originIcao: "NZNE", destIcao: "NZRO", depZone: NZ, arrZone: NZ, y, month, day, hour: 7, minute: 15, dur: 55, seats: 4, price: 385, aircraft: "Cirrus SF50 · Rotorua shuttle", label: "Rotorua shuttle (morning)" });
      add(rows, { flightNumber: "DFR102", originIcao: "NZRO", destIcao: "NZNE", depZone: NZ, arrZone: NZ, y, month, day, hour: 8, minute: 45, dur: 60, seats: 4, price: 385, aircraft: "Cirrus SF50 · Rotorua shuttle", label: "Rotorua shuttle (morning return)" });
      add(rows, { flightNumber: "DFR103", originIcao: "NZNE", destIcao: "NZRO", depZone: NZ, arrZone: NZ, y, month, day, hour: 17, minute: 20, dur: 55, seats: 4, price: 385, aircraft: "Cirrus SF50 · Rotorua shuttle", label: "Rotorua shuttle (evening)" });
      add(rows,{ flightNumber: "DFR104", originIcao: "NZRO", destIcao: "NZNE", depZone: NZ, arrZone: NZ, y, month, day, hour: 18, minute: 50, dur: 60, seats: 4, price: 385, aircraft: "Cirrus SF50 · Rotorua shuttle", label: "Rotorua shuttle (evening return)" });
    }


    if (wd === 1 || wd=== 3 || wd === 5) {
      add(rows, { flightNumber: "DFG201", originIcao: "NZNE", destIcao: "NZGB", depZone: NZ, arrZone: NZ, y, month, day, hour: 8, minute: 10, dur: 40, seats: 4, price: 295, aircraft: "Cirrus SF50 · Great Barrier", label: "Claris (Great Barrier) outbound" });
    }
    if (wd === 2 || wd === 4 || wd === 6) {
      add(rows, { flightNumber: "DFG202", originIcao: "NZGB", destIcao: "NZNE", depZone: NZ, arrZone: NZ, y, month, day, hour: 9, minute: 5, dur: 40, seats: 4, price: 295, aircraft: "Cirrus SF50 · Great Barrier", label: "Claris (Great Barrier) return" });
    }

    //

     //Sydney prestige
    // westbound takes longer (205 min) vs eastbound return
    if (wd ===5)
    {
      add(rows, { flightNumber: "DFP301", originIcao: "NZNE", destIcao: "YSSY", depZone: NZ, arrZone: SYD, y, month, day, hour: 10, minute: 30, dur: 205, seats: 6, price: 2290, aircraft: "SyberJet SJ30i", label: "Sydney prestige (outbound)" });
    }
    if (wd === 7)
    {
      add(rows, { flightNumber: "DFP302", originIcao: "YSSY", destIcao: "NZNE", depZone: SYD, arrZone: NZ, y, month, day, hour: 15, minute: 0, dur: 195, seats: 6, price: 2290, aircraft: "SyberJet SJ30i", label: "Sydney prestige (return)" });
    }

    //Chatham Islands
    if (wd === 2 || wd === 5) {
      add(rows, { flightNumber: "DFC401", originIcao: "NZNE", destIcao: "NZCI", depZone: NZ, arrZone: CHATHAM, y, month, day, hour: 9, minute: 30, dur: 170, seats: 5, price: 1760, aircraft: "HondaJet Elite · Chatham service", label: "Chatham Islands (outbound)" });
    }

    if (wd ===3 || wd ===6)
    {
      add(rows, { flightNumber: "DFC402", originIcao: "NZCI", destIcao: "NZNE", depZone: CHATHAM, arrZone: NZ, y, month, day, hour: 14, minute: 45, dur: 185, seats: 5, price: 1760, aircraft: "HondaJet Elite · Chatham service", label: "Chatham Islands (return)" });
    }

    // Lake Tekapo
    if (wd === 1) {
      add(rows, { flightNumber: "DFT501", originIcao: "NZNE", destIcao: "NZTL", depZone: NZ, arrZone: NZ, y, month, day, hour: 13, minute: 45, dur: 80, seats: 5, price: 275, aircraft: "HondaJet Elite · Tekapo service", label: "Lake Tekapo (outbound)" });
    }
    if (wd === 2) {
      add(rows, { flightNumber: "DFT502", originIcao: "NZTL", destIcao: "NZNE", depZone: NZ, arrZone: NZ, y, month, day, hour: 10, minute: 15, dur: 85, seats: 5, price: 275, aircraft: "HondaJet Elite · Tekapo service", label: "Lake Tekapo (return)" });
    }
  }

  return rows;
}
