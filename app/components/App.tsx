import React, { useMemo, useRef } from "react";
import { Environment, SpotLight, useDepthBuffer } from "@react-three/drei";
import CameraController from "./CameraController";
import Backdrop from "./Backdrop";
import Floor from "./Floor";
import BookStack from "./BookStack";
import { useSnapshot } from "valtio";
import { filterStore, FilterView } from "../store/filterStore";
import { animated, config, useSpring } from "@react-spring/three";
import { PCFSoftShadowMap, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";

export default function App() {
  const { search, view } = useSnapshot(filterStore);
  const isGridMode = view === FilterView.Grid;

  const environmentIntensity = useMemo(() => {
    return search.length > 1 ? 0 : 0.97;
  }, [search]);

  const spring = useSpring({
    environmentIntensity,
    directionalLightIntensity: isGridMode ? 2.2 : search.length > 1 ? 0 : 2.2,
    position: new Vector3(2, 4, 2),
    config: isGridMode ? config.default : config.gentle,
  });

  const depthBuffer = useDepthBuffer({ frames: 1 });

  return (
    <>
      <CameraController />
      <Environment
        files="/artist_workshop_1k.hdr"
        background={false}
        environmentIntensity={environmentIntensity}
      />
      <fog attach="fog" args={["#202020", 5, 10]} />
      <animated.directionalLight
        position={spring.position}
        lookAt={[0, 0, 0]}
        intensity={spring.directionalLightIntensity}
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
      <MovingSpot
        depthBuffer={depthBuffer}
        color="#ffffff"
        position={[0, 1.2, 0.6]}
      />
      <Floor />
      {/* <Backdrop /> */}
      <BookStack />
    </>
  );
}

function MovingSpot({ vec = new Vector3(), ...props }) {
  const light = useRef<any>(null);
  const { search, view } = useSnapshot(filterStore);
  const isGridMode = view === FilterView.Grid;
  const viewport = useThree((state) => state.viewport);

  useFrame((state) => {
    light.current.target.position.lerp(
      vec.set(
        (state.pointer.x * viewport.width) / 2,
        (state.pointer.y * viewport.height) / 2,
        0
      ),
      0.1
    );
    light.current.intensity = !isGridMode && search.length > 1 ? 4 : 0;
    light.current.target.updateMatrixWorld();
  });
  return (
    <SpotLight
      castShadow
      shadow-mapSize={[4096, 4096]}
      shadow-camera-near={0.001}
      shadow-camera-far={1}
      shadow-camera-left={-0.5}
      shadow-camera-right={0.5}
      shadow-camera-top={0.5}
      shadow-camera-bottom={-0.5}
      shadow-bias={-0.0001}
      shadow-normalBias={0.0001}
      ref={light}
      penumbra={0.5}
      distance={2}
      angle={0.2}
      attenuation={20}
      anglePower={10}
      {...props}
    />
  );
}
