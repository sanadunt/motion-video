#!/usr/bin/env node
/**
 * Sejajarkan naskah (frasa dipisah "…") ke VO, per kata, untuk bahasa Indonesia.
 *
 * Input : public/vo/ripper/whisper/<clip>.captions.json  (whisper.cpp lewat scripts/transcribe.ts)
 *         public/vo/ripper/<clip>.wav                     (untuk deteksi awal suara)
 * Output: src/Videos/ripper-captions.json  [{clip, start, end, text}]  (detik global)
 *         src/Videos/ripper-words.json     [{clip, i, text, t, anchored}] (detik global, untuk debug/animasi)
 *
 * Metode (diadaptasi dari timestamps_cpu.py video-talkcraft, untuk teks Latin/Indonesia):
 *  1. Normalisasi kedua sisi: huruf kecil, tanpa tanda baca; angka whisper → kata Indonesia
 *     ("11" → "sebelas", "1888" → "seribu delapan ratus delapan puluh delapan").
 *  2. Penyejajaran urutan kata (DP) dengan kecocokan longgar (Levenshtein / awalan) → kata jangkar.
 *  3. Buang jangkar menyimpang: dalam satu frasa, jarak antar jangkar yang terlalu besar untuk jumlah katanya.
 *  4. Kata tanpa jangkar diinterpolasi di antara jangkar tetangga, berbobot panjang kata.
 *  5. Awal frasa dikunci ke ujung jeda sunyi terdekat (titik suara mulai), akhir frasa ke awal frasa berikutnya.
 * Teks caption selalu dari naskah; whisper hanya memberi waktu.
 *
 * Pakai:
 *   node scripts/vo-align.mjs                                   → RipperTape (bawaan)
 *   node scripts/vo-align.mjs briefs/<nama>.vo.json [lama.json]  → proyek lain; config: {name, voDir, whisperDir, clips:[{file, at, text}]}
 *   Output: src/Videos/<name>-captions.json dan src/Videos/<name>-words.json. Argumen terakhir (opsional) = captions lama untuk laporan selisih.
 */
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const RIPPER_CLIPS = [
  {file: '01-hook', at: 1.0, text: 'Lima perempuan. … Sebelas minggu. … Dan satu surat … yang ditulis dengan tinta merah.'},
  {file: '02-setup', at: 13.0, text: "Tiga puluh satu Agustus, 1888. … Pukul tiga empat puluh pagi. … Buck's Row, London Timur. … Mary Ann Nichols. … Delapan hari kemudian … Annie Chapman. … Lalu, dalam satu malam yang sama … dua sekaligus. … Elizabeth Stride. … Catherine Eddowes."},
  {file: '03-grafiti', at: 42.3, text: 'Di Goulston Street, … di atas sepotong celemek yang basah, … seseorang menulis dengan kapur di dinding. … Polisi menghapusnya sebelum matahari terbit. … Tidak ada yang sempat memotretnya.'},
  {file: '04-surat', at: 61.5, text: 'Enam belas Oktober. … Sebuah kotak kecil tiba di meja George Lusk. … Di dalamnya … separuh ginjal manusia … dan sepucuk surat. … Surat itu tidak punya alamat pengirim. … Hanya dua kata di bagian atas. … From Hell.'},
  {file: '05-kelly', at: 91.1, text: "Sembilan November. … Miller's Court. … Mary Jane Kelly. … Yang terakhir … tidak ditemukan di jalan. … Dia ditemukan di dalam kamarnya sendiri. … Pintunya … terkunci."},
  {file: '06-penutup', at: 113.5, text: 'Dia tidak pernah tertangkap. … Tidak pernah diidentifikasi. … Surat-suratnya berhenti datang. … Orang-orang bilang dia berhenti. … Tapi tidak ada yang pernah bilang … dia selesai.'},
];

const DEFAULT_CFG = {name: 'ripper', voDir: 'public/vo/ripper', whisperDir: 'public/vo/ripper/whisper', clips: RIPPER_CLIPS};
const args = process.argv.slice(2);
const cfgArg = args[0] && /\.json$/.test(args[0]) && JSON.parse(fs.readFileSync(args[0], 'utf8')).clips ? args.shift() : null;
const CFG = cfgArg ? {...DEFAULT_CFG, ...JSON.parse(fs.readFileSync(cfgArg, 'utf8'))} : DEFAULT_CFG;
const CLIPS = CFG.clips;

