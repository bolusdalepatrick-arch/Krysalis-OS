import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";

export const runtime = "nodejs";

const cfgPath = path.join(os.homedir(), ".krysalis-os", "config.json");

export async function GET() {
  let cfg = {};
  if (existsSync(cfgPath)) {
    try {
      cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
    } catch {}
  }
  return NextResponse.json(cfg);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let current = {};
    if (existsSync(cfgPath)) {
      try {
        current = JSON.parse(readFileSync(cfgPath, "utf8"));
      } catch {}
    }
    const nextCfg = { ...current, ...body };
    const dir = path.dirname(cfgPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(cfgPath, JSON.stringify(nextCfg, null, 2), "utf8");
    return NextResponse.json({ success: true, config: nextCfg });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
