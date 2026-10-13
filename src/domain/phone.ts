// Kenyan mobile numbers (REQUIREMENTS.md KM-2). Numbers are stored in E.164 (+2547XXXXXXXX or
// +2541XXXXXXXX). Network prefixes are NOT used to reject numbers: numbers can be ported.

const KENYAN_MOBILE = /^(?:\+?254|0)?([17]\d{8})$/;

/** Accepts 0712 345 678, +254 712-345-678, 254712345678, 712345678 … Returns E.164 or null. */
export function normalizeKenyanMobile(input: string): string | null {
  const compact = input.trim().replace(/[\s\-().]/g, "");
  const match = KENYAN_MOBILE.exec(compact);
  return match?.[1] ? `+254${match[1]}` : null;
}

export function isKenyanMobile(input: string): boolean {
  return normalizeKenyanMobile(input) !== null;
}

/** +254712345678 → "0712 345 678" (display format). */
export function formatKenyanMobile(e164: string): string {
  const local = e164.replace(/^\+254/, "0");
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

/** +254712345678 → "254712345678" (M-Pesa MSISDN format, no plus). */
export function toMpesaMsisdn(e164: string): string {
  return e164.replace(/^\+/, "");
}

/** +254712345678 → "2547****678", for logs (NFR-PRIV-4). */
export function maskPhone(e164: string): string {
  const digits = toMpesaMsisdn(e164);
  return `${digits.slice(0, 4)}****${digits.slice(-3)}`;
}
