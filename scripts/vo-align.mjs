#!/usr/bin/env node
/**
 * Sejajarkan naskah (frasa dipisah "…") ke timing kata whisper.cpp.
 * Input : public/vo/ripper/whisper/<clip>.captions.json (dari scripts/transcribe.ts)
 * Output: src/Videos/ripper-captions.json  [{clip, start, end, text}] detik global
 * Teks caption selalu dari naskah; whisper hanya dipakai untuk waktunya.
 */
import fs from 'node:fs';

const CLIPS = [
  {file: '01-hook', at: 1.0, text: 'Lima perempuan. … Sebelas minggu. … Dan satu surat … yang ditulis dengan tinta merah.'},
  {file: '02-setup', at: 13.0, text: "Tiga puluh satu Agustus, 1888. … Pukul tiga empat puluh pagi. … Buck's Row, London Timur. … Mary Ann Nichols. … Delapan hari kemudian … Annie Chapman. … Lalu, dalam satu malam yang sama … dua sekaligus. … Elizabeth Stride. … Catherine Eddowes."},
  {file: '03-grafiti', at: 42.3, text: 'Di Goulston Street, … di atas sepotong celemek yang basah, … seseorang menulis dengan kapur di dinding. … Polisi menghapusnya sebelum matahari terbit. … Tidak ada yang sempat memotretnya.'},
  {file: '04-surat', at: 61.5, text: 'Enam belas Oktober. … Sebuah kotak kecil tiba di meja George Lusk. … Di dalamnya … separuh ginjal manusia … dan sepucuk surat. … Surat itu tidak punya alamat pengirim. … Hanya dua kata di bagian atas. … From Hell.'},
  {file: '05-kelly', at: 91.1, text: "Sembilan November. … Miller's Court. … Mary Jane Kelly. … Yang terakhir … tidak ditemukan di jalan. … Dia ditemukan di dalam kamarnya sendiri. … Pintunya … terkunci."},
  {file: '06-penutup', at: 113.5, text: 'Dia tidak pernah tertangkap. … Tidak pernah diidentifikasi. … Surat-suratnya berhenti datang. … Orang-orang bilang dia berhenti. … Tapi tidak ada yang pernah bilang … dia selesai.'},
];

// naskah memakai angka dalam kata; whisper mungkin menulis angka. Samakan panjang karakter secara kasar.
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

const result = [];
for (const c of CLIPS) {
  const toks = JSON.parse(fs.readFileSync(`public/vo/ripper/whisper/${c.file}.captions.json`, 'utf8')).filter((t) => norm(t.text).length > 0);
  const phrases = c.text.split('…').map((s) => s.trim()).filter(Boolean);
  const totalChars = phrases.reduce((a, p) => a + norm(p).length, 0);
  const tokChars = toks.reduce((a, t) => a + norm(t.text).length, 0);
  // posisi awal tiap frasa sebagai rasio karakter → token whisper yang melewati rasio itu
  let acc = 0;
  const starts = phrases.map((p) => {
    const ratio = acc / totalChars;
    acc += norm(p).length;
    let cum = 0;
    for (const t of toks) {
      if (cum / tokChars >= ratio - 1e-6) return t;
      cum += norm(t.text).length;
    }
    return toks[toks.length - 1];
  });
  const clipEnd = toks[toks.length - 1].endMs / 1000;
  phrases.forEach((p, i) => {
    const s = starts[i].timestampMs / 1000;
    const next = starts[i + 1] ? starts[i + 1].timestampMs / 1000 - 0.12 : clipEnd;
    const words = p.split(/\s+/).length;
    const minEnd = s + 0.4 + 0.28 * words;
    const e = Math.max(Math.min(next, Math.max(minEnd, s + 0.6)), s + 0.5);
    result.push({clip: c.file, start: +(c.at + s).toFixed(2), end: +(c.at + Math.min(e, clipEnd + 0.3)).toFixed(2), text: p});
  });
}
// pastikan tidak tumpang tindih
for (let i = 0; i < result.length - 1; i++) if (result[i].end > result[i + 1].start - 0.05) result[i].end = +(result[i + 1].start - 0.05).toFixed(2);
fs.writeFileSync('src/Videos/ripper-captions.json', JSON.stringify(result, null, 2));
for (const r of result) console.log(`${r.start.toFixed(2).padStart(7)}-${r.end.toFixed(2).padStart(7)}  ${r.text}`);
console.log(`→ ${result.length} frasa`);
