// Entry program for gta6-meme-x-01, written for this entry.
//
// The entry itself is a post on X: a GTA VI meme picture plus its text.
// This program's job is the hand-in step. It reads POST.json from the
// repository root, checks that the file really is a JSON object with a
// string "url" field (the post's address), and then delivers a copy of
// POST.json to the output directory, where the grader picks it up.
//
// Outside the grader's container the two directories can be pointed
// elsewhere with environment variables:
//   MAKEFUN_BOT_DIR    stands in for /bot    (the repository)
//   MAKEFUN_OUTPUT_DIR stands in for /output (where files are delivered)

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const POST_FILE_NAME = "POST.json";

function botDirectory(): string {
  return process.env.MAKEFUN_BOT_DIR ?? "/bot";
}

function outputDirectory(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

function loadPostAddress(repoDir: string): string {
  const postPath = join(repoDir, POST_FILE_NAME);
  if (!existsSync(postPath)) {
    throw new Error(`no ${POST_FILE_NAME} found in ${repoDir}`);
  }
  const parsed: unknown = JSON.parse(readFileSync(postPath, "utf8"));
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(`${POST_FILE_NAME} must hold a JSON object`);
  }
  const url = (parsed as { url?: unknown }).url;
  if (typeof url !== "string" || url.length === 0) {
    throw new Error(`${POST_FILE_NAME} needs a non-empty string "url"`);
  }
  return url;
}

function looksLikeStatusAddress(url: string): boolean {
  // A real hand-in names one post: https://x.com/<handle>/status/<digits>
  // (the same address on twitter.com is accepted too). The starter's
  // placeholder, with its <handle> and <id> brackets, fails this test,
  // which is deliberate: it should never be handed in by accident.
  return /^https:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/.test(url);
}

function deliverPost(repoDir: string, outDir: string): string {
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, POST_FILE_NAME);
  copyFileSync(join(repoDir, POST_FILE_NAME), target);
  return target;
}

function main(): void {
  const repoDir = botDirectory();
  const outDir = outputDirectory();
  const address = loadPostAddress(repoDir);
  if (!looksLikeStatusAddress(address)) {
    console.error(`warning: "${address}" is not a post address yet`);
  }
  const delivered = deliverPost(repoDir, outDir);
  console.log(`delivered ${delivered} for post ${address}`);
}

try {
  main();
} catch (err) {
  console.error(`gta6-meme-x-01 entry failed: ${(err as Error).message}`);
  process.exit(1);
}
