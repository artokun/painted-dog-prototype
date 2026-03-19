import { useControls } from "leva";
import { CameraRig } from "./CameraRig";
import { Select, Selection } from "@react-three/postprocessing";
import BookStack from "./BookStack";
import Effects from "../api/Effects";
import Lights from "./Lights";
import { StudioEnvironment } from "./StudioEnvironment";
import { bookStore } from "@/app/store/bookStore";
import { useSnapshot } from "valtio";
import { useMediaQuery } from "usehooks-ts";

export default function App() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { enabled: effectsEnabled } = useControls(
    "Effects",
    {
      enabled: {
        value: false,
      },
    },
    { collapsed: true }
  );

  if (isMobile) {
    return (
      <>
        <StudioEnvironment />
        <Lights />
        <Background />
        <BookStack />
        <CameraRig />
      </>
    );
  }

  return (
    <Selection>
      <Effects enabled={effectsEnabled} />
      <StudioEnvironment />
      <Lights />
      <Select>
        <Background />
        <BookStack />
      </Select>
      <CameraRig />
    </Selection>
  );
}

const Background = () => {
  // Used to capture clicks on the background
  const { focusedBookId } = useSnapshot(bookStore);
  const visible = focusedBookId !== null;

  const handleMissedClick = () => {
    bookStore.focusedBookId = null;
  };

  return (
    <mesh position={[0, 0, -5]} visible={visible} onClick={handleMissedClick}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
};
