/**
 * WajahStoryboard — style frame untuk WajahDiLukisan (ARSIP 04). Set di src/lib/scenes/wajah.tsx.
 * prop `scene`: 1 galeri · 2 lukisan · 3 meja 1822 · 4 teras laut · 5 lab · 6 penutup (puncak).
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {ensureFonts, useLayout} from '../lib/studio';
import {CameraRig, FilmGrade, PAL} from '../lib/scenes';
import {Desk1822Scene, GalleryScene, LabScene, PaintingScene, TerraceScene} from '../lib/scenes/wajah';

ensureFonts();

export const wajahStoryboardSchema = z.object({
  scene: z.number().int().min(1).max(6),
  durationInSeconds: z.number().min(1).max(10),
});
export type WajahStoryboardProps = z.infer<typeof wajahStoryboardSchema>;
export const wajahStoryboardDefaults: WajahStoryboardProps = {scene: 1, durationInSeconds: 2};

export const WajahStoryboard: React.FC<WajahStoryboardProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const L = useLayout();
  const content = (() => {
    switch (scene) {
      case 1:
        return <GalleryScene L={L} frame={frame} />;
      case 2:
        return <PaintingScene L={L} frame={frame} faceLight={0} />;
      case 3:
        return <Desk1822Scene L={L} frame={frame} />;
      case 4:
        return <TerraceScene L={L} frame={frame} meet={0.55} />;
      case 5:
        return <LabScene L={L} frame={frame} />;
      default:
        return <PaintingScene L={L} frame={frame} faceLight={1} spot={0.15} subject="?" exit />;
    }
  })();
  const cool = scene === 4 || scene === 5;
  return (
    <AbsoluteFill style={{backgroundColor: PAL.shadow, overflow: 'hidden'}}>
      <CameraRig frame={frame} zoom={1.02} handheld={L.px(2.5)}>
        {content}
      </CameraRig>
      <FilmGrade frame={frame} width={width} height={height} grain={0.55} vignette={0.75} flicker={0.4} warm={cool ? 0.25 : 0.55} />
    </AbsoluteFill>
  );
};
