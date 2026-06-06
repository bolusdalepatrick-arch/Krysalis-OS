import { NextResponse } from "next/server";
import { listNotes, searchOmi, VAULT_ROOT } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!VAULT_ROOT) {
    return NextResponse.json({ omi: 0, notes: 0, ok: false });
  }

  try {
    // searchOmi with empty string returns everything
    const [notesList, omiList] = await Promise.all([
      listNotes(6),
      searchOmi("", 99999)
    ]);
    
    return NextResponse.json({
      omi: omiList.length,
      notes: notesList.length,
      ok: true
    });
  } catch (err) {
    return NextResponse.json({ omi: 0, notes: 0, ok: false });
  }
}
