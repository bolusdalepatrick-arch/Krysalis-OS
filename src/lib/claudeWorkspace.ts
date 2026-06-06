// Claude agent workspace browser.
//
// Scratch root: ~/.krysalis-os/claude-projects/<project>/
// The /api/claude/chat endpoint pins `cwd` to a project under this root (default
// "claude-default") so anything Claude writes — HTML pages, scripts, generated
// assets, HyperFrames renders, Ultracode build output — lands somewhere the
// Workspace tab can browse + the preview route can serve.
//
// Same shape as freeClaudeWorkspace.ts / hermesWorkspace.ts so the iframe +
// Preview/Source toggle pattern is reusable.

import { readdir, readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { HmFileKind as ClaudeFileKind, HmFile as ClaudeFile, fileKind, SKIP_DIRS, safeStat } from "./workspaceUtils";

const HOME = os.homedir();
export const CLAUDE_SCRATCH_ROOT = process.env.AGENTIC_OS_CLAUDE_SCRATCH
  ?? path.join(HOME, ".krysalis-os", "claude-projects");

export interface ClaudeProject { name: string; root: string; mtime: number; fileCount: number; }
export type { ClaudeFileKind, ClaudeFile };

async function countFiles(dir: string, depth = 4): Promise<number> {
  if (depth < 0) return 0;
  let n = 0;
  try {
    const items = await readdir(dir, { withFileTypes: true });
    for (const it of items) {
      if (SKIP_DIRS.has(it.name)) continue;
      const full = path.join(dir, it.name);
      if (it.isFile()) n++;
      else if (it.isDirectory()) n += await countFiles(full, depth - 1);
    }
  } catch { /* ignore */ }
  return n;
}

export async function ensureScratchRoot(): Promise<void> {
  if (!existsSync(CLAUDE_SCRATCH_ROOT)) await mkdir(CLAUDE_SCRATCH_ROOT, { recursive: true });
}

export async function ensureProject(name: string): Promise<string | null> {
  if (!/^[A-Za-z0-9_.-]+$/.test(name)) return null;
  await ensureScratchRoot();
  const dir = path.join(CLAUDE_SCRATCH_ROOT, name);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  return dir;
}

export async function listProjects(): Promise<ClaudeProject[]> {
  if (!existsSync(CLAUDE_SCRATCH_ROOT)) return [];
  const out: ClaudeProject[] = [];
  try {
    const items = await readdir(CLAUDE_SCRATCH_ROOT, { withFileTypes: true });
    for (const it of items) {
      if (!it.isDirectory()) continue;
      const full = path.join(CLAUDE_SCRATCH_ROOT, it.name);
      const st = await safeStat(full);
      if (!st) continue;
      const fileCount = await countFiles(full);
      out.push({ name: it.name, root: full, mtime: st.mtimeMs, fileCount });
    }
  } catch { /* ignore */ }
  out.sort((a, b) => b.mtime - a.mtime);
  return out;
}

export async function listProjectFiles(project: string, maxFiles = 200): Promise<{ root: string; files: ClaudeFile[] } | null> {
  if (!/^[A-Za-z0-9_.-]+$/.test(project)) return null;
  const projectRoot = path.join(CLAUDE_SCRATCH_ROOT, project);
  if (!existsSync(projectRoot)) return null;

  const out: ClaudeFile[] = [];
  async function walk(dir: string, depth: number) {
    if (out.length >= maxFiles || depth > 5) return;
    let items;
    try { items = await readdir(dir, { withFileTypes: true }); }
    catch { return; }
    for (const it of items) {
      if (out.length >= maxFiles) break;
      if (SKIP_DIRS.has(it.name)) continue;
      const full = path.join(dir, it.name);
      if (it.isDirectory()) {
        await walk(full, depth + 1);
      } else if (it.isFile()) {
        const st = await safeStat(full);
        if (!st) continue;
        const kind = fileKind(it.name);
        out.push({
          name: it.name,
          relPath: path.relative(projectRoot, full),
          bytes: st.size,
          mtime: st.mtimeMs,
          isText: kind === "text",
          kind,
        });
      }
    }
  }
  await walk(projectRoot, 0);
  out.sort((a, b) => b.mtime - a.mtime);
  return { root: projectRoot, files: out };
}

export async function readProjectFile(project: string, relPath: string): Promise<{ path: string; content: string; bytes: number; mtime: number; truncated: boolean } | null> {
  if (!/^[A-Za-z0-9_.-]+$/.test(project)) return null;
  const base = path.join(CLAUDE_SCRATCH_ROOT, project);
  const abs = path.resolve(base, relPath);
  if (abs !== base && !abs.startsWith(base + path.sep)) return null;

  const st = await safeStat(abs);
  if (!st || !st.isFile()) return null;
  const MAX = 1_000_000;
  const truncated = st.size > MAX;
  const buf = await readFile(abs);
  const trimmed = truncated ? buf.subarray(0, MAX) : buf;
  return { path: relPath, content: trimmed.toString("utf8"), bytes: st.size, mtime: st.mtimeMs, truncated };
}
