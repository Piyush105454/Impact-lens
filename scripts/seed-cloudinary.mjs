#!/usr/bin/env node
/**
 * Uploads the demo workspace media in /public/demo to your Cloudinary account,
 * using the same public IDs the app references (e.g. impactlens/bhopal-lake/before/lake-before-01).
 *
 * Requires NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET
 * in .env.local (or the environment). After seeding, set NEXT_PUBLIC_DEMO_ASSETS_FROM_CLOUDINARY=true.
 *
 *   npm run seed:cloudinary
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { v2 as cloudinary } from "cloudinary";

const root = resolve(import.meta.dirname, "..");

for (const f of [".env.local", ".env"]) {
  const p = resolve(root, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;
if (!cloud_name || !api_key || !api_secret) {
  console.error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET.");
  process.exit(1);
}
cloudinary.config({ cloud_name, api_key, api_secret, secure: true });

// Read the asset list straight from the demo data so IDs never drift.
const source = readFileSync(resolve(root, "lib/demo/demoMedia.ts"), "utf8");
const seeds = [...source.matchAll(/\{ id: "asset_[^}]*\}/g)].map(([obj]) => ({
  file: /file: "([^"]+)"/.exec(obj)[1],
  folder: /folder: "([^"]+)"/.exec(obj)[1],
  video: obj.includes('resourceType: "video"'),
}));

let ok = 0;
for (const s of seeds) {
  const path = resolve(root, "public/demo", `${s.file}.${s.video ? "mp4" : "jpg"}`);
  try {
    const r = await cloudinary.uploader.upload(path, {
      public_id: s.file,
      folder: s.folder,
      resource_type: s.video ? "video" : "image",
      overwrite: true,
      tags: ["impactlens", "impactlens-demo"],
    });
    ok++;
    console.log(`✓ ${r.public_id} (${r.resource_type}, ${r.width}x${r.height})`);
  } catch (e) {
    console.error(`✗ ${s.folder}/${s.file}: ${e?.message ?? e}`);
  }
}
console.log(`\nUploaded ${ok}/${seeds.length} assets. Set NEXT_PUBLIC_DEMO_ASSETS_FROM_CLOUDINARY=true to serve them from Cloudinary.`);
