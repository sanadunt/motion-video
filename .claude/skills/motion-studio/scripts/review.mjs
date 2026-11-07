#!/usr/bin/env node
/**
 * Bahan review untuk dilihat (dengan tool view) sebelum melapor. Dari root repo:
 *
 *   # still di frame beat penting (murah, sebelum render penuh)
 *   node .claude/skills/motion-studio/scripts/review.mjs LowerThird-Portrait --frames 12,45,140
 *
 *   # setelah render: contact sheet, tes ponsel, metadata, loudness
 *   node .claude/skills/motion-studio/scripts/review.mjs LowerThird-Portrait --video out/LowerThird-Portrait.mp4
 *
 * Opsi: --frames a,b,c  --video path  --props '{"name":"..."}'  --gl angle|swangle
 *       --dry (cetak perintah saja)
 * Output di out/review/<CompId>/.
 */
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const compId = argv[0];
if (!compId || compId.startsWith('--')) {
  console.error('Pakai: review.mjs <CompositionId> [--frames 0,30,60] [--video out/x.mp4] [--props JSON] [--gl angle] [--dry]');
  process.exit(2);
}
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const dry = argv.includes('--dry');
const frames = (opt('frames') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map(Number);
const video = opt('video');
const props = opt('props');
const gl = opt('gl');

const outDir = path.join('out', 'review', compId);
fs.mkdirSync(outDir, {recursive: true});
const isWin = process.platform === 'win32';

const run = (cmd, args, {capture = false} = {}) => {
  console.log(`$ ${cmd} ${args.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ')}`);
  if (dry) return {status: 0, stdout: '', stderr: ''};
  const r = spawnSync(cmd, args, {
    shell: isWin,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    maxBuffer: 64 * 1024 * 1024,
  });
  return r;
};

const problems = [];
const outputs = [];

// 1) Still per frame
for (const f of frames) {
  if (!Number.isInteger(f) || f < 0) {
    problems.push(`Frame tidak valid: ${f}`);
    continue;
  }
  const file = path.join(outDir, `f${String(f).padStart(5, '0')}.png`);
  const args = ['remotion', 'still', compId, file, `--frame=${f}`];
  if (props) args.push(`--props=${props}`);
  if (gl) args.push(`--gl=${gl}`);
  const r = run('npx', args);
  if (r.status !== 0) problems.push(`Still frame ${f} gagal (lihat log di atas).`);
  else outputs.push(file);
}

// 2) Video: metadata, contact sheet, tes ponsel, loudness
if (video) {
  if (!dry && !fs.existsSync(video)) {
    problems.push(`Video tidak ditemukan: ${video}`);
  } else {
    const probe = run(
      'ffprobe',
      ['-v', 'error', '-show_entries',
        'stream=codec_type,codec_name,width,height,avg_frame_rate,pix_fmt:format=duration',
        '-of', 'json', video],
      {capture: true},
    );
    let duration = 0;
    if (!dry && probe.status === 0) {
      const info = JSON.parse(probe.stdout);
      const v = info.streams.find((s) => s.codec_type === 'video');
      const a = info.streams.find((s) => s.codec_type === 'audio');
      duration = Number(info.format?.duration ?? 0);
      console.log(
        `\nVIDEO  ${v?.codec_name} ${v?.width}x${v?.height} @ ${v?.avg_frame_rate} ${v?.pix_fmt}, ${duration.toFixed(2)} dtk, audio: ${a ? a.codec_name : 'tidak ada'}`,
      );
      const expect = {
        Portrait: [1080, 1920],
        Landscape: [1920, 1080],
        Square: [1080, 1080],
      }[compId.split('-').pop()];
      if (expect && (v?.width !== expect[0] || v?.height !== expect[1]))
        problems.push(`Ukuran ${v?.width}x${v?.height}, seharusnya ${expect[0]}x${expect[1]}.`);
      if (v?.codec_name !== 'h264') problems.push(`Codec ${v?.codec_name}, seharusnya h264.`);
      if (v?.pix_fmt !== 'yuv420p') problems.push(`pix_fmt ${v?.pix_fmt}; yuv420p paling aman untuk ponsel/sosmed.`);

      if (a) {
        const lufs = run('ffmpeg', ['-hide_banner', '-nostats', '-i', video, '-af', 'ebur128=peak=true', '-f', 'null', '-'], {capture: true});
        const txt = lufs.stderr ?? '';
        const I = txt.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop()?.match(/-?[\d.]+/)?.[0];
        const P = txt.match(/Peak:\s+(-?[\d.]+) dBFS/g)?.pop()?.match(/-?[\d.]+/)?.[0];
        console.log(`AUDIO  integrated ${I ?? '?'} LUFS, true peak ${P ?? '?'} dBTP (target sekitar -14 LUFS, puncak < -1)`);
        const silent = I !== undefined && Number(I) < -60;
        if (silent) console.log('AUDIO  track senyap (tidak ada suara), cek loudness dilewati.');
        else if (I && Math.abs(Number(I) + 14) > 2) problems.push(`Loudness ${I} LUFS, jauh dari -14.`);
        if (P && Number(P) > -1) problems.push(`True peak ${P} dBTP di atas -1.`);
      }
    } else if (!dry) {
      problems.push('ffprobe gagal membaca video.');
    }

    // contact sheet: maksimal 60 sel, 6 kolom
    const cells = Math.max(1, Math.min(60, Math.ceil(duration || 1)));
    const rate = duration ? cells / duration : 1;
    const rows = Math.ceil(cells / 6);
    const contact = path.join(outDir, 'contact.png');
    run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', video, '-vf',
      `fps=${rate.toFixed(4)},scale=240:-2,tile=6x${rows}`, '-frames:v', '1', contact]);
    outputs.push(contact);
    console.log(`CONTACT  ${cells} sel, 6 kolom; sel ke-n (mulai 0) ≈ detik ${(1 / rate).toFixed(2)} × n`);

    // tes ponsel: lebar 360 px, satu sel tiap 2 dtk, maksimal 24 sel
    const pCells = Math.max(1, Math.min(24, Math.ceil((duration || 2) / 2)));
    const pRate = duration ? pCells / duration : 0.5;
    const phone = path.join(outDir, 'phone.png');
    run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', video, '-vf',
      `fps=${pRate.toFixed(4)},scale=360:-2,tile=4x${Math.ceil(pCells / 4)}`, '-frames:v', '1', phone]);
    outputs.push(phone);
  }
}

if (!frames.length && !video) problems.push('Tidak ada --frames atau --video; tidak ada yang direview.');

console.log('\nFILE UNTUK DILIHAT:');
outputs.forEach((o) => console.log(`  ${o}`));
if (problems.length) {
  console.log('\nMASALAH:');
  problems.forEach((p) => console.log(`  - ${p}`));
}
console.log(
  '\nLangkah berikut: buka setiap file dengan view, cek teks terbaca, tidak terpotong, tidak tumpang tindih, margin aman, dan warna aksen.',
);
process.exit(problems.length ? 1 : 0);
