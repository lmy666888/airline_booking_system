import { DateTime } from "luxon";
import { connectDB } from "@/lib/db";
import { ScheduledFlight } from "@/models/ScheduledFlight";

import { toFlightDTO } from "@/lib/formatFlight";
import { okJson, errJson } from "@/lib/api/response"

import { schedulesQuerySchema } from "@/lib/validation/schedules";
import { firstZodIssueMessage } from "@/lib/api/zodErrors";
import { log } from "@/lib/logger";

const HUB_ZONE = "Pacific/Auckland";

const FIELDS = "flightNumber originIcao destIcao departureAt arrivalAt departureTimeZone arrivalTimeZone aircraftLabel seatCapacity seatsSold priceNzd serviceLabel";

export async function GET(request: Request)
{
  try {
    const { searchParams } = new URL(request.url);
    const parsed = schedulesQuerySchema.safeParse({
      date1: searchParams.get("date1") ?? "",
      date2: searchParams.get("date2") ?? "",
      orig: searchParams.get("orig") ?? undefined,
      dest: searchParams.get("dest") ?? undefined,
    });
    if (!parsed.success) return errJson("VALIDATION_ERROR", firstZodIssueMessage(parsed.error), 422);

    const { date1, date2, orig, dest } = parsed.data;

    //convert NZ hub calendar dates to UTC
    const startUtc = DateTime.fromISO(date1, { zone: HUB_ZONE }).startOf("day").toUTC().toJSDate();
    const endUtc = DateTime.fromISO(date2, { zone: HUB_ZONE }).endOf("day").toUTC().toJSDate();
    await connectDB();

    const filter: Record<string, unknown> = { departureAt: { $gte: startUtc, $lte: endUtc } };
    if (orig) filter.originIcao = orig;
    if (dest) filter.destIcao = dest;

    const docs = await ScheduledFlight.find(filter).select(FIELDS).sort({ departureAt: 1 }).lean();
    return okJson({ schedules: docs.map(toFlightDTO) });
  } catch (err) {
    log.unexpected("GET /api/schedules", err);
    return errJson("SERVER_ERROR", "Could not load schedules. Try again shortly.", 500);
  }
}
