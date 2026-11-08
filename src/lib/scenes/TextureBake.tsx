/**
 * TextureBake — merender satu tekstur noise (feTurbulence) ke gambar, SEKALI.
 * Hasilnya dipakai NoiseFill sebagai background CSS supaya render video tidak
 * menghitung filter SVG tiap frame. Jalankan: node scripts/bake-textures.mjs
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';

export const textureBakeSchema = z.object({
  baseFrequency: z.string(),
  octaves: z.number().int().min(1).max(6),
  seed: z.number().int(),
  contrast: z.number().min(0.2).max(3),
  blur: z.number().min(0).max(40),
});
export type TextureBakeProps = z.infer<typeof textureBakeSchema>;
export const textureBakeDefaults: TextureBakeProps = {baseFrequency: '0.9', octaves: 3, seed: 1, contrast: 1, blur: 0};

/** Daftar tekstur yang dibakar. `tile` = 512 px berulang; selain itu 1080×1920 penuh. */
export const TEXTURES: Record<string, TextureBakeProps & {tile?: boolean}> = {
  grain: {baseFrequency: '0.95', octaves: 2, seed: 1, contrast: 1.6, blur: 0, tile: true},
  grain2: {baseFrequency: '0.95', octaves: 2, seed: 77, contrast: 1.6, blur: 0, tile: true},
  paper: {baseFrequency: '0.7', octaves: 3, seed: 2, contrast: 1.2, blur: 0, tile: true},
  stain: {baseFrequency: '0.012', octaves: 2, seed: 52, contrast: 1.1, blur: 0},
  wood: {baseFrequency: '0.004 0.25', octaves: 3, seed: 3, contrast: 1.3, blur: 0},
  cork: {baseFrequency: '0.9', octaves: 4, seed: 11, contrast: 1.5, blur: 0, tile: true},
  cork2: {baseFrequency: '0.05', octaves: 2, seed: 12, contrast: 1, blur: 0},
  lampdust: {baseFrequency: '0.02', octaves: 2, seed: 9, contrast: 1.3, blur: 0},
  desk: {baseFrequency: '0.004 0.3', octaves: 3, seed: 5, contrast: 1.3, blur: 0},
  parcel: {baseFrequency: '0.5', octaves: 3, seed: 17, contrast: 1.2, blur: 0, tile: true},
  parcel2: {baseFrequency: '0.015', octaves: 2, seed: 18, contrast: 1, blur: 0},
  cobble: {baseFrequency: '0.06 0.12', octaves: 3, seed: 8, contrast: 1.6, blur: 0},
  fog0: {baseFrequency: '0.006', octaves: 3, seed: 20, contrast: 1.4, blur: 6},
  fog1: {baseFrequency: '0.010', octaves: 3, seed: 21, contrast: 1.4, blur: 6},
  fog2: {baseFrequency: '0.014', octaves: 3, seed: 22, contrast: 1.4, blur: 6},
  brick: {baseFrequency: '0.05', octaves: 4, seed: 14, contrast: 1.5, blur: 0},
  brick2: {baseFrequency: '1.2', octaves: 2, seed: 15, contrast: 1.4, blur: 0, tile: true},
  chalkgrit: {baseFrequency: '1.5', octaves: 1, seed: 16, contrast: 1.3, blur: 0, tile: true},
  doorwood: {baseFrequency: '0.3 0.004', octaves: 3, seed: 18, contrast: 1.4, blur: 0},
  doorgrit: {baseFrequency: '0.8', octaves: 2, seed: 19, contrast: 1, blur: 0, tile: true},
};
export type TexName = keyof typeof TEXTURES;

export const TextureBake: React.FC<TextureBakeProps> = ({baseFrequency, octaves, seed, contrast, blur}) => (
  <AbsoluteFill style={{backgroundColor: '#808080'}}>
    <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', filter: blur ? `blur(${blur}px)` : undefined}} preserveAspectRatio="none">
      <filter id="bake" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency={baseFrequency} numOctaves={octaves} seed={seed} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope={contrast} intercept={(1 - contrast) / 2} />
          <feFuncG type="linear" slope={contrast} intercept={(1 - contrast) / 2} />
          <feFuncB type="linear" slope={contrast} intercept={(1 - contrast) / 2} />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter="url(#bake)" />
    </svg>
  </AbsoluteFill>
);
