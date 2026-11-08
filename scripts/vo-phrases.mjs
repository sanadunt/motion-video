#!/usr/bin/env node
/**
 * Caption per frasa dari VO: frasa dipisah "…" di naskah, batas waktunya dari
 * jeda sunyi (ffmpeg silencedetect). Tanpa whisper, tanpa unduhan.
 *   node scripts/vo-phrases.mjs   → src/Videos/ripper-captions.json
 */
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';

const CLIPS = [
  {file: '01-hook', at: 1.0, text: 'Lima perempuan. … Sebelas minggu. … Dan satu surat … yang ditulis dengan tinta merah.'},
  {file: '02-setup', at: 13.0, text: "Tiga puluh satu Agustus, 1888. … Pukul tiga empat puluh pagi. … Buck's Row, London Timur. … Mary Ann Nichols. … Delapan hari kemudian … Annie Chapman. … Lalu, dalam satu malam yang sama … dua sekaligus. … Elizabeth Stride. … Catherine Eddowes."},
  {file: '03-grafiti', at: 42.3, text: 'Di Goulston Street, … di atas sepotong celemek yang basah, … seseorang menulis dengan kapur di dinding. … Polisi menghapusnya sebelum matahari terbit. … Tidak ada yang sempat memotretnya.'},
  {file: '04-surat', at: 61.5, text: 'Enam belas Oktober. … Sebuah kotak kecil tiba di meja George Lusk. … Di dalamnya … separuh ginjal manusia … dan sepucuk surat. … Surat itu tidak punya alamat pengirim. … Hanya dua kata di bagian atas. … From Hell.'},
  {file: '05-kelly', at: 91.1, text: "Sembilan November. … Miller's Court. … Mary Jane Kelly. … Yang terakhir … tidak ditemukan di jalan. … Dia ditemukan di dalam kamarnya sendiri. … Pintunya … terkunci."},
  {file: '06-penutup', at: 113.5, text: 'Dia tidak pernah tertangkap. … Tidak pernah diidentifikasi. … Surat-suratnya berhenti datang. … Orang-orang bilang dia berhenti. … Tapi tidak ada yang pernah bilang … dia selesai.'},
];

const silences = (path, thr, minDur) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', path, '-af', `silencedetect=noise=${thr}dB:d=${minDur}`, '-f', 'null', '-'], {encoding: 'utf8'});
  const out = r.stderr;
  const starts = [...out.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...out.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  const dur = Number(/Duration: (\d+):(\d+):([\d.]+)/.exec(out)?.slice(1).reduce((a, v, i) => a + Number(v) * [3600, 60, 1][i], 0) ?? 0);
  return {starts, ends, dur};
};

const result = [];
for (const c of CLIPS) {
  const path = `public/vo/ripper/${c.file}.wav`;
  const phrases = c.text.split('…').map((s) => s.trim()).filter(Boolean);
  const need = phrases.length - 1;
  // cari ambang/durasi yang memberi jumlah jeda = jumlah frasa − 1
  let best = null;
  for (const thr of [-38, -35, -32, -30, -28]) {
    for (const d of [0.6, 0.5, 0.4, 0.3, 0.25, 0.2]) {
      const s = silences(path, thr, d);
      // abaikan jeda di awal/akhir
      const inner = s.starts.map((st, i) => [st, s.ends[i] ?? s.dur]).filter(([st, en]) => st > 0.15 && en < s.dur - 0.15);
      if (inner.length === need) {
        best = {inner, dur: s.dur, thr, d};
        break;
      }
      if (!best || Math.abs(inner.length - need) < Math.abs(best.inner.length - need)) best = {inner, dur: s.dur, thr, d};
    }
    if (best && best.inner.length === need) break;
  }
  let bounds;
  if (best.inner.length === need) {
    bounds = [];
    let start = 0;
    best.inner.forEach(([st, en]) => {
      bounds.push([start, st]);
      start = en;
    });
    bounds.push([start, best.dur]);
  } else {
    // fallback proporsional panjang teks
    const total = phrases.reduce((a, p) => a + p.length, 0);
    let t = 0;
    bounds = phrases.map((p) => {
      const b = [t, t + (p.length / total) * best.dur];
      t = b[1];
      return b;
    });
    console.warn(`${c.file}: jeda ${best.inner.length} ≠ ${need}, pakai proporsional`);
  }
  phrases.forEach((p, i) => {
    const [s, e] = bounds[i];
    result.push({clip: c.file, start: +(c.at + s).toFixed(2), end: +(c.at + e).toFixed(2), text: p});
  });
  console.log(`${c.file}: ${phrases.length} frasa (thr ${best.thr} dB, d ${best.d}, jeda ${best.inner.length})`);
}
// durasi minimum per frasa (0,35 dtk + 0,28 dtk/kata), dibatasi awal frasa berikutnya
for (let i = 0; i < result.length; i++) {
  const r = result[i];
  const words = r.text.split(/\s+/).length;
  const minEnd = r.start + 0.35 + 0.28 * words;
  const cap = result[i + 1] && result[i + 1].clip === r.clip ? result[i + 1].start - 0.1 : r.end + 1.0;
  if (r.end < minEnd) r.end = +Math.min(minEnd, cap).toFixed(2);
}
fs.writeFileSync('src/Videos/ripper-captions.json', JSON.stringify(result, null, 2));
console.log(`→ src/Videos/ripper-captions.json (${result.length} frasa)`);
