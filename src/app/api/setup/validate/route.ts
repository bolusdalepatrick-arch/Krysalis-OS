import { NextResponse } from "next/server";
import { stat } from "node:fs/promises";

export async function POST(req: Request) {
  try {
    const { vaultRoot } = await req.json();
    if (!vaultRoot) return NextResponse.json({ ok: false, error: "Missing path" });
    const s = await stat(vaultRoot);
    if (s.isDirectory()) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: "Path is not a directory" });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Path does not exist" });
  }
}
