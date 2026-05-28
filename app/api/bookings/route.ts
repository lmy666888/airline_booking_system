import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { ScheduledFlight } from "@/models/ScheduledFlight";
import { Booking } from "@/models/Booking";
import { createBookingReference } from "@/lib/bookingRef";
import { toFlightDTO } from "@/lib/formatFlight";
import { okJson, errJson } from "@/lib/api/response";

import { readJsonBody } from "@/lib/api/readJson";
import { createBookingBodySchema } from "@/lib/validation/booking";
import { firstZodIssueMessage } from "@/lib/api/zodErrors";
import { sanitizePlainText, normalizeEmail } from "@/lib/sanitize";

import { log } from "@/lib/logger";

export async function POST(request: Request)
{
  const raw = await readJsonBody<unknown>(request);
  if (!raw.ok) return raw.response;
  const parsed = createBookingBodySchema.safeParse(raw.body);
  if (!parsed.success) return errJson("VALIDATION_ERROR", firstZodIssueMessage(parsed.error), 422);
  const { scheduledFlightId, passengerTitle, passengerGivenName, passengerFamilyName, passengerEmail } = parsed.data;
  const email = normalizeEmail(passengerEmail);
  const title = sanitizePlainText(passengerTitle, 24);
  const given = sanitizePlainText(passengerGivenName, 80);
  const family = sanitizePlainText(passengerFamilyName, 80);

  try {
    await connectDB();
    const session = await mongoose.startSession();
    let result: { ref: string; flight: Record<string, unknown> } | null = null;

    try {
      result = await session.withTransaction(async () => {
        //to atomicaly check capacity and increment seatsSold
        const updated = await ScheduledFlight.findOneAndUpdate(
          {
            _id: scheduledFlightId,
            departureAt: { $gt: new Date() },
            $expr: { $lt: ["$seatsSold", "$seatCapacity"] },
          },
          { $inc: { seatsSold: 1 } },
          { returnDocument: "after", session },
        ).lean();
        if (!updated) throw new Error("FULL_OR_MISSING");

        const ref = createBookingReference();
        await Booking.create([{
          bookingReference: ref,
          scheduledFlight: updated._id,
          passengerTitle: title, passengerGivenName: given,
          passengerFamilyName: family, passengerEmail: email,
          status: "confirmed", priceNzd: updated.priceNzd,
        }], { session });


        return { ref, flight: updated as Record<string, unknown> };
      });
    } finally

    {
      await session.endSession();
    }

    if (!result) return errJson("TRANSACTION_FAILED", "Booking failed. Please try again.", 500);
    const flight = result.flight as any;
    return okJson({
      bookingReference: result.ref,
      invoice: {
        bookingReference: result.ref,
        passenger: { title, givenName: given, familyName: family, email },
        flight: toFlightDTO(flight),
        priceNzd: flight.priceNzd,
      },
    });
  } catch (err)
  {
    if (err instanceof Error && err.message === "FULL_OR_MISSING") {
      return errJson("FLIGHT_UNAVAILABLE", "This flight is full or has already departed.", 409);
    }
    log.unexpected("POST /api/bookings", err);
    return errJson("SERVER_ERROR", "Could not complete your booking. Try again shortly.", 500);
  }
}
