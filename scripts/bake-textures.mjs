#!/usr/bin/env node
/**
 * Bakar tekstur noise ke public/textures/ (sekali). Dari root repo:
 *   node scripts/bake-textures.mjs            # semua
 *   node scripts/bake-textures.mjs cork fog0  # sebagian
 * Memakai komposisi TextureBake-Full (1080×1920, JPEG) dan TextureBake-Tile (512×512, PNG).
 * Daftar tekstur ada di src/lib/scenes/TextureBake.tsx (TEXTURES).
 */
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const src = fs.readFileSync(path.resolve('src/lib/scenes/TextureBake.tsx'), 'utf8');
const block = src.split('export const TEXTURES')[1].split('};')[0];
const entries = [...block.matchAll(/^\s*(\w+): \{baseFrequency: '([^']+)', octaves: (\d+), seed: (\d+), contrast: ([\d.]+), blur: (\d+)(, tile: true)?\}/gm)].map((m) => ({
  name: m[1],
  props: {baseFrequency: m[2], octaves: Number(m[3]), seed: Number(m[4]), contrast: Number(m[5]), blur: Number(m[6])},
  tile: Boolean(m[7]),
}));

const only = process.argv.slice(2);
const todo = only.length ? entries.filter((e) => only.includes(e.name)) : entries;
fs.mkdirSync('public/textures', {recursive: true});

for (const e of todo) {
  const out = e.tile ? `public/textures/${e.name}.png` : `public/textures/${e.name}.jpg`;
  const comp = e.tile ? 'TextureBake-Tile' : 'TextureBake-Full';
  const args = ['-n', '15', 'npx', 'remotion', 'still', comp, out, `--props=${JSON.stringify(e.props)}`, '--log=error'];
  if (!e.tile) args.push('--image-format=jpeg', '--jpeg-quality=88');
  process.stdout.write(`${e.name} → ${out} ... `);
  const r = spawnSync('nice', args, {stdio: ['ignore', 'inherit', 'inherit']});
  console.log(r.status === 0 ? `ok ${(fs.statSync(out).size / 1024).toFixed(0)} KB` : `GAGAL (${r.status})`);
  if (r.status !== 0) process.exit(1);
}
