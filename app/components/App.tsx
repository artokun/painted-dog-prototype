import React from "react";
import { Stats } from "@react-three/drei";
import { useControls } from "leva";
import CameraController from "./CameraController";
import { Select, Selection } from "@react-three/postprocessing";
import BookStack from "./BookStack";
import Effects from "./Effects";
import Floor from "./Floor";
import Skybox from "./Skybox";
import Lights from "./Lights";

export default function App() {
  const { enabled: effectsEnabled } = useControls("Effects", {
    enabled: {
      value: false,
    },
  });

  return (
    <Selection>
      <Stats />
      <Effects enabled={effectsEnabled} />
      <Skybox />
      <Lights />
      <Select>
        <Floor />
        <BookStack />
      </Select>
      <CameraController />
    </Selection>
  );
}
