import React from "react";
import { Environment } from "@react-three/drei";
import CameraController from "./CameraController";
import Backdrop from "./Backdrop";
import Floor from "./Floor";
import BookStack from "./BookStack";

export default function App() {
  return (
    <>
      <CameraController />
      <Environment
        files="/artist_workshop_1k.hdr"
        background={false}
        environmentIntensity={0.97}
      />
      <directionalLight
        position={[2, 4, 2]}
        intensity={2.2}
        color="#FFFFFF"
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-near={0.001}
        shadow-camera-far={10}
        shadow-camera-left={-1}
        shadow-camera-right={1}
        shadow-camera-top={1}
        shadow-camera-bottom={-1}
        shadow-bias={-0.0001}
      />

      <Floor />
      <Backdrop />
      <BookStack />
    </>
  );
}
