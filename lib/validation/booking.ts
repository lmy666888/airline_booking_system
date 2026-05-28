import { z } from "zod";



const title = z.string().trim().min(1, "Title is required.").max(20, "Title is too long.");
const namePart = z.string().trim().min(1, "This field is required.").max(80, "Too long.");

const email = z.string().trim().min(1, "Email is required.").max(254).email("Invalid email address.");

const objectId = z.string().trim().regex(/^[a-f\d]{24}$/i, "Invalid flight selection.");

export const createBookingBodySchema = z.object({
  scheduledFlightId: objectId,
  passengerTitle: title,
  passengerGivenName: namePart,
  passengerFamilyName: namePart,
  passengerEmail: email,
});

export const cancelBookingBodySchema = z.object({
  passengerEmail: email,
});

export const passengerLookupQuerySchema = z.object({
  email,
  familyName: z.preprocess(
    (v) => (v === undefined || v === null || String(v).trim() === "" ? undefined : String(v).trim()),
    z.string().min(1).max(80).optional(),
  ),
});
