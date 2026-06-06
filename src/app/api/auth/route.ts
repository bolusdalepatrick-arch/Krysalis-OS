import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { makeSessionToken } from "@/lib/session";
import { cookies } from "next/headers";

// In-memory rate limiter: ip → { count, resetAt }
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "local";
  const now = Date.now();

  const record = attempts.get(ip);
  if (record) {
    if (now < record.resetAt) {
      if (record.count >= MAX_ATTEMPTS) {
        return NextResponse.json({ ok: false, error: "Too many attempts" }, { status: 429 });
      }
      record.count++;
    } else {
      attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    }
  } else {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }

  const body = await req.json().catch(() => ({}));
  const { pin } = body as { pin?: unknown };

  if (typeof pin !== "string" || !pin) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (config.pinCode && pin === config.pinCode) {
    const token = makeSessionToken(config.pinCode);
    const cookieStore = await cookies();
    cookieStore.set("krysalis_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax",
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}
