/**
 * AngkaStoryboard — style frame untuk SiaranAngka (ARSIP 05). Set di src/lib/scenes/angka.tsx.
 * prop `scene`: 1 kelas · 2 meja arsip · 3 kamar 2001 · 4 padang salju (Blender) · 5 kelas gelap · 6 puncak "UNTUKMU".
 * Siren Head tidak pernah digambar (hak cipta Trevor Henderson); hanya namanya di tulisan tangan dan VO.
 */
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {ensureFonts, useLayout} from '../lib/studio';
import {CameraRig, FilmGrade, PAL} from '../lib/scenes';
import {ArchiveDeskScene, ClassroomScene, RadioRoomScene, SnowOverlay, classroomGeometry} from '../lib/scenes/angka';

ensureFonts();

export const angkaStoryboardSchema = z.object({
  scene: z.number().int().min(1).max(6),
  durationInSeconds: z.number().min(1).max(10),
});
export type AngkaStoryboardProps = z.infer<typeof angkaStoryboardSchema>;
export const angkaStoryboardDefaults: AngkaStoryboardProps = {scene: 1, durationInSeconds: 2};

export const AngkaStoryboard: React.FC<AngkaStoryboardProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const L = useLayout();
  const note = classroomGeometry(L).note;
  const content = (() => {
    switch (scene) {
      case 1:
        return <ClassroomScene L={L} frame={frame} label radioGlow={0.35} />;
      case 2:
        return <ArchiveDeskScene L={L} frame={frame} />;
      case 3:
        return <RadioRoomScene L={L} frame={frame} rows={2.6} />;
      case 4:
        return (
          <>
            <Img src={staticFile('storyboard/angka/salju.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', imageRendering: 'pixelated'}} />
            <SnowOverlay L={L} frame={frame} count={0.6} />
          </>
        );
      case 5:
        return <ClassroomScene L={L} frame={frame} dark={1} radioGlow={1} noteText={['kamu pernah dengar', 'siren head ?']} />;
      default:
        return <ClassroomScene L={L} frame={frame} dark={1} radioGlow={1} noteText={['', 'untukmu.']} />;
    }
  })();
  // adegan 6: kamera mendorong ke kertas lipat (puncak 4 frame)
  const push = scene === 6;
  const cool = scene === 4;
  return (
    <AbsoluteFill style={{backgroundColor: PAL.shadow, overflow: 'hidden'}}>
      <CameraRig frame={frame} zoom={push ? 1.75 : 1.02} handheld={L.px(2.5)} origin={push ? `${note.x + note.w / 2}px ${note.y + note.h / 2}px` : '50% 50%'}>
        {content}
      </CameraRig>
      <FilmGrade frame={frame} width={width} height={height} grain={0.55} vignette={0.75} flicker={0.4} warm={cool ? 0.25 : 0.55} />
    </AbsoluteFill>
  );
};
