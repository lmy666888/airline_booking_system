//chars + trim
export function sanitizePlainText(input: string, maxLen: number) {
  return input.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, maxLen);
}

export function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

export function normalizeBookingReference(input: string) {
  return input.trim().toUpperCase().replace(/[^0-9A-Z]/g, "");
}
