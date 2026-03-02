"use client";

import { Environment } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { memo, useMemo } from "react";
import * as THREE from "three";
import { UltraHDRLoader } from "three/examples/jsm/Addons.js";

export const StudioEnvironment = memo(function StudioEnvironment() {
  const envMap = useLoader(UltraHDRLoader, "/painted-dog-scene_7.jpg");

  useMemo(() => {
    if (envMap) {
      envMap.mapping = THREE.EquirectangularReflectionMapping;
    }
  }, [envMap]);

  return (
    <Environment map={envMap} background environmentIntensity={0} />
  );
});
