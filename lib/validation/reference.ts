
import { z } from "zod";

const REF_REGEX = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{10}$/;

export const bookingReferenceSchema = z
  .string()
  .trim()
  .transform((s) => s.toUpperCase().replace(/[^0-9A-Z]/g, ""))
  .refine((s) => REF_REGEX.test(s), "Invalid booking reference format.");
