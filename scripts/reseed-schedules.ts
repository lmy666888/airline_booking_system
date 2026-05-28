
import path from "node:path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { ScheduledFlight } from "../models/ScheduledFlight";

import { Booking } from "../models/Booking";
import { SCHEDULE_RANGE, buildSchedule } from "./scheduleData";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();
const resetBookings = process.argv.includes("--reset-bookings");
const schedulesOnly = process.argv.includes("--schedules-only");

async function main()
{
  if (resetBookings && schedulesOnly) throw new Error("Pick one of --reset-bookings or --schedules-only.");

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri);
  const bookingCount = await Booking.countDocuments();

  if (schedulesOnly)
   {
    console.warn("[reseed] --schedules-only: deleting flights without touching bookings");
    await ScheduledFlight.deleteMany({});
  } else if (resetBookings)
  {
    console.log("[reseed] --reset-bookings: clearing everything");
    await Booking.deleteMany({});
    await ScheduledFlight.deleteMany({});
  } else if (bookingCount > 0) {
    console.error(`[reseed] Found ${bookingCount} booking(s). Use --reset-bookings or --schedules-only.`);
    await mongoose.disconnect();
    process.exit(1);
  } else {
    console.log("[reseed] No bookings, replacing schedules");
    await ScheduledFlight.deleteMany({});
  }
  const rows = buildSchedule();
  await ScheduledFlight.insertMany(rows, { ordered: false });



  const { start: s, end: e } = SCHEDULE_RANGE;
  console.log(`[reseed] Inserted ${rows.length} flights (${s.year}-${String(s.month).padStart(2,"0")}-${String(s.day).padStart(2,"0")} to ${e.year}-${String(e.month).padStart(2,"0")}-${String(e.day).padStart(2,"0")})`);
  await mongoose.disconnect();
}



main().catch((err) => { console.error(err); process.exit(1); });
