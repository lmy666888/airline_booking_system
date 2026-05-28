import { Booking } from "@/models/Booking";
import { ScheduledFlight } from "@/models/ScheduledFlight";

export async function syncCompletedBookingsForPassengerEmail(email: string) {
  const now = new Date();
  const candidates = await Booking.find({ passengerEmail: email, status: "confirmed" })
    .select("_id scheduledFlight")
    .lean();
  if (candidates.length === 0) {
    return;
  }
  const flightIds = [...new Set(candidates.map((c) => String(c.scheduledFlight)))];
  const pastFlights = await ScheduledFlight.find({
    _id: { $in: flightIds },
    departureAt: { $lt: now },
  })
    .select("_id")
    .lean();

  const past = new Set(pastFlights.map((f) => String(f._id)));
  const bookingIds = candidates
    .filter((c) => past.has(String(c.scheduledFlight)))
    .map((c) => c._id);

  if (bookingIds.length === 0) {
    return;
  }

  await Booking.updateMany(
    { _id: { $in: bookingIds } },
    { $set: { status: "completed", completedAt: now } },
  );
}
