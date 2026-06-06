// Hermes Agent workspace browser.
//
// Unlike Antigravity/Codex/FCC, Hermes doesn't use one scratch root with
// per-project subdirs. It scatters outputs into typed buckets:
//
//   ~/.hermes/images/                                 — image generation
//   ~/.hermes/profiles/krysalisos/audio_cache/            — TTS / voice outputs
//   ~/.hermes/profiles/krysalisos/pastes/                 — text dumps from sessions
//   ~/.hermes/profiles/krysalisos/workspace/              — generic agent scratch
//   ~/.hermes/sandboxes/<name>/                       — sandboxed execution
//
// We model each of these as a "virtual project" so the same Workspace UI
// pattern (sidebar of projects → file list → inline preview) works here too.
// User picks a bucket → sees what Hermes has produced → clicks a file → preview.

import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { BucketDef, HmProject, HmFileKind, HmFile, fileKind, SKIP_DIRS, safeStat, resolveBucketFile as resolveUtils, readBucketFile as readUtils } from "./workspaceUtils";

const HOME = os.homedir();
export const HERMES_ROOT = path.join(HOME, ".hermes");

// Active profile detection — Hermes writes the current profile name to
// ~/.hermes/active_profile. Default to "krysalisos" matching the user's setup.
function readActiveProfile(): string {
  try {
    const txt = require("node:fs").readFileSync(path.join(HERMES_ROOT, "active_profile"), "utf8");
    const trimmed = (txt as string).trim();
    if (trimmed && /^[A-Za-z0-9_.-]+$/.test(trimmed)) return trimmed;
  } catch { /* fall through */ }
  return "krysalisos";
}
export const HERMES_PROFILE = readActiveProfile();
const PROFILE_ROOT = path.join(HERMES_ROOT, "profiles", HERMES_PROFILE);

// Bucket = a named output directory the UI presents as a "project".
// The `paths` array lets us merge multiple physical dirs into one bucket —
// e.g. global ~/.hermes/audio_cache + per-profile audio_cache.

