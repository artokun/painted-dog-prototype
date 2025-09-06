import React, { useMemo, useRef } from "react";
import {
  Environment,
  Sparkles,
  SpotLight,
  useDepthBuffer,
} from "@react-three/drei";
import CameraController from "./CameraController";
import Backdrop from "./Backdrop";
import Floor from "./Floor";
import BookStack from "./BookStack";
import { useSnapshot } from "valtio";
import { filterStore, FilterView } from "../store/filterStore";
import { animated, config, useSpring } from "@react-spring/three";
import { Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";

export default function App() {
  const { search, view } = useSnapshot(filterStore);
  const isGridMode = view === FilterView.Grid;

  const environmentIntensity = useMemo(() => {
    return search.length > 1 ? 0 : 0;
  }, [search]);

  const spring = useSpring({
    environmentIntensity,
    directionalLightIntensity: isGridMode ? 3 : search.length > 1 ? 0 : 3,
    position: new Vector3(2, 4, 2),
    config: isGridMode ? config.default : config.gentle,
  });

  const depthBuffer = useDepthBuffer({ frames: 1 });

  return (
    <>
      <CameraController />
      <Environment
        files="/painted-dog-2k.hdr"
        resolution={2048}
        environmentIntensity={environmentIntensity}
        ground={{
          height: 20,
          radius: 20,
          scale: 2,
        }}
      />
      <fog attach="fog" args={["#202020", 5, 10]} />
      <ambientLight intensity={1} />
      {/* sun light */}
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
        shadow-bias={-0.0002}
        shadow-normalBias={0.0002}
      />
      {/* camera light */}
      <animated.directionalLight
        position={[-1, 0, 2]}
        rotation={[0, 0, 0]}
        intensity={spring.directionalLightIntensity}
        color="#FFFFFF"
      />
      <MovingSpot
        depthBuffer={depthBuffer}
        color="#ffffff"
        position={[0, 1.3, 0.6]}
      />
      <Floor />
      <Backdrop />
      <BookStack />
      {/* <Sparkles
        position={[0.1, 0.6, -2.67]}
        rotation={[Math.PI / 6, Math.PI / 5, Math.PI / -3]}
        count={10000}
        scale={[3, 0.1, 0.5]}
        speed={0.1}
        opacity={1}
        size={0.8}
        color="#efefef"
      /> */}
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
