export type TripPhase = "upcoming" | "completed" | "cancelled";

export function computeTripPhase(input: {
  status: "confirmed" | "cancelled" | "completed";
  departureAt: Date;
}): TripPhase {
  if (input.status === "cancelled") return "cancelled";
  if (input.status === "completed") return "completed";
  return input.departureAt.getTime() < Date.now() ? "completed" : "upcoming";
}
