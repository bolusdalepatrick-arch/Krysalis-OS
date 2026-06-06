import crypto from "node:crypto";

export function makeSessionToken(pin: string): string {
  return crypto.createHmac("sha256", pin).update("krysalis-session-v1").digest("hex");
}
