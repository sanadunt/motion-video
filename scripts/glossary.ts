/**
 * Koreksi kata hasil transkripsi memakai scripts/glossary.json.
 *
 * Dipakai otomatis oleh scripts/transcribe.ts, atau manual untuk JSON yang sudah ada:
 *   npx tsx scripts/glossary.ts public/kakashi-chidori.captions.json
 */
import type { Caption } from "@remotion/captions";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const glossaryPath = path.join(here, "glossary.json");

export const loadGlossary = (): Record<string, string> => {
  if (!existsSync(glossaryPath)) return {};
  const raw = JSON.parse(readFileSync(glossaryPath, "utf8")) as Record<
    string,
    string
  >;
  const entries = Object.entries(raw).filter(([key]) => !key.startsWith("_"));
  return Object.fromEntries(entries.map(([k, v]) => [k.toLowerCase(), v]));
};

/**
 * Ganti kata sesuai glosarium. Nilai "" (string kosong) berarti kata dibuang;
 * caption yang teksnya jadi kosong ikut dihapus.
 */
export const applyGlossary = (
  captions: Caption[],
  glossary = loadGlossary(),
) => {
  let replaced = 0;
  const out = captions
    .map((caption) => {
      const text = caption.text.replace(/[\p{L}\p{N}]+/gu, (word) => {
        const fix = glossary[word.toLowerCase()];
        if (fix === undefined) return word;
        replaced += 1;
        return fix;
      });
      return { ...caption, text };
    })
    .filter((caption) => caption.text.trim().length > 0);
  return { captions: out, replaced };
};

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const file = process.argv[2];
  if (!file) {
    console.error("Pakai: npx tsx scripts/glossary.ts <file.captions.json>");
    process.exit(1);
  }
  const captions = JSON.parse(readFileSync(file, "utf8")) as Caption[];
  const { captions: fixed, replaced } = applyGlossary(captions);
  writeFileSync(file, JSON.stringify(fixed, null, 2));
  console.log(`${replaced} kata dikoreksi -> ${file}`);
}
