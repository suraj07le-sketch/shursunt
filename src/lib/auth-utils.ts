import crypto from "crypto";

/**
 * Converts an email address into a deterministic UUID using SHA-256
 * to guarantee PostgreSQL `uuid` type compatibility.
 */
export function emailToUuid(email: string): string {
  const hash = crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-a${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
}

/**
 * Generates a random 6-digit numeric OTP code string (e.g. "849201")
 */
export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}