const BUCKETS: BucketDef[] = [
  {
    id: "gemma4",
    label: "Gemma 4",
    // "Gemma 4 is INSANE" — a live showcase of real things Google's Gemma 4
    // produced through Hermes (OpenRouter): a self-coded interactive app, raw
    // step-by-step reasoning, sci-fi, 7 languages, business strategy — all for
    // a fraction of a cent. index.html is the hub; apps/ holds Gemma-built apps.
    paths: [path.join(PROFILE_ROOT, "workspace", "gemma4")],
    description: "Gemma 4 is INSANE — a live app it coded itself, real reasoning, sci-fi, 7 languages + business strategy. Click index.html → renders live.",
    maxDepth: 2,
  },
  {
    id: "minimax",
    label: "MiniMax Showcase",
    // Dedicated showcase folder: "MiniMax M3 is Insane". Hero site, game,
    // dashboard, the Behind-the-Build prompts page, every readable prompt, and
    // all the generated media (image-01 images, Hailuo videos, speech-02 voice).
    // Click any HTML → renders live in the iframe; videos/images/audio preview.
    paths: [path.join(PROFILE_ROOT, "workspace", "minimax")],
    description: "MiniMax M3 is Insane — hero site, game, dashboard + every prompt, with generated videos & images. Click any HTML → renders live.",
    maxDepth: 3,
  },
  {
    id: "seo",
    label: "MiniMax SEO",
    // Dedicated showcase folder: "Rank #1 with MiniMax M3". Points only at the
    // seo-rank-1-minimax project so the bucket shows clean relative paths
    // (index.html, guide.html, seo-tools.html, blog/…, assets/…) — easy to
    // preview + demo without scrolling the busy generic Workspace bucket.
    paths: [path.join(PROFILE_ROOT, "workspace", "seo-rank-1-minimax")],
    description: "Rank #1 with MiniMax M3 — full SEO showcase: website, guide, tools, blog, images + promo video.",
    maxDepth: 2,
  },
  {
    id: "guides",
    label: "Guides",
    // Beautiful HTML landing-page guides (given away inside the AI Profit
    // Boardroom). Each is a self-contained page with a pinned CTA, framework,
    // belief-breakers, comparison + SOP. Click any → renders live in the iframe.
    paths: [path.join(PROFILE_ROOT, "workspace", "guides")],
    description: "Beautiful landing-page guides — the 24/7 AI Agent guide + Hermes vs Krysalis OS. Click any → renders live.",
    maxDepth: 2,
  },
  {
    id: "antcli",
    label: "Claude CLI",
    // Showcase for the Claude Platform CLI (`ant`): talk to Claude from the
    // terminal, list every model, run Managed Agents. Copy written live by
    // Claude Opus 4.8 via `ant messages create`. Click index.html → renders live.
    paths: [path.join(PROFILE_ROOT, "workspace", "ant-cli")],
    description: "The Claude Platform CLI (ant) showcase — every API call from one command. Click index.html → renders live.",
    maxDepth: 2,
  },
  {
    id: "goals",
    label: "Goal Mode",
    // Outputs from Hermes Goal Mode runs. Each goal lives under
    // ~/.hermes/goals/<goal-id>/ and can contain anything Hermes wrote during
    // the run — full Next.js sites, blog posts, scripts, generated assets.
    // We scan deeper than other buckets so users can browse the full tree,
    // and skip node_modules / .next / .git so we don't drown the UI.
    paths: [path.join(HERMES_ROOT, "goals")],
    description: "Output from autonomous Goal Mode runs. Click any file → preview.",
    maxDepth: 4,
  },
  {
    id: "apps",
    label: "Apps",
    // HTML apps Hermes builds (todo lists, games, landing pages, etc.) usually
    // land in HOME or ~/Guides at the top level. Strict ext filter so we don't
    // pick up package.json / config files.
    paths: [
      HOME,
      path.join(HOME, "Guides"),
      path.join(PROFILE_ROOT, "workspace"),
    ],
    description: "HTML apps + pages Hermes built. Click any → renders live in an iframe.",
    extsAllow: [".html", ".htm"],
    maxDepth: 0,
  },
  {
    id: "videos",
    label: "Videos",
    // Hermes often saves HyperFrames / Remotion renders straight to $HOME
    // (it just picks the cwd) rather than the .hermes scratch dirs.
    // maxDepth: 0 = top-level files only — keeps us from pulling in your
    // entire ~/Downloads folder of unrelated YouTube clips.
    paths: [
      HOME,
      path.join(PROFILE_ROOT, "workspace"),
      path.join(HERMES_ROOT, "videos"),
    ],
    description: "HyperFrames + Remotion renders. Scans HOME top-level + workspace.",
    kindsAllow: ["video"],
    maxDepth: 0,
  },
  {
    id: "images",
    label: "Images",
    paths: [path.join(HERMES_ROOT, "images")],
    description: "Image generation outputs from Hermes.",
  },
  {
    id: "audio",
    label: "Audio",
    paths: [path.join(PROFILE_ROOT, "audio_cache"), path.join(HERMES_ROOT, "audio_cache")],
    description: "Voice + TTS renders.",
  },
  {
    id: "workspace",
    label: "Workspace",
    paths: [path.join(PROFILE_ROOT, "workspace")],
    description: "Generic scratch where Hermes saves files — HTML, scripts, etc.",
  },
  {
    id: "sandboxes",
    label: "Sandboxes",
    paths: [path.join(HERMES_ROOT, "sandboxes"), path.join(PROFILE_ROOT, "sandboxes")],
    description: "Sandboxed execution environments.",
  },
  // Pastes is text-only — kept at the bottom because it's the least visual
  // bucket and the user almost never scrolls to it intentionally.
  {
    id: "pastes",
    label: "Pastes",
    paths: [path.join(PROFILE_ROOT, "pastes"), path.join(HERMES_ROOT, "pastes")],
    description: "Text dumps captured during sessions.",
  },
];

async function walkBucket(def: BucketDef, maxFiles: number): Promise<HmFile[]> {
  const out: HmFile[] = [];
  const seen = new Set<string>(); // absolute path → dedupe across roots
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
        // Skip hidden files when scanning HOME — too much noise
        if (dir === HOME && it.name.startsWith(".")) continue;
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
  // Order for easy navigation: the hero index.html first, then the rest of the
  // live-renderable sites, then video → image → audio → other text (prompts/md)
  // → binary. Newest-first within each group. Makes showcase folders read top-down
  // from "the amazing stuff" to the supporting files.
  const rank = (f: HmFile): number => {
    const base = f.name.toLowerCase();
    const ext = path.extname(base);
    if (base === "index.html") return -1;
    if (ext === ".html" || ext === ".htm") return 0;
    if (f.kind === "video") return 1;
    if (f.kind === "image") return 2;
    if (f.kind === "audio") return 3;
    if (f.kind === "pdf") return 4;
    if (f.kind === "text") return 5;
    return 6;
  };
  out.sort((a, b) => rank(a) - rank(b) || b.mtime - a.mtime);
  return out.slice(0, maxFiles);
}

export async function listBuckets(): Promise<HmProject[]> {
  // Reuse the same walker as listBucketFiles so the count + recency reflect
  // what the user will actually see when they click the bucket. Cheap because
  // we cap at 200 files per bucket and the walker is depth-bounded.
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
  // Preserve BUCKETS declaration order — the user wants visual buckets at the
  // top and Pastes at the bottom regardless of recency.
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

// Resolve a (bucket, relPath) pair → an absolute file path on disk, with
// strict containment check so callers can't escape the bucket roots.
export function resolveBucketFile(id: string, relPath: string): string | null {
  return resolveUtils(BUCKETS, id, relPath);
}

export async function readBucketFile(id: string, relPath: string): Promise<{ path: string; content: string; bytes: number; mtime: number; truncated: boolean } | null> {
  return readUtils(BUCKETS, id, relPath);
}
