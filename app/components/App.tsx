import React from "react";
import { Stats } from "@react-three/drei";
import { useControls } from "leva";
import CameraController from "./CameraController";
import { Select, Selection } from "@react-three/postprocessing";
import BookStack from "./BookStack";
import Effects from "../api/Effects";
import Floor from "./Floor";
import Skybox from "./Skybox";
import Lights from "./Lights";
import { bookStore } from "@/app/store/bookStore";
import { useSnapshot } from "valtio";

export default function App() {
  const { enabled: effectsEnabled } = useControls(
    "Effects",
    {
      enabled: {
        value: false,
      },
    },
    { collapsed: true }
  );

  const { showFloor, showStats } = useControls(
    "UI",
    {
      showFloor: {
        value: false,
        label: "Floor",
      },
      showStats: {
        value: false,
        label: "Stats",
      },
    },
    { collapsed: true }
  );

  return (
    <Selection>
      {showStats && <Stats />}
      <Effects enabled={effectsEnabled} />
      <Skybox />
      <Lights />
      <Select>
        <Background />
        {showFloor && <Floor />}
        <BookStack />
      </Select>
      <CameraController />
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
      <meshBasicMaterial color="red" transparent opacity={0} />
    </mesh>
  );
};
