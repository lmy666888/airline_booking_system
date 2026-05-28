import path from "node:path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { ScheduledFlight } from "../models/ScheduledFlight";

import { Booking } from "../models/Booking";
import { SCHEDULE_RANGE, buildSchedule } from "./scheduleData";


dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

async function main()
{
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  await mongoose.connect(uri);

  await Booking.deleteMany({});
  await ScheduledFlight.deleteMany({});

  const rows = buildSchedule();
  await ScheduledFlight.insertMany(rows, { ordered: false });

  const { start, end } = SCHEDULE_RANGE;
  console.log(`Inserted ${rows.length} flights (${start.year}-${String(start.month).padStart(2, "0")}-${String(start.day).padStart(2, "0")} to ${end.year}-${String(end.month).padStart(2, "0")}-${String(end.day).padStart(2, "0")})`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
