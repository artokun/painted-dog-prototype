import { useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { UltraHDRLoader } from "three/examples/jsm/Addons.js";
import { EquirectangularReflectionMapping, Vector3 } from "three";
import { GroundedSkybox } from "three/examples/jsm/Addons.js";
import { useControls } from "leva";
import { Select } from "@react-three/postprocessing";

export default function Skybox() {
  const { groundHeight, groundRadius, groundScale, groundRotation, texture } =
    useControls("Environment Ground", {
      groundHeight: {
        value: 4,
        min: 0.01,
        max: 10,
        step: 0.01,
        label: "Ground Height",
      },
      groundRadius: {
        value: 10.8,
        min: 0,
        max: 50,
        step: 0.01,
        label: "Ground Radius",
      },
      groundScale: {
        value: 1.02,
        min: 0,
        max: 5,
        step: 0.01,
        label: "Ground Scale",
      },
      groundRotation: {
        value: { x: 0.0, y: 1.2, z: 0 },
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
    const skybox = new GroundedSkybox(envMap, groundHeight, groundRadius, 2048);
    // skybox.position.y = groundHeight - 0.5;
    // skybox.scale.setScalar(2);
    return skybox;
  }, [envMap, groundRadius, groundHeight, texture]);

  return (
    <Select enabled={false}>
      {skybox && (
        <primitive
          object={skybox}
          position={[0, groundHeight, 0]}
          scale={groundScale}
          rotation={new Vector3(
            groundRotation.x,
            groundRotation.y,
            groundRotation.z
          ).toArray()}
        />
      )}
    </Select>
  );
}
