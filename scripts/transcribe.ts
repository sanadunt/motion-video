/**
 * Transkripsi video/audio di folder public/ menjadi public/<nama>.captions.json
 * memakai whisper.cpp (CPU) lewat @remotion/install-whisper-cpp.
 *
 * Pakai:
 *   npx tsx scripts/transcribe.ts <file-di-public> [model] [bahasa]
 *   npx tsx scripts/transcribe.ts kakashi-chidori.mp4 small id
 *
 * Env opsional:
 *   WHISPER_DIR   folder instalasi whisper.cpp (default: ./whisper.cpp)
 *   MODEL_DIR     folder model (default: <WHISPER_DIR>)
 *   WHISPER_PROMPT  daftar kosakata/nama untuk membantu Whisper, dipisah koma
 *
 * Setelah transkripsi, kata dikoreksi memakai scripts/glossary.json.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
  type WhisperModel,
} from "@remotion/install-whisper-cpp";
import type { Language } from "@remotion/install-whisper-cpp";
import { applyGlossary } from "./glossary";

const WHISPER_VERSION = "1.7.5";

const main = async () => {

  const [, , inputName, modelArg = "small", languageArg = "id"] = process.argv;
  if (!inputName) {
    console.error("Pakai: npx tsx scripts/transcribe.ts <file-di-public> [model] [bahasa]");
    process.exit(1);
  }

  const model = modelArg as WhisperModel;
  const language = languageArg as Language;
  const root = process.cwd();
  const inputPath = path.join(root, "public", inputName);
  if (!existsSync(inputPath)) {
    console.error(`File tidak ditemukan: ${inputPath}`);
    process.exit(1);
  }

  const whisperPath = process.env.WHISPER_DIR ?? path.join(root, "whisper.cpp");
  const modelFolder = process.env.MODEL_DIR ?? whisperPath;
  const tmpDir = path.join(root, "tmp");
  mkdirSync(tmpDir, { recursive: true });
  const wavPath = path.join(tmpDir, `${path.parse(inputName).name}.16k.wav`);

  console.log(`[1/4] Install whisper.cpp v${WHISPER_VERSION} -> ${whisperPath}`);
  await installWhisperCpp({ to: whisperPath, version: WHISPER_VERSION });

  console.log(`[2/4] Unduh model "${model}" -> ${modelFolder}`);
  await downloadWhisperModel({
    model,
    folder: modelFolder,
    onProgress: (progress) => {
      const pct = Math.round(progress * 100);
      if (pct % 10 === 0) process.stdout.write(`\r  ${pct}%`);
    },
  });
  process.stdout.write("\n");

  console.log(`[3/4] Ekstrak audio 16 kHz mono -> ${wavPath}`);
  execFileSync(
    "ffmpeg",
    ["-y", "-v", "error", "-i", inputPath, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wavPath],
    { stdio: "inherit" },
  );

  console.log(`[4/4] Transkripsi (bahasa: ${language})`);
  const whisperCppOutput = await transcribe({
    inputPath: wavPath,
    whisperPath,
    whisperCppVersion: WHISPER_VERSION,
    model,
    modelFolder,
    language,
    tokenLevelTimestamps: true,
    splitOnWord: true,
    additionalArgs: process.env.WHISPER_PROMPT
      ? [["--prompt", process.env.WHISPER_PROMPT]]
      : undefined,
    onProgress: (p) => process.stdout.write(`\r  ${Math.round(p * 100)}%`),
  });
  process.stdout.write("\n");

  const { captions: rawCaptions } = toCaptions({ whisperCppOutput });
  const { captions, replaced } = applyGlossary(rawCaptions);
  if (replaced > 0) console.log(`  ${replaced} kata dikoreksi lewat glossary.json`);
  const outPath = path.join(root, "public", `${path.parse(inputName).name}.captions.json`);
  writeFileSync(outPath, JSON.stringify(captions, null, 2));
  rmSync(wavPath, { force: true });

  console.log(`Selesai: ${captions.length} token -> ${outPath}`);
  console.log(captions.slice(0, 12).map((c) => c.text).join(""));
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
