import React, { useEffect, useMemo, useRef } from "react";
import { Environment, SpotLight, useDepthBuffer } from "@react-three/drei";
import { useControls } from "leva";
import CameraController from "./CameraController";
import Backdrop from "./Backdrop";
import Floor from "./Floor";
import BookStack from "./BookStack";
import { useSnapshot } from "valtio";
import { filterStore, FilterView } from "../store/filterStore";
import { animated, config, useSpring } from "@react-spring/three";
import {
  EquirectangularReflectionMapping,
  TextureLoader,
  Vector3,
} from "three";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { GroundedSkybox, UltraHDRLoader } from "three/examples/jsm/Addons.js";

export default function App() {
  const { search, view } = useSnapshot(filterStore);
  const isGridMode = view === FilterView.Grid;

  const { groundHeight, groundRadius, groundScale, groundRotation } =
    useControls("Environment Ground", {
      groundHeight: {
        value: 1.4,
        min: 0,
        max: 10,
        step: 0.01,
        label: "Ground Height",
      },
      groundRadius: {
        value: 2,
        min: 0,
        max: 50,
        step: 0.01,
        label: "Ground Radius",
      },
      groundScale: {
        value: 1.2,
        min: 0,
        max: 5,
        step: 0.01,
        label: "Ground Scale",
      },
      groundRotation: {
        value: [-0.06, 1.26, 0],
        step: 0.01,
        label: "Ground Rotation",
      },
    });

  const { lightX, lightY, lightZ } = useControls("Directional Light", {
    lightX: {
      value: -3.3,
      min: -10,
      max: 10,
      step: 0.01,
      label: "Light X Position",
    },
    lightY: {
      value: 6.25,
      min: -10,
      max: 10,
      step: 0.01,
      label: "Light Y Position",
    },
    lightZ: {
      value: 2,
      min: -10,
      max: 10,
      step: 0.01,
      label: "Light Z Position",
    },
  });

  const { ambientLightIntensity } = useControls("Ambient Light", {
    ambientLightIntensity: {
      value: 1,
      min: 0,
      max: 5,
      step: 0.01,
      label: "Ambient Light Intensity",
    },
  });

  const environmentIntensity = useMemo(() => {
    return search.length > 1 ? 0 : 0;
  }, [search]);

  const spring = useSpring({
    environmentIntensity,
    directionalLightIntensity: isGridMode ? 3 : search.length > 1 ? 0 : 3,
    position: new Vector3(lightX, lightY, lightZ),
    config: isGridMode ? config.default : config.gentle,
  });

  const depthBuffer = useDepthBuffer({ frames: 1 });
  const envMap = useLoader(UltraHDRLoader, "/painted-dog-scene_5.jpg");

  const skybox = useMemo(() => {
    if (!envMap) return null;
    envMap.mapping = EquirectangularReflectionMapping;
    const skybox = new GroundedSkybox(envMap, groundHeight, groundRadius, 2048);
    skybox.position.y = groundHeight - 0.5;
    skybox.scale.setScalar(2);
    return skybox;
  }, [envMap, groundRadius]);

  return (
    <>
      {skybox && (
        <primitive
          object={skybox}
          position={[0, groundHeight, 0]}
          receiveShadow
          scale={groundScale}
          rotation={groundRotation}
        />
      )}
      {/* <Environment
        ref={environmentRef as any}
        files="/painted-dog-scene_5.hdr"
        resolution={2048}
        environmentIntensity={0}
        background="only"
        // backgroundRotation={[Math.PI / 0.48, Math.PI / 0.42, 0.2]}
        ground={{
          height: groundHeight,
          radius: groundRadius,
          scale: groundScale,
        }}
      /> */}
      <ambientLight intensity={ambientLightIntensity} />
      <CameraController />
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
      castShadow={false}
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
