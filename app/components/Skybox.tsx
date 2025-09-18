import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { UltraHDRLoader } from "three/examples/jsm/Addons.js";
import { EquirectangularReflectionMapping } from "three";
import { GroundedSkybox } from "three/examples/jsm/Addons.js";
import { useControls } from "leva";
import { Select } from "@react-three/postprocessing";

export default function Skybox() {
  const {
    domeHeight,
    yOffset,
    groundRadius,
    groundScale,
    groundRotation,
    texture,
  } = useControls("Environment Ground", {
    domeHeight: {
      value: 2,
      min: 0.01,
      max: 10,
      step: 0.01,
      label: "Dome Height",
    },
    yOffset: {
      value: 2.92,
      min: -1,
      max: 10,
      step: 0.01,
      label: "Floor Offset",
    },
    groundRadius: {
      value: 5,
      min: 0,
      max: 50,
      step: 0.01,
      label: "Radius",
    },
    groundScale: {
      value: 1.5,
      min: 0,
      max: 5,
      step: 0.01,
      label: "Scale",
    },
    groundRotation: {
      value: [0.0, 1.2, 0.0],
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: "Rot X,Y,Z",
    },
    // https://gainmap-creator.monogrid.com/ to convert .hdr to .jpg
    texture: {
      image: "/painted-dog-scene_5.jpg",
    },
  });

  const envMap = useLoader(
    UltraHDRLoader,
    texture || "/painted-dog-scene_5.jpg"
  );

  const skybox = useMemo(() => {
    if (!envMap) return null;
    envMap.mapping = EquirectangularReflectionMapping;
    const skybox = new GroundedSkybox(envMap, domeHeight, groundRadius, 2048);
    return skybox;
  }, [envMap, groundRadius, domeHeight, texture]);

  return (
    <Select enabled={false}>
      {skybox && (
        <primitive
          object={skybox}
          position={[0, yOffset, 0]}
          scale={groundScale}
          rotation={groundRotation}
        />
      )}
    </Select>
  );
}
