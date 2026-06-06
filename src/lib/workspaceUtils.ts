import { stat, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export interface BucketDef {
  id: string;
  label: string;
  paths: string[];
  description: string;
  kindsAllow?: HmFileKind[];
  extsAllow?: string[];
  maxDepth?: number;
}

export interface HmProject {
  id: string;
  label: string;
  description: string;
  mtime: number;
  fileCount: number;
  roots: string[];
}

export type HmFileKind = "text" | "image" | "video" | "audio" | "pdf" | "binary";

export interface HmFile {
  name: string;
  relPath: string;
  bytes: number;
  mtime: number;
  isText: boolean;
  kind: HmFileKind;
}

export const TEXT_EXTS = new Set([
  ".md", ".markdown", ".txt", ".json", ".yaml", ".yml", ".html", ".htm",
  ".css", ".js", ".ts", ".tsx", ".jsx", ".py", ".sh", ".log", ".csv", ".tsv",
  ".xml", ".toml", ".env", ".svg", ".rs", ".go", ".rb",
]);

export const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif", ".bmp", ".tiff"]);
export const VIDEO_EXTS = new Set([".mp4", ".webm", ".mov", ".m4v", ".mkv"]);
export const AUDIO_EXTS = new Set([".mp3", ".wav", ".m4a", ".ogg", ".aac", ".flac", ".opus"]);

export function fileKind(name: string): HmFileKind {
  const ext = path.extname(name).toLowerCase();
  if (IMAGE_EXTS.has(ext)) return "image";
  if (VIDEO_EXTS.has(ext)) return "video";
  if (AUDIO_EXTS.has(ext)) return "audio";
  if (ext === ".pdf") return "pdf";
  if (TEXT_EXTS.has(ext)) return "text";
  return "binary";
}

export const SKIP_DIRS = new Set([
  ".git", "node_modules", ".venv", "__pycache__", ".next", "dist", "build",
  ".openclaw", "state", "memory",
]);

export async function safeStat(p: string) {
  try { return await stat(p); } catch { return null; }
}

export function resolveBucketFile(buckets: BucketDef[], id: string, relPath: string): string | null {
  const def = buckets.find((b) => b.id === id);
  if (!def) return null;
  for (const root of def.paths) {
    if (!existsSync(root)) continue;
    const abs = path.resolve(root, relPath);
    if (abs === root || abs.startsWith(root + path.sep)) {
      if (existsSync(abs)) return abs;
    }
  }
  return null;
}

export async function readBucketFile(buckets: BucketDef[], id: string, relPath: string): Promise<{ path: string; content: string; bytes: number; mtime: number; truncated: boolean } | null> {
  const abs = resolveBucketFile(buckets, id, relPath);
  if (!abs) return null;
  const st = await safeStat(abs);
  if (!st || !st.isFile()) return null;
  const MAX = 1_000_000;
  const truncated = st.size > MAX;
  const buf = await readFile(abs);
  const trimmed = truncated ? buf.subarray(0, MAX) : buf;
  return { path: relPath, content: trimmed.toString("utf8"), bytes: st.size, mtime: st.mtimeMs, truncated };
}
