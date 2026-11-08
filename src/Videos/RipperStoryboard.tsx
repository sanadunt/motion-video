/**
 * RipperStoryboard — 7 style frame untuk RipperTape v2. Set-nya ada di src/lib/scenes/sets.tsx
 * (dipakai juga oleh RipperTape.tsx). Di sini semua dalam keadaan "jadi" (teks penuh).
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {ensureFonts, useLayout} from '../lib/studio';
import {CameraRig, FilmGrade, PAL} from '../lib/scenes';
import {BoardScene, DoorScene, FileScene, LetterScene, StreetScene, WallScene} from '../lib/scenes/sets';

ensureFonts();

export const ripperStoryboardSchema = z.object({
  scene: z.number().int().min(1).max(7),
  durationInSeconds: z.number().min(1).max(10),
});
export type RipperStoryboardProps = z.infer<typeof ripperStoryboardSchema>;
export const ripperStoryboardDefaults: RipperStoryboardProps = {scene: 1, durationInSeconds: 2};

export const RipperStoryboard: React.FC<RipperStoryboardProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const L = useLayout();
  const content = (() => {
    switch (scene) {
      case 1:
        return <BoardScene L={L} frame={frame} />;
      case 2:
        return <FileScene L={L} frame={frame} active={0} t={99} />;
      case 3:
        return <StreetScene L={L} frame={frame} />;
      case 4:
        return <WallScene L={L} frame={frame} />;
      case 5:
        return <LetterScene L={L} frame={frame} />;
      case 6:
        return <DoorScene L={L} frame={frame} />;
      default:
        return <BoardScene L={L} frame={frame} closing />;
    }
  })();
  return (
    <AbsoluteFill style={{backgroundColor: PAL.shadow, overflow: 'hidden'}}>
      <CameraRig frame={frame} zoom={1.02} handheld={L.px(2.5)}>
        {content}
      </CameraRig>
      <FilmGrade frame={frame} width={width} height={height} grain={0.55} vignette={0.75} flicker={0.4} warm={0.55} />
    </AbsoluteFill>
  );
};
