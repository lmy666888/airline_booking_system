import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const schema = new Schema({
  flightNumber: { type: String, required: true, index: true },
  originIcao:   { type: String, required: true, index: true },
  destIcao:     { type: String, required: true, index: true },
  departureAt:  { type: Date,   required: true, index: true },
  arrivalAt:    { type: Date,   required: true },
  departureTimeZone: { type: String, required: true },
  arrivalTimeZone:   { type: String, required: true },
  aircraftLabel: { type: String, required: true },
  seatCapacity:  { type: Number, required: true, min: 1 },
  seatsSold:     { type: Number, required: true, default: 0, min: 0 },
  priceNzd:      { type: Number, required: true, min: 0 },
  serviceLabel:  { type: String, required: true },
}, { timestamps: true });

// prevent duplicate legs being inserted
schema.index({ flightNumber: 1, departureAt: 1 }, { unique: true });
schema.index({ originIcao: 1, destIcao: 1, departureAt: 1 });

export type ScheduledFlightDocument = InferSchemaType<typeof schema>;

export const ScheduledFlight: Model<ScheduledFlightDocument> =
  mongoose.models.ScheduledFlight ?? mongoose.model("ScheduledFlight", schema);
