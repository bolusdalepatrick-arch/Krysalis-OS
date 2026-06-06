import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { config } from "@/lib/config";
import fs from "fs";

const execAsync = promisify(exec);

export async function POST() {
  const vault = config.vaultRoot;
  
  if (!vault || !fs.existsSync(vault)) {
    return NextResponse.json({ error: "Vault root not configured or not found" }, { status: 400 });
  }

  try {
    // Check if vault is a git repository
    const gitDir = `${vault}/.git`;
    if (!fs.existsSync(gitDir)) {
      return NextResponse.json({ error: "Vault is not a git repository. Please initialize it first with 'git init'." }, { status: 400 });
    }

    const { stdout: status } = await execAsync("git status --porcelain", { cwd: vault });
    
    if (!status.trim()) {
      return NextResponse.json({ ok: true, message: "Vault is already up to date." });
    }

    await execAsync("git add .", { cwd: vault });
    const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    await execAsync(`git commit -m "Krysalis OS Auto-Backup: ${timestamp}"`, { cwd: vault });
    
    try {
      await execAsync("git push", { cwd: vault });
      return NextResponse.json({ ok: true, message: "Vault backed up and pushed successfully." });
    } catch (e) {
      // If push fails, it's still committed locally
      return NextResponse.json({ ok: true, message: "Committed locally, but failed to push to remote." });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
