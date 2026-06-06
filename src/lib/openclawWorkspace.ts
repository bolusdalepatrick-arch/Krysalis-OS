// OpenClaw Agent workspace browser — same pattern as Hermes.
//
// OpenClaw scatters outputs across:
//
//   ~/.openclaw/workspace/                       — main agent scratch
//   ~/.openclaw/workspace-krysalisos/                — krysalisos agent scratch
//   ~/.openclaw/workspace-marketing/             — marketing agent scratch
//   ~/.openclaw/skills/                          — installed skills (markdown + assets)
//   ~/.openclaw/flows/                           — saved flow YAML/JSON
//   ~/.openclaw/canvas/                          — canvas drawings + HTML
//   ~/.openclaw/claw3d/                          — 3D scenes
//   ~/.openclaw/tasks/                           — task records
//   ~/.openclaw/cron/                            — scheduled tasks
//   ~/.openclaw/logs/                            — log files
//
// We model each as a virtual bucket. Click bucket → see files → click file → inline preview.

import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { BucketDef, HmProject, HmFileKind, HmFile, fileKind, SKIP_DIRS, safeStat, resolveBucketFile as resolveUtils, readBucketFile as readUtils } from "./workspaceUtils";

const HOME = os.homedir();
export const OPENCLAW_ROOT = path.join(HOME, ".openclaw");

// Bucket = a named output directory the UI presents as a "project".

const BUCKETS: BucketDef[] = [
  // Studio output buckets — populated by Grok image/video/TTS via the Studio tab.
  // These come first so they're top-of-mind right after a generate run.
  {
    id: "studio-images",
    label: "Studio · Images",
    paths: [path.join(OPENCLAW_ROOT, "studio", "images")],
    description: "Grok-generated images. Created via the Studio tab.",
    kindsAllow: ["image"],
    maxDepth: 1,
  },
  {
    id: "studio-videos",
    label: "Studio · Videos",
    paths: [path.join(OPENCLAW_ROOT, "studio", "videos")],
    description: "Grok-generated videos. Created via the Studio tab.",
    kindsAllow: ["video"],
    maxDepth: 1,
  },
  {
    id: "studio-audio",
    label: "Studio · Voice",
    paths: [path.join(OPENCLAW_ROOT, "studio", "audio")],
    description: "Grok TTS clips. Created via the Studio tab.",
    kindsAllow: ["audio"],
    maxDepth: 1,
  },
  {
    id: "apps",
    label: "Apps",
    // HTML the OpenClaw agents build — calculators, dashboards, mock-ups.
    // Strict ext filter so we don't pick up identity / config markdown.
    paths: [
      path.join(OPENCLAW_ROOT, "workspace"),
      path.join(OPENCLAW_ROOT, "workspace-krysalisos"),
      path.join(OPENCLAW_ROOT, "workspace-marketing"),
      path.join(OPENCLAW_ROOT, "canvas"),
    ],
    description: "HTML apps + pages OpenClaw built. Click any → renders live.",
    extsAllow: [".html", ".htm"],
    maxDepth: 2,
  },
  {
    id: "workspace-main",
    label: "Main Workspace",
    paths: [path.join(OPENCLAW_ROOT, "workspace")],
    description: "Scratch dir for the main agent — HTML, markdown, scripts, anything saved.",
    maxDepth: 3,
  },
  {
    id: "workspace-krysalisos",
    label: "Krysalis OS Workspace",
    paths: [path.join(OPENCLAW_ROOT, "workspace-krysalisos")],
    description: "Scratch dir for the krysalisos-flavoured agent.",
    maxDepth: 3,
  },
  {
    id: "workspace-marketing",
    label: "Marketing Workspace",
    paths: [path.join(OPENCLAW_ROOT, "workspace-marketing")],
    description: "Scratch dir for the marketing agent.",
    maxDepth: 3,
  },
  {
    id: "skills",
    label: "Skills",
    // Skills are markdown SOPs OpenClaw can invoke. Surfacing them lets
    // Krysalis OS audit + edit the agent's playbook from the dashboard.
    paths: [path.join(OPENCLAW_ROOT, "skills")],
    description: "Installed agent skills — the playbooks OpenClaw runs against.",
    extsAllow: [".md", ".markdown", ".txt", ".json", ".yaml", ".yml"],
    maxDepth: 3,
  },
  {
    id: "flows",
    label: "Flows",
    paths: [path.join(OPENCLAW_ROOT, "flows")],
    description: "Saved multi-step flows. Auto-orchestrated agent chains.",
    extsAllow: [".json", ".yaml", ".yml", ".md"],
    maxDepth: 3,
  },
  {
    id: "canvas",
    label: "Canvas",
    paths: [path.join(OPENCLAW_ROOT, "canvas"), path.join(OPENCLAW_ROOT, "claw3d")],
    description: "Canvas drawings + 3D scenes.",
    maxDepth: 2,
  },
  {
    id: "tasks",
    label: "Tasks",
    paths: [path.join(OPENCLAW_ROOT, "tasks")],
    description: "Recorded tasks the agent has run.",
    extsAllow: [".json", ".md", ".txt", ".log"],
    maxDepth: 3,
  },
  {
    id: "cron",
    label: "Cron",
    paths: [path.join(OPENCLAW_ROOT, "cron")],
    description: "Scheduled / recurring agent jobs.",
    extsAllow: [".json", ".yaml", ".yml", ".md"],
    maxDepth: 3,
  },
  {
    id: "logs",
    label: "Logs",
    paths: [path.join(OPENCLAW_ROOT, "logs")],
    description: "Gateway + agent logs. Useful when something fails.",
    extsAllow: [".log", ".txt", ".json"],
    maxDepth: 2,
  },
];

