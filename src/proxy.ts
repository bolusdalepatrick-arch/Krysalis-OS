import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Reproduce the same HMAC token that auth/route.ts generates.
// Uses Web Crypto (available in Edge runtime) — no Node.js imports.
async function makeSessionToken(pin: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("krysalis-session-v1"));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(req: NextRequest) {
  const pin = process.env.AGENTIC_OS_PIN;

  // No PIN configured → app is open; pass through.
  if (!pin) return NextResponse.next();

  // /api/auth is always public (it's how you log in).
  if (req.nextUrl.pathname === "/api/auth") return NextResponse.next();

  const token = req.cookies.get("krysalis_auth")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expected = await makeSessionToken(pin);
  if (token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
