#!/usr/bin/env node
/**
 * Pangkas jeda VO secara terukur (pengganti `sox silence`, yang ambangnya tidak presisi).
 *
 *   node scripts/sfx/vo-gaps.mjs <in.wav> <out.wav> <batas> <rasio> [kepala=0.10] [ekor=0.20]
 *
 * Jeda = sunyi < −35 dB (sama dengan vo-align) minimal 0,3 dtk (ffmpeg silencedetect). Jeda internal yang lebih panjang dari
 * <batas> dipendekkan jadi  batas + (panjang − batas) × rasio,  dipotong dari tengah jeda, jadi urutan
 * panjang jeda tetap ("…" tetap lebih lama dari koma). Rasio 1 = tidak diubah. Sunyi di awal dan akhir
 * file disisakan <kepala>/<ekor> dtk. Potongan disambung dengan fade 5 ms (berada di dalam sunyi).
 */
import {spawnSync} from 'node:child_process';

const [inp, out, capS, ratioS, headS = '0.10', tailS = '0.20'] = process.argv.slice(2);
if (!out) {
  console.error('pakai: node scripts/sfx/vo-gaps.mjs in.wav out.wav batas rasio [kepala] [ekor]');
  process.exit(1);
}
const cap = +capS, ratio = +ratioS, head = +headS, tail = +tailS;
const run = (args) => spawnSync('ffmpeg', ['-hide_banner', ...args], {encoding: 'utf8'});

const det = run(['-i', inp, '-af', 'silencedetect=noise=-35dB:d=0.3', '-f', 'null', '-']).stderr;
const dur = +/Duration: (\d+):(\d+):([\d.]+)/.exec(det).slice(1).reduce((a, x) => a * 60 + +x, 0);
const st = [...det.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
const en = [...det.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
const sil = st.map((s, i) => [Math.max(0, s), en[i] ?? dur]);

// segmen yang dipertahankan
let a = 0, b = dur;
if (sil.length && sil[0][0] <= 0.01) a = Math.max(0, sil[0][1] - head);
if (sil.length && sil.at(-1)[1] >= dur - 0.01) b = Math.min(dur, sil.at(-1)[0] + tail);
const keep = [];
let cur = a;
for (const [s, e] of sil) {
  if (s <= a + 0.01 || e >= b - 0.01) continue; // awal/akhir sudah ditangani
  const len = e - s;
  if (len <= cap) continue;
  const target = cap + (len - cap) * ratio;
  const cut = len - target;
  const c0 = s + (len - cut) / 2;
  keep.push([cur, c0]);
  cur = c0 + cut;
}
keep.push([cur, b]);

const parts = keep.map(([x, y], i) =>
  `[0]atrim=${x.toFixed(4)}:${y.toFixed(4)},asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st=${(y - x - 0.005).toFixed(4)}:d=0.005[s${i}]`);
const fc = `${parts.join(';')};${keep.map((_, i) => `[s${i}]`).join('')}concat=n=${keep.length}:v=0:a=1`;
const r = run(['-loglevel', 'error', '-y', '-i', inp, '-filter_complex', fc, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', out]);
if (r.status) {
  console.error(r.stderr);
  process.exit(1);
}
const gaps = sil.filter(([s, e]) => s > a + 0.01 && e < b - 0.01).map(([s, e]) => e - s);
const newGaps = gaps.map((g) => (g > cap ? cap + (g - cap) * ratio : g));
console.log(`jeda ${gaps.map((g) => g.toFixed(2)).join(' ') || '-'} → ${newGaps.map((g) => g.toFixed(2)).join(' ') || '-'}`);
