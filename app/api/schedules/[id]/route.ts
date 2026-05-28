import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { ScheduledFlight } from "@/models/ScheduledFlight";
import { toFlightDTO } from "@/lib/formatFlight";

import { okJson, errJson } from "@/lib/api/response";
import { log } from "@/lib/logger";

const FIELDS = "flightNumber originIcao destIcao departureAt arrivalAt departureTimeZone arrivalTimeZone aircraftLabel seatCapacity seatsSold priceNzd serviceLabel";
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id))
  {
    return errJson("INVALID_ID", "Not a valid flight id.", 400);
  }

  try {
    await connectDB();
    const doc = await ScheduledFlight.findById(id).select(FIELDS).lean();
    if (!doc) return errJson("NOT_FOUND", "Flight not found.", 404);
    return okJson({ schedule: toFlightDTO(doc) });
  } catch (err) {
    log.unexpected("GET /api/schedules/[id]", err);
    return errJson("SERVER_ERROR", "Could not load flight details.", 500);
  }
}
