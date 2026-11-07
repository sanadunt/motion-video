#!/usr/bin/env node
/**
 * Audit aturan repo Re-motion. Jalankan dari root repo:
 *   node .claude/skills/motion-studio/scripts/audit.mjs            # semua aset
 *   node .claude/skills/motion-studio/scripts/audit.mjs src/Templates/LowerThird.tsx
 * Exit code 1 kalau ada ERROR. WARN tidak menggagalkan, tapi harus dicek.
 */
import fs from 'node:fs';
import path from 'node:path';

const CATEGORIES = ['Logo', 'Transitions', 'Templates', 'Bumpers', 'Captions', 'Videos'];
const root = process.cwd();
const srcDir = path.join(root, 'src');

const walk = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return /\.(tsx?|jsx?)$/.test(e.name) ? [p] : [];
  });
};

const args = process.argv.slice(2);
const files = args.length
  ? args.map((a) => path.resolve(root, a))
  : CATEGORIES.flatMap((c) => walk(path.join(srcDir, c)));

if (!files.length) {
  console.log('Tidak ada file aset ditemukan di src/<Kategori>/.');
  process.exit(0);
}

const RULES = [
  {level: 'ERROR', re: /\btransition\s*:/, msg: 'CSS transition. Pakai useCurrentFrame + interpolate/spring.'},
  {level: 'ERROR', re: /\banimation\s*:|@keyframes/, msg: 'CSS animation/keyframes. Pakai useCurrentFrame.'},
  {level: 'ERROR', re: /Math\.random\s*\(/, msg: 'Math.random tidak deterministik. Pakai random(seed) dari remotion.'},
  {level: 'ERROR', re: /Date\.now\s*\(|new Date\s*\(/, msg: 'Waktu nyata membuat render tidak bisa diulang.'},
  {level: 'ERROR', re: /@remotion\/google-fonts|fonts\.googleapis\.com/, msg: 'Font dari jaringan. Bundel di public/fonts.'},
  {level: 'ERROR', re: /\buseFrame\s*\(/, msg: 'useFrame (R3F) jalan di jam sendiri. Gerakkan 3D dari useCurrentFrame.'},
  {level: 'ERROR', re: /setTimeout\s*\(|setInterval\s*\(|requestAnimationFrame\s*\(/, msg: 'Timer browser. Semua waktu harus dari frame.'},
  {level: 'WARN', re: /\b(1080|1920)\b/, msg: 'Angka 1080/1920 tertulis langsung. Pakai useLayout()/useVideoConfig().'},
  {level: 'WARN', re: /Easing\.linear\b/, msg: 'Easing linear. Pakai EASE.* atau spring kecuali memang disengaja (mis. rotasi konstan).'},
  {level: 'WARN', re: /https?:\/\/(?!www\.remotion\.dev)/, msg: 'URL jaringan. Aset harus di public/ dan dimuat dengan staticFile().'},
];

const rootTsx = path.join(srcDir, 'Root.tsx');
const rootSrc = fs.existsSync(rootTsx) ? fs.readFileSync(rootTsx, 'utf8') : '';

let errors = 0;
let warns = 0;
const report = (level, file, line, msg) => {
  if (level === 'ERROR') errors++;
  else warns++;
  const loc = line ? `${path.relative(root, file)}:${line}` : path.relative(root, file);
  console.log(`${level.padEnd(5)} ${loc}  ${msg}`);
};

for (const file of files) {
  if (!fs.existsSync(file)) {
    report('ERROR', file, 0, 'File tidak ada.');
    continue;
  }
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  lines.forEach((text, i) => {
    const trimmed = text.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    for (const r of RULES) if (r.re.test(text)) report(r.level, file, i + 1, r.msg);
  });

  const rel = path.relative(srcDir, file).split(path.sep);
  const isAsset = CATEGORIES.includes(rel[0]) && /\.tsx$/.test(file);
  if (!isAsset) continue;

  if (!/useLayout\s*\(|useVideoConfig\s*\(/.test(src))
    report('WARN', file, 0, 'Tidak memakai useLayout()/useVideoConfig(); ukuran mungkin tidak responsif.');
  if (!/z\.object\s*\(/.test(src))
    report('WARN', file, 0, 'Tidak ada schema zod; props tidak bisa diedit di Studio.');
  if (!/durationInSeconds/.test(src))
    report('WARN', file, 0, 'Tidak ada prop durationInSeconds; durasi tidak bisa diatur lewat props.');

  const name = path.basename(file, '.tsx');
  if (rootSrc && !new RegExp(`\\b${name}\\b`).test(rootSrc))
    report('WARN', file, 0, `Komponen ${name} belum terlihat di src/Root.tsx.`);
  else if (rootSrc) {
    const folderOk = new RegExp(`<Folder\\s+name=["']${rel[0]}["']`).test(rootSrc);
    if (!folderOk) report('WARN', rootTsx, 0, `Belum ada <Folder name="${rel[0]}"> di Root.tsx.`);
    const variantsOk =
      new RegExp(`id=["']${name}["'][^>]*`).test(rootSrc) && /FormatVariants/.test(rootSrc);
    const manualOk = ['Portrait', 'Landscape', 'Square'].every((f) =>
      rootSrc.includes(`${name}-${f}`),
    );
    if (!variantsOk && !manualOk)
      report('WARN', rootTsx, 0, `${name}: varian -Portrait/-Landscape/-Square belum lengkap.`);
  }
}

console.log(`\nAudit selesai: ${errors} error, ${warns} warning, ${files.length} file.`);
process.exit(errors ? 1 : 0);
