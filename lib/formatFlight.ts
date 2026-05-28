import { DateTime } from "luxon";
import { AIRPORTS, type AirportCode } from "./airports";


export type ScheduledFlightDTO = {
  _id: string;
  flightNumber: string;
  originIcao: AirportCode;
  destIcao: AirportCode;
  originLabel: string;
  destLabel: string;
  departureAt: string;
  arrivalAt: string;
  departureLocal: string;
  arrivalLocal: string;
  departureTimeZone: string;
  arrivalTimeZone: string;
  aircraftLabel: string;
  seatCapacity: number;
  seatsAvailable: number;
  priceNzd: number;
  serviceLabel: string;
  durationMinutes: number;
};


export function toFlightDTO(doc: {
  _id: { toString(): string };
  flightNumber: string; originIcao: string; destIcao: string;
  departureAt: Date; arrivalAt: Date;
  departureTimeZone: string; arrivalTimeZone: string;
  aircraftLabel: string; seatCapacity: number; seatsSold: number;
  priceNzd: number; serviceLabel: string;
}): ScheduledFlightDTO {
  const origin = doc.originIcao as AirportCode;
  const dest = doc.destIcao as AirportCode;

  const dep = DateTime.fromJSDate(doc.departureAt, { zone: "utc" }).setZone(doc.departureTimeZone);
  const arr = DateTime.fromJSDate(doc.arrivalAt, { zone: "utc" }).setZone(doc.arrivalTimeZone);

  const mins = Math.round((doc.arrivalAt.getTime() - doc.departureAt.getTime()) / 60_000);

  return {
    _id: doc._id.toString(),
    flightNumber: doc.flightNumber,
    originIcao: origin,
    destIcao: dest,
    originLabel: `${AIRPORTS[origin]?.city ?? origin} (${origin})`,
    destLabel: `${AIRPORTS[dest]?.city ?? dest} (${dest})`,
    departureAt: doc.departureAt.toISOString(),
    arrivalAt: doc.arrivalAt.toISOString(),
    departureLocal: `${dep.toFormat("ccc d LLL yyyy, HH:mm")} ${dep.offsetNameShort}`,
    arrivalLocal: `${arr.toFormat("ccc d LLL yyyy, HH:mm")} ${arr.offsetNameShort}`,
    departureTimeZone: doc.departureTimeZone,
    arrivalTimeZone: doc.arrivalTimeZone,
    aircraftLabel: doc.aircraftLabel,
    seatCapacity: doc.seatCapacity,
    seatsAvailable: Math.max(0, doc.seatCapacity - doc.seatsSold),
    priceNzd: doc.priceNzd,
    serviceLabel: doc.serviceLabel,
    durationMinutes: mins,
  };
}
