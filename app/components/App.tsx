import React, { useMemo, useRef } from "react";
import { Environment, SpotLight, useDepthBuffer } from "@react-three/drei";
import CameraController from "./CameraController";
import Backdrop from "./Backdrop";
import Floor from "./Floor";
import BookStack from "./BookStack";
import { useSnapshot } from "valtio";
import { filterStore } from "../store/filterStore";
import { animated, useSpring } from "@react-spring/three";
import { Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";

export default function App() {
  const { search } = useSnapshot(filterStore);

  const environmentIntensity = useMemo(() => {
    return search.length > 1 ? 0 : 0.97;
  }, [search]);

  const spring = useSpring({
    environmentIntensity,
    directionalLightIntensity: search.length > 1 ? 0 : 2.2,
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
        position={[2, 4, 2]}
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
      <Backdrop />
      <BookStack />
    </>
  );
}

function MovingSpot({ vec = new Vector3(), ...props }) {
  const light = useRef<any>(null);
  const { search } = useSnapshot(filterStore);
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
    light.current.intensity = search.length > 1 ? 4 : 0;
    light.current.target.updateMatrixWorld();
  });
  return (
    <SpotLight
      castShadow
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
