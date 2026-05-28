import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { ScheduledFlight } from "@/models/ScheduledFlight";
import { toFlightDTO } from "@/lib/formatFlight";
import { okJson, errJson } from "@/lib/api/response";
import { readJsonBody } from "@/lib/api/readJson";

import { cancelBookingBodySchema } from "@/lib/validation/booking";
import { bookingReferenceSchema } from "@/lib/validation/reference";
import { computeTripPhase } from "@/lib/booking/tripPhase";
import { firstZodIssueMessage } from "@/lib/api/zodErrors";
import { normalizeEmail } from "@/lib/sanitize";

import { log } from "@/lib/logger";
import { syncCompletedBookingsForPassengerEmail } from "@/lib/booking/syncStatuses";

const FLIGHT_FIELDS = "flightNumber originIcao destIcao departureAt arrivalAt departureTimeZone arrivalTimeZone aircraftLabel seatCapacity seatsSold priceNzd serviceLabel";
const emailQuery = z.string().trim().min(1).email("Invalid email.");

type Ctx = { params: Promise<{ reference: string }> };

export async function GET(request: Request, { params }: Ctx)

{
  const { reference: rawRef } = await params;
  const refParsed = bookingReferenceSchema.safeParse(rawRef);
  if (!refParsed.success) return errJson("VALIDATION_ERROR", firstZodIssueMessage(refParsed.error), 400);

  const { searchParams } = new URL(request.url);
  const emailParsed = emailQuery.safeParse(searchParams.get("email") ?? "");
  if (!emailParsed.success) return errJson("VALIDATION_ERROR", firstZodIssueMessage(emailParsed.error), 400);

  const reference = refParsed.data;
  const email = normalizeEmail(emailParsed.data);

  try

  {
    await connectDB();
    await syncCompletedBookingsForPassengerEmail(email);

    const booking = await Booking.findOne({ bookingReference: reference, passengerEmail: email })
      .populate({ path: "scheduledFlight", select: FLIGHT_FIELDS })
      .lean();

    if (!booking) return errJson("NOT_FOUND", "No booking matches that reference and email.", 404);

    const flightDoc = booking.scheduledFlight as any;
    if (!flightDoc?._id)
    {
      log.unexpected("Booking has no populated flight", { reference });
      return errJson("DATA_ERROR", "Booking details incomplete.", 500);
    }

    const status = booking.status as "confirmed" | "cancelled" | "completed";
    return okJson({
      bookingReference: booking.bookingReference,
      status,
      tripPhase: computeTripPhase({ status, departureAt: new Date(flightDoc.departureAt) }),
      passenger: {
        title: booking.passengerTitle, givenName: booking.passengerGivenName,
        familyName: booking.passengerFamilyName, email: booking.passengerEmail,
      },
      priceNzd: booking.priceNzd,
      flight: toFlightDTO(flightDoc),
      createdAt: booking.createdAt,
      cancelledAt: booking.cancelledAt ?? null,
      completedAt: booking.completedAt ?? null,
    });
  } catch (err)
   {
    log.unexpected("GET /api/bookings/[ref]", err);
    return errJson("SERVER_ERROR", "Could not load booking.", 500);
  }
}



export async function DELETE(request: Request, { params }: Ctx) {
  const { reference: rawRef } = await params;
  const refParsed = bookingReferenceSchema.safeParse(rawRef);
  if (!refParsed.success) return errJson("VALIDATION_ERROR", firstZodIssueMessage(refParsed.error), 400);
  const rawBody = await readJsonBody<unknown>(request);
  if (!rawBody.ok) return rawBody.response;
  const parsed = cancelBookingBodySchema.safeParse(rawBody.body);
  if (!parsed.success) return errJson("VALIDATION_ERROR", firstZodIssueMessage(parsed.error), 422);
  const reference = refParsed.data;
  const email = normalizeEmail(parsed.data.passengerEmail);

  try {

    await connectDB();
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () =>
      {
        const booking = await Booking.findOne({
          bookingReference: reference, passengerEmail: email, status: "confirmed",
        }).populate({ path: "scheduledFlight", select: "departureAt" }).session(session);

        if (!booking) throw new Error("NOT_FOUND");


        const flight = booking.scheduledFlight as any;
        if (!flight?._id) throw new Error("SCHEDULE_MISMATCH");
        const depTime = new Date(flight.departureAt).getTime();
        if (isNaN(depTime) || depTime < Date.now()) throw new Error("ALREADY_DEPARTED");

        const updated = await ScheduledFlight.findOneAndUpdate(
          { _id: flight._id, seatsSold: { $gt: 0 } },
          { $inc: { seatsSold: -1 } },
          { returnDocument: "after", session },
        );
        if (!updated) throw new Error("SCHEDULE_MISMATCH");

        await Booking.updateOne(
          { _id: booking._id },
          { $set: { status: "cancelled", cancelledAt: new Date() } },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }


    return okJson({ message: "Booking cancelled." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "NOT_FOUND") return errJson("NOT_FOUND", "No active booking matches that reference and email.", 404);
    if (msg === "ALREADY_DEPARTED") return errJson("INVALID_STATE", "Flight has already departed.", 400);
    if (msg === "SCHEDULE_MISMATCH") return errJson("SERVER_ERROR", "Could not update the flight record.", 500);
    log.unexpected("DELETE /api/bookings/[ref]", err);
    return errJson("SERVER_ERROR", "Could not cancel booking. Try again.", 500);
  }
}
