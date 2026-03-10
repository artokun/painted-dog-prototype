"use client";

import { Environment } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { memo, useMemo } from "react";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/Addons.js";

export const StudioEnvironment = memo(function StudioEnvironment() {
  const envMap = useLoader(RGBELoader, "/env-map.hdr");

  useMemo(() => {
    if (envMap) {
      envMap.mapping = THREE.EquirectangularReflectionMapping;
    }
  }, [envMap]);

  return (
    <Environment map={envMap} background environmentIntensity={0} />
  );
});
