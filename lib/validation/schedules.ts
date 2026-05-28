import { z } from "zod";


const dateIso = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD.");
const optionalIcao = z.preprocess((v) =>
{
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length === 0 ? undefined : s.toUpperCase();
}, z.string().length(4).regex(/^[A-Z]{4}$/, "Must be a 4-letter ICAO code.").optional());



export const schedulesQuerySchema = z.object({
  date1: dateIso,
  date2: dateIso,
  orig: optionalIcao,
  dest: optionalIcao,
}).superRefine((val, ctx) => {
  if (val.date1 > val.date2) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start date must be before end date.", path: ["date2"] });
  }
});
export const scheduleIdParamSchema = z.object({
  id: z.string().trim().regex(/^[a-f\d]{24}$/i, "Invalid schedule id."),
});
