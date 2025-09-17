import React, { useMemo, useRef } from "react";
import { SpotLight, useDepthBuffer, Stats } from "@react-three/drei";
import { useControls } from "leva";
import CameraController from "./CameraController";
import Floor from "./Floor";
import BookStack from "./BookStack";
import { useSnapshot } from "valtio";
import { filterStore, FilterView } from "../store/filterStore";
import { animated, config, useSpring } from "@react-spring/three";
import { EquirectangularReflectionMapping, Vector3 } from "three";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { GroundedSkybox, UltraHDRLoader } from "three/examples/jsm/Addons.js";

import Effects from "./Effects";

export default function App() {
  const { groundHeight, groundRadius, groundScale, groundRotation } =
    useControls("Environment Ground", {
      groundHeight: {
        value: 0.95,
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
        value: 1,
        min: 0,
        max: 5,
        step: 0.01,
        label: "Ground Scale",
      },
      groundRotation: {
        value: [0.0, 1.35, 0],
        step: 0.01,
        label: "Ground Rotation",
      },
    });

  const { lightPosition, lightIntensity, lightColor } = useControls(
    "Camera Light",
    {
      lightPosition: {
        value: [-1, 0, 2],
        min: -10,
        max: 10,
        step: 0.01,
      },
      lightIntensity: {
        value: 1.0,
        min: 0,
        max: 5,
        step: 0.01,
      },
      lightColor: {
        value: "#FFFFFF",
      },
    }
  );

  const { ambientLightIntensity } = useControls("Ambient Light", {
    ambientLightIntensity: {
      value: 1.5,
      min: 0,
      max: 5,
      step: 0.01,
      label: "Intensity",
    },
  });

  const { enabled: effectsEnabled } = useControls("Effects", {
    enabled: {
      value: false,
    },
  });

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
      <Stats />
      <Effects enabled={effectsEnabled} />
      {skybox && (
        <primitive
          object={skybox}
          position={[0, groundHeight, 0]}
          receiveShadow
          scale={groundScale}
          rotation={groundRotation}
        />
      )}
      <ambientLight intensity={ambientLightIntensity} />
      <CameraController />
      {/* camera light */}
      <animated.directionalLight
        position={lightPosition}
        rotation={[0, 0, 0]}
        intensity={lightIntensity}
        color={lightColor}
      />
      <Floor />
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
