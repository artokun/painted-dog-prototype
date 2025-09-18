import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { UltraHDRLoader } from "three/examples/jsm/Addons.js";
import { EquirectangularReflectionMapping } from "three";
import { GroundedSkybox } from "three/examples/jsm/Addons.js";
import { useControls } from "leva";
import { Select } from "@react-three/postprocessing";

export default function Skybox() {
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

  const envMap = useLoader(UltraHDRLoader, "/painted-dog-scene_5.jpg");

  const skybox = useMemo(() => {
    if (!envMap) return null;
    envMap.mapping = EquirectangularReflectionMapping;
    const skybox = new GroundedSkybox(envMap, groundHeight, groundRadius, 2048);
    skybox.position.y = groundHeight - 0.5;
    skybox.scale.setScalar(2);
    return skybox;
  }, [envMap, groundRadius, groundHeight]);

  return (
    <Select enabled={false}>
      {skybox && (
        <primitive
          object={skybox}
          position={[0, groundHeight, 0]}
          scale={groundScale}
          rotation={groundRotation}
        />
      )}
    </Select>
  );
}
