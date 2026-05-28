
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const schema = new Schema({
  bookingReference: { type: String, required: true, unique: true, index: true },
  scheduledFlight: { type: Schema.Types.ObjectId, ref: "ScheduledFlight", required: true, index: true },
  passengerTitle:      { type: String, required: true },
  passengerGivenName:  { type: String, required: true },
  passengerFamilyName: { type: String, required: true },
  passengerEmail:      { type: String, required: true, lowercase: true, trim: true },
  status: { type: String, enum: ["confirmed", "cancelled", "completed"], default: "confirmed", index: true },
  priceNzd:    { type: Number, required: true, min: 0 },
  cancelledAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

schema.index({ passengerEmail: 1, status: 1 });
schema.index({ passengerEmail: 1, status: 1, createdAt: -1 });

export type BookingDocument = InferSchemaType<typeof schema>;

export const Booking: Model<BookingDocument> =
  mongoose.models.Booking ?? mongoose.model("Booking", schema);