async function walkBucket(def: BucketDef, maxFiles: number): Promise<HmFile[]> {
  const out: HmFile[] = [];
  const seen = new Set<string>();
  const allowedKinds = def.kindsAllow ? new Set(def.kindsAllow) : null;
  const allowedExts = def.extsAllow ? new Set(def.extsAllow.map((e) => e.toLowerCase())) : null;
  const depthCap = typeof def.maxDepth === "number" ? def.maxDepth : 4;
  for (const root of def.paths) {
    if (!existsSync(root)) continue;
    async function walk(dir: string, depth: number, base: string) {
      if (out.length >= maxFiles || depth > depthCap) return;
      let items;
      try { items = await readdir(dir, { withFileTypes: true }); }
      catch { return; }
      for (const it of items) {
        if (out.length >= maxFiles) break;
        if (SKIP_DIRS.has(it.name)) continue;
        if (it.name === ".DS_Store") continue;
        const full = path.join(dir, it.name);
        if (it.isDirectory()) {
          await walk(full, depth + 1, base);
        } else if (it.isFile()) {
          const kind = fileKind(it.name);
          if (allowedKinds && !allowedKinds.has(kind)) continue;
          if (allowedExts) {
            const ext = path.extname(it.name).toLowerCase();
            if (!allowedExts.has(ext)) continue;
          }
          if (seen.has(full)) continue;
          seen.add(full);
          const st = await safeStat(full);
          if (!st) continue;
          out.push({
            name: it.name,
            relPath: path.relative(base, full),
            bytes: st.size,
            mtime: st.mtimeMs,
            isText: kind === "text",
            kind,
          });
        }
      }
    }
    await walk(root, 0, root);
  }
  out.sort((a, b) => b.mtime - a.mtime);
  return out.slice(0, maxFiles);
}

export async function listBuckets(): Promise<HmProject[]> {
  const out: HmProject[] = [];
  for (const b of BUCKETS) {
    const existingRoots = b.paths.filter((p) => existsSync(p));
    const files = await walkBucket(b, 500);
    const maxMtime = files.reduce((m, f) => Math.max(m, f.mtime), 0);
    out.push({
      id: b.id, label: b.label, description: b.description,
      mtime: maxMtime, fileCount: files.length, roots: existingRoots,
    });
  }
  return out;
}

export async function listBucketFiles(id: string, maxFiles = 200): Promise<{ bucket: HmProject; files: HmFile[] } | null> {
  const def = BUCKETS.find((b) => b.id === id);
  if (!def) return null;
  const existingRoots = def.paths.filter((p) => existsSync(p));
  const files = await walkBucket(def, maxFiles);
  let maxMtime = 0;
  for (const f of files) if (f.mtime > maxMtime) maxMtime = f.mtime;
  return {
    bucket: { id: def.id, label: def.label, description: def.description, mtime: maxMtime, fileCount: files.length, roots: existingRoots },
    files,
  };
}

// Resolve a (bucket, relPath) pair → absolute file path on disk, with strict
// containment check so callers can't escape the bucket roots.
export function resolveBucketFile(id: string, relPath: string): string | null {
  return resolveUtils(BUCKETS, id, relPath);
}

export async function readBucketFile(id: string, relPath: string): Promise<{ path: string; content: string; bytes: number; mtime: number; truncated: boolean } | null> {
  return readUtils(BUCKETS, id, relPath);
}
