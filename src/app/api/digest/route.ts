import { NextResponse } from "next/server";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { config, CLAUDE_MODEL } from "@/lib/config";
import { listNotes, VAULT_ROOT } from "@/lib/vault";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";

export async function GET() {
  if (!VAULT_ROOT) {
    return NextResponse.json({ error: "Vault not configured" }, { status: 400 });
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const briefingsDir = path.join(VAULT_ROOT, "Briefings");
  if (!existsSync(briefingsDir)) mkdirSync(briefingsDir, { recursive: true });

  const digestFile = path.join(briefingsDir, `${todayStr}.md`);

  if (existsSync(digestFile)) {
    const content = readFileSync(digestFile, "utf8");
    return NextResponse.json({ content, cached: true });
  }

  return NextResponse.json({ content: null, cached: false });
}

export async function POST() {
  if (!VAULT_ROOT) {
    return NextResponse.json({ error: "Vault not configured" }, { status: 400 });
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const briefingsDir = path.join(VAULT_ROOT, "Briefings");
  if (!existsSync(briefingsDir)) mkdirSync(briefingsDir, { recursive: true });
  const digestFile = path.join(briefingsDir, `${todayStr}.md`);

  try {
    const files = await listNotes(6);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startMs = startOfDay.getTime();

    const recentContents: string[] = [];
    for (const f of files) {
      if (f.includes("Briefings")) continue;
      try {
        const s = await stat(f);
        if (s.mtimeMs >= startMs - 86400000) { // last 24h
          const c = readFileSync(f, "utf8");
          recentContents.push(`--- FILE: ${path.basename(f)} ---\n${c.slice(0, 1000)}`);
        }
      } catch {}
    }

    if (recentContents.length === 0) {
      const empty = "No recent activity found to summarize today.";
      writeFileSync(digestFile, empty, "utf8");
      return NextResponse.json({ content: empty });
    }

    const context = recentContents.join("\n\n").slice(0, 15000);
    const prompt = `You are the Krysalis OS Daily Summary Service. 
Based on the following recent notes/journals/goals updated in the last 24 hours, write a concise, professional daily executive summary. 
Keep it under 3 paragraphs. Focus on key achievements, unresolved tasks, and important thoughts.

Data:
${context}`;

    if (!config.claude) {
      const err = "Claude CLI not configured, cannot generate digest.";
      writeFileSync(digestFile, err, "utf8");
      return NextResponse.json({ content: err });
    }

    const tmpFile = path.join(os.tmpdir(), `krysalis-digest-${Date.now()}.txt`);
    writeFileSync(tmpFile, prompt, "utf8");

    const { stdout } = await execFileAsync(config.claude, [
      "-m", CLAUDE_MODEL,
      "-p", tmpFile
    ], { encoding: "utf8" });

    const digest = stdout.trim();
    writeFileSync(digestFile, digest, "utf8");

    return NextResponse.json({ content: digest, cached: false });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
