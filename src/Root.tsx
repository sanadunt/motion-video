import { Composition, Folder } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
} from "./CaptionedVideo";
import { HaloDunia } from "./HaloDunia";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HaloDunia"
        component={HaloDunia}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          style: {
            backgroundColor: "#000000",
          },
        }}
      />
      <Folder name="Captions">
        <Composition
          id="CaptionedVideo"
          component={CaptionedVideo}
          durationInFrames={1842}
          fps={30}
          width={1080}
          height={1920}
          calculateMetadata={calculateCaptionedVideoMetadata}
          defaultProps={{
            src: "kakashi-chidori.mp4",
            captionsFile: "kakashi-chidori.captions.json",
            captions: [],
            captionTop: 1260,
            captionHeight: 220,
            blurBehindCaptions: true,
          }}
        />
      </Folder>
    </>
  );
};