/* ---------- angka → kata Indonesia ---------- */
const SATUAN = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
const terbilang = (n) => {
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${SATUAN[n - 10]} belas`;
  if (n < 100) return `${SATUAN[Math.floor(n / 10)]} puluh${n % 10 ? ' ' + SATUAN[n % 10] : ''}`;
  const tail = (r) => (r ? ' ' + terbilang(r) : '');
  if (n < 200) return `seratus${tail(n - 100)}`;
  if (n < 1000) return `${SATUAN[Math.floor(n / 100)]} ratus${tail(n % 100)}`;
  if (n < 2000) return `seribu${tail(n - 1000)}`;
  if (n < 1e6) return `${terbilang(Math.floor(n / 1000))} ribu${tail(n % 1000)}`;
  return String(n);
};

const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');
/** Pecah teks jadi kata ternormalisasi; angka diubah jadi kata (bisa jadi beberapa kata). */
const words = (text) =>
  text
    .replace(/…/g, ' ')
    .split(/\s+/)
    .map(norm)
    .filter(Boolean)
    .flatMap((w) => (/^\d+$/.test(w) ? terbilang(Number(w)).split(' ') : [w]));

/* ---------- kemiripan kata ---------- */
const lev = (a, b) => {
  const d = Array.from({length: a.length + 1}, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};
const sim = (a, b) => {
  if (a === b) return 1;
  const s = 1 - lev(a, b) / Math.max(a.length, b.length);
  if (s >= 0.7) return s;
  if (Math.min(a.length, b.length) >= 4 && (a.startsWith(b) || b.startsWith(a))) return 0.7;
  return 0;
};

/* ---------- penyejajaran urutan (DP, maksimalkan total kemiripan) ---------- */
const align = (S, W) => {
  const n = S.length, m = W.length;
  const D = Array.from({length: n + 1}, () => new Float64Array(m + 1));
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) {
      const s = sim(S[i - 1], W[j - 1].w);
      D[i][j] = Math.max(D[i - 1][j], D[i][j - 1], s > 0 ? D[i - 1][j - 1] + s : -1);
    }
  const pairs = [];
  for (let i = n, j = m; i > 0 && j > 0; ) {
    const s = sim(S[i - 1], W[j - 1].w);
    if (s > 0 && Math.abs(D[i][j] - (D[i - 1][j - 1] + s)) < 1e-9) {
      pairs.push([i - 1, j - 1]);
      i--;
      j--;
    } else if (D[i - 1][j] >= D[i][j - 1]) i--;
    else j--;
  }
  return pairs.reverse();
};

/* ---------- jeda sunyi ---------- */
const silences = (wav) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', wav, '-af', 'silencedetect=noise=-35dB:d=0.2', '-f', 'null', '-'], {encoding: 'utf8'});
  const st = [...r.stderr.matchAll(/silence_start: ([\d.]+)/g)].map((x) => +x[1]);
  const en = [...r.stderr.matchAll(/silence_end: ([\d.]+)/g)].map((x) => +x[1]);
  const dur = /Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr).slice(1).reduce((a, v, i) => a + +v * [3600, 60, 1][i], 0);
  return {list: st.map((s, i) => [s, en[i] ?? dur]), dur};
};

const result = [];
const wordsOut = [];
const report = [];
for (const c of CLIPS) {
  const toks = JSON.parse(fs.readFileSync(`${CFG.whisperDir}/${c.file}.captions.json`, 'utf8'));
  // kata whisper (angka dipecah, waktu disebar ±0,25 dtk per kata sampai token berikutnya)
  const W = [];
  toks.forEach((t, k) => {
    const ws = words(t.text);
    const t0 = t.timestampMs / 1000;
    const next = toks[k + 1] ? toks[k + 1].timestampMs / 1000 : t0 + 0.3 * ws.length;
    const step = Math.min(0.28, Math.max(0.05, (next - t0) / Math.max(1, ws.length)));
    ws.forEach((w, q) => W.push({w, t: t0 + q * step}));
  });
  const phrases = c.text.split('…').map((s) => s.trim()).filter(Boolean);
  const S = [];
  const phraseOf = [];
  phrases.forEach((p, pi) => words(p).forEach((w) => (S.push(w), phraseOf.push(pi))));

  const {list: sil, dur} = silences(`${CFG.voDir}/${c.file}.wav`);
  const speechStart = sil.length && sil[0][0] < 0.05 ? sil[0][1] : 0;
  const speechEnd = sil.length && sil[sil.length - 1][1] >= dur - 0.05 ? sil[sil.length - 1][0] : dur;

  // jangkar
  const T = new Array(S.length).fill(null);
  for (const [i, j] of align(S, W)) T[i] = W[j].t;
  // buang jangkar menyimpang di dalam frasa: jarak > 0,9 + 0,55 × selisih indeks kata
  for (let pass = 0; pass < 2; pass++) {
    let prev = -1;
    for (let i = 0; i < S.length; i++) {
      if (T[i] == null) continue;
      if (prev >= 0 && phraseOf[prev] === phraseOf[i] && T[i] - T[prev] > 0.9 + 0.55 * (i - prev)) T[prev] = null;
      prev = i;
    }
  }
  const anchored = T.map((x) => x != null);
  // interpolasi berbobot panjang kata
  const weight = (i) => S[i].length + 2;
  let lastI = -1;
  let lastT = speechStart;
  for (let i = 0; i <= S.length; i++) {
    if (i < S.length && T[i] == null) continue;
    const nextT = i < S.length ? T[i] : speechEnd;
    const gap = [];
    for (let k = lastI + 1; k < i; k++) gap.push(k);
    if (gap.length) {
      const total = gap.reduce((a, k) => a + weight(k), 0) + (i < S.length ? weight(i) * 0.3 : 0);
      let acc = lastI >= 0 ? weight(lastI) * 0.6 : 0;
      const span = nextT - lastT;
      const denom = total + acc;
      gap.forEach((k) => {
        T[k] = lastT + span * (acc / denom);
        acc += weight(k);
      });
    }
    if (i < S.length) {
      lastI = i;
      lastT = T[i];
    }
  }
  S.forEach((w, i) => wordsOut.push({clip: c.file, i, text: w, t: +(c.at + T[i]).toFixed(2), anchored: anchored[i]}));

  // awal frasa: kunci ke ujung jeda sunyi terdekat sebelum/di sekitar kata pertama
  // Titik waktu whisper (DTW) rata-rata 0,2–0,3 dtk setelah kata mulai terdengar.
  const firstIdx = phrases.map((_, pi) => phraseOf.indexOf(pi));
  const starts = [];
  firstIdx.forEach((i, pi) => {
    const t0 = T[i];
    if (pi === 0) return starts.push(speechStart);
    const prevWords = phrases[pi - 1].split(/\s+/).length;
    const floor = starts[pi - 1] + 0.35 + 0.22 * prevWords; // frasa sebelumnya butuh waktu diucapkan
    // kata berjangkar: waktu whisper bisa dipercaya → cari sedikit ke depan; kata hasil interpolasi → lebih lebar
    const ahead = anchored[i] ? 0.5 : 1.0;
    const cands = sil.filter(([, e]) => e >= Math.max(t0 - 1.2, floor) && e <= t0 + ahead);
    if (cands.length) return starts.push(cands.reduce((a, b) => (Math.abs(b[1] - t0) < Math.abs(a[1] - t0) ? b : a))[1]);
    let s = Math.max(floor, t0 - 0.2);
    const inside = sil.find(([a, e]) => s > a && s < e); // jangan mulai di tengah jeda sunyi
    if (inside) s = inside[1];
    starts.push(s);
  });
  phrases.forEach((p, pi) => {
    const s = starts[pi];
    const nextS = pi + 1 < phrases.length ? starts[pi + 1] : speechEnd + 0.4;
    // akhir caption = saat suara frasa ini berhenti (awal jeda sunyi pertama setelah kata terakhirnya), ditahan 0,15 dtk
    const lastIdx = (pi + 1 < phrases.length ? firstIdx[pi + 1] : S.length) - 1;
    const after = sil.find(([a]) => a >= T[lastIdx] - 0.15 && a > s + 0.3);
    const voiceEnd = after ? after[0] : speechEnd;
    const e = Math.min(nextS - 0.08, Math.max(voiceEnd + 0.15, s + 0.9));
    const anch = firstIdx[pi] >= 0 ? S.slice(firstIdx[pi], pi + 1 < phrases.length ? firstIdx[pi + 1] : S.length).filter((_, k) => anchored[firstIdx[pi] + k]).length : 0;
    result.push({clip: c.file, start: +(c.at + s).toFixed(2), end: +(c.at + e).toFixed(2), text: p});
    report.push({text: p, start: +(c.at + s).toFixed(2), anchors: `${anch}/${words(p).length}`});
  });
}
for (let i = 0; i < result.length - 1; i++) if (result[i].end > result[i + 1].start - 0.05) result[i].end = +(result[i + 1].start - 0.05).toFixed(2);

fs.writeFileSync(`src/Videos/${CFG.name}-captions.json`, JSON.stringify(result, null, 2));
fs.writeFileSync(`src/Videos/${CFG.name}-words.json`, JSON.stringify(wordsOut, null, 2));

// laporan: bandingkan dengan versi lama kalau ada
const oldPath = args[0];
const old = oldPath && fs.existsSync(oldPath) ? JSON.parse(fs.readFileSync(oldPath, 'utf8')) : null;
report.forEach((r, i) => {
  const d = old ? r.start - old[i].start : 0;
  const flag = Math.abs(d) >= 0.3 ? ' ◀' : '';
  console.log(`${r.start.toFixed(2).padStart(7)}  ${old ? (d >= 0 ? '+' : '') + d.toFixed(2).padStart(5) : ''}  jangkar ${r.anchors.padEnd(5)} ${r.text}${flag}`);
});
console.log(`→ ${result.length} frasa, ${wordsOut.filter((w) => w.anchored).length}/${wordsOut.length} kata berjangkar`);
