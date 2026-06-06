import { NextResponse } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const logDir = path.join(os.homedir(), ".krysalis", "logs");
    await mkdir(logDir, { recursive: true });
    
    const logPath = path.join(logDir, "ui-errors.log");
    const entry = `[${new Date().toISOString()}] ${body.type || "ERROR"}: ${body.message}\n${body.stack || ""}\n\n`;
    
    await appendFile(logPath, entry, "utf8");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to write to UI error log", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
