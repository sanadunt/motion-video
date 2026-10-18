import { Composition } from "remotion";
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
    </>
  );
};
