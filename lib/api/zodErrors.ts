import type { ZodError } from "zod";

export function firstZodIssueMessage(error: ZodError) {
  return error.issues[0]?.message ?? "Please check your input and try again.";
}
