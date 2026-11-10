/**
 * TiangStoryboard — style frame ArsipTiang (ARSIP 06). Set 2.5D di src/lib/scenes/tiang.tsx, still Blender PSX di
 * public/storyboard/tiang/ (scripts/blender/tiang/). prop `scene` 1–12, lihat briefs/ArsipTiang.storyboard.md.
 */
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {ensureFonts, useLayout} from '../lib/studio';
import {CameraRig, FilmGrade, PAL} from '../lib/scenes';
import {CamcorderOSD, CreditCard, HTScene, TapeGlitchImg, TiangDeskScene, TiangLabel} from '../lib/scenes/tiang';

ensureFonts();

export const tiangStoryboardSchema = z.object({
  scene: z.number().int().min(1).max(12),
  durationInSeconds: z.number().min(1).max(10),
});
export type TiangStoryboardProps = z.infer<typeof tiangStoryboardSchema>;
export const tiangStoryboardDefaults: TiangStoryboardProps = {scene: 1, durationInSeconds: 2};

const Still: React.FC<{name: string; W: number; H: number; dim?: number}> = ({name, W, H, dim = 0}) => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <Img src={staticFile(`storyboard/tiang/${name}.png`)} style={{width: W, height: H, imageRendering: 'pixelated', filter: dim ? `brightness(${1 - dim})` : undefined}} />
  </AbsoluteFill>
);

export const TiangStoryboard: React.FC<TiangStoryboardProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const L = useLayout();
  const W = L.width;
  const H = L.height;
  let grade = true;
  let warm = 0.5;
  const content = (() => {
    switch (scene) {
      case 1: // thumbnail: jalan desa + label kaset
        warm = 0.35;
        return (
          <>
            <Still name="jalan_0001" W={W} H={H} />
            <TiangLabel L={L} x={L.px(110)} y={L.px(430)} />
          </>
        );
      case 2: // "bertambah satu": tiang ekstra tanpa palang
        warm = 0.35;
        return <Still name="jalan_0250" W={W} H={H} />;
      case 3: // berkas terbuka
        return <TiangDeskScene L={L} frame={frame} />;
      case 4: // puncak relay, kabut terbuka: dua tiang di sebelah antena
        warm = 0.2;
        return <Still name="relay_0488" W={W} H={H} />;
      case 5: // HT bersiaran
        warm = 0.3;
        return <HTScene L={L} frame={frame} led={1} lcd="146.520" speak={1} redBlink={1} />;
      case 6: // pendaki dari belakang
        warm = 0.3;
        return <Still name="pendaki_0030" W={W} H={H} />;
      case 7: // camcorder: menghitung tiang
        grade = false;
        return (
          <>
            <Still name="cam_0292" W={W} H={H} />
            <CamcorderOSD L={L} frame={frame} sec={14} />
          </>
        );
      case 8: // camcorder berbalik: tiang di tengah jalan setapak
        grade = false;
        return (
          <>
            <Still name="cam_0431" W={W} H={H} />
            <CamcorderOSD L={L} frame={frame} sec={19} glitch={0.6} />
          </>
        );
      case 9: // firasat 2 frame: glitch pita memperlihatkan wajah, gelap, potongan atas saja
        grade = false;
        return (
          <>
            <Still name="cam_0431" W={W} H={H} />
            <TapeGlitchImg src="storyboard/tiang/face_0005.png" W={W} H={H} frame={frame} amount={1} style={{clipPath: 'inset(36% 0 50% 0)', filter: 'brightness(0.35) contrast(1.4) saturate(0.6)', mixBlendMode: 'lighten'}} />
            <CamcorderOSD L={L} frame={frame} sec={19} glitch={1} />
          </>
        );
      case 10: // meja gelap: barang bukti + radio ARSIP 05 menyala sendiri
        return <TiangDeskScene L={L} frame={frame} open={1} close={1} circle={1} dark={0.55} evidence={1} radio radioGlow={1} />;
      case 11: // JUMPSCARE 9 frame
        grade = false;
        return <TapeGlitchImg src="storyboard/tiang/face_0005.png" W={W} H={H} frame={frame} amount={0.35} />;
      default:
        grade = false;
        return <CreditCard L={L} />;
    }
  })();
  return (
    <AbsoluteFill style={{backgroundColor: PAL.shadow, overflow: 'hidden'}}>
      <CameraRig frame={frame} zoom={1.0} handheld={L.px(2)}>
        {content}
      </CameraRig>
      {grade && <FilmGrade frame={frame} width={width} height={height} grain={0.5} vignette={0.7} flicker={0.3} warm={warm} />}
    </AbsoluteFill>
  );
};
