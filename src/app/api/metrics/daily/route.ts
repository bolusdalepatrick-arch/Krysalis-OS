import { NextResponse } from "next/server";
import { listNotes, VAULT_ROOT } from "@/lib/vault";
import { stat } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!VAULT_ROOT) {
    return NextResponse.json({ chats: 0, goals: 0, journal: 0 });
  }

  try {
    const files = await listNotes(6);
    let chats = 0;
    let goals = 0;
    let journal = 0;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startMs = startOfDay.getTime();

    for (const f of files) {
      try {
        const s = await stat(f);
        if (s.mtimeMs >= startMs) {
          const lower = f.toLowerCase();
          if (lower.includes("memories") || lower.includes("chat")) chats++;
          else if (lower.includes("goal")) goals++;
          else if (lower.includes("journal")) journal++;
        }
      } catch {
        continue;
      }
    }

    return NextResponse.json({ chats, goals, journal });
  } catch (err) {
    return NextResponse.json({ chats: 0, goals: 0, journal: 0 });
  }
}
