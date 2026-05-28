export type AirportCode = "NZNE" | "YSSY" | "NZRO" | "NZGB" | "NZCI" | "NZTL";


export const AIRPORTS: Record<AirportCode, { name: string; city: string; tz: string }> = {
  NZNE: { name: "Dairy Flat Airport", city: "Dairy Flat", tz: "Pacific/Auckland" },
  YSSY: { name: "Sydney Kingsford Smith", city: "Sydney", tz: "Australia/Sydney" },
  NZRO: { name: "Rotorua Regional", city: "Rotorua", tz: "Pacific/Auckland" },
  NZGB: { name: "Claris (Great Barrier Island)", city: "Claris", tz: "Pacific/Auckland" },
  NZCI: { name: "Tuuta (Chatham Islands)", city: "Tuuta", tz: "Pacific/Chatham" },
  NZTL: { name: "Lake Tekapo", city: "Tekapo", tz: "Pacific/Auckland" },
};
