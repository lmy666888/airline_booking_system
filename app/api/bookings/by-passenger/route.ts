import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { toFlightDTO } from "@/lib/formatFlight";
import { okJson, errJson } from "@/lib/api/response";
import { passengerLookupQuerySchema } from "@/lib/validation/booking";
import { firstZodIssueMessage } from "@/lib/api/zodErrors";
import { normalizeEmail } from "@/lib/sanitize";

import { syncCompletedBookingsForPassengerEmail } from "@/lib/booking/syncStatuses";
import { computeTripPhase } from "@/lib/booking/tripPhase";
import { log } from "@/lib/logger";

function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
const FLIGHT_FIELDS = "flightNumber originIcao destIcao departureAt arrivalAt departureTimeZone arrivalTimeZone aircraftLabel seatCapacity seatsSold priceNzd serviceLabel";


export async function GET(request: Request)
{
  const { searchParams } = new URL(request.url);
  const parsed = passengerLookupQuerySchema.safeParse({
    email: searchParams.get("email") ?? "",
    familyName: searchParams.get("familyName") ?? undefined,
  });
  if (!parsed.success) return errJson("VALIDATION_ERROR", firstZodIssueMessage(parsed.error), 422);
  const email = normalizeEmail(parsed.data.email);

  try
  {
    await connectDB();
    await syncCompletedBookingsForPassengerEmail(email);

    // show all bookings for this passenger (confirmed, cancelled, completed
    const filter: Record<string, unknown> = { passengerEmail: email };
    if (parsed.data.familyName)
    {

      filter.passengerFamilyName = new RegExp(`^${escapeRe(parsed.data.familyName)}$`, "i");
    }

    const bookings = await Booking.find(filter)
      .populate({ path: "scheduledFlight", select: FLIGHT_FIELDS })
      .sort({ createdAt: -1 }).lean();

    const results = bookings.map((b) => {

      const f = b.scheduledFlight as any;
      if (!f?._id) return null;
      const status = b.status as "confirmed" | "cancelled" | "completed";
      return {
        bookingReference: b.bookingReference, status,
        tripPhase: computeTripPhase({ status, departureAt: new Date(f.departureAt) }),
        passenger:
    {
          title: b.passengerTitle, givenName: b.passengerGivenName,
          familyName: b.passengerFamilyName, email: b.passengerEmail,
        },
        priceNzd: b.priceNzd,
        flight: toFlightDTO(f),
        createdAt: b.createdAt,
      };
    }).filter(Boolean);

    return okJson({ bookings: results });
  } catch (err) {
    log.unexpected("GET /api/bookings/by-passenger", err);
    return errJson("SERVER_ERROR", "Could not load bookings.", 500);
  }
}
