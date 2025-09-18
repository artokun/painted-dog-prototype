"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Suspense, useMemo } from "react";
import BookStack from "./BookStack";
import Lights from "../Lights";
import { getContentfulBookSize } from "@/app/utils/book";
import { Leva, useControls } from "leva";

export const MiddleMobile = () => {
  const [width, thickness, height] = getContentfulBookSize("280x260");

  return (
    <div
      id="middle"
      className="absolute inset-0 top-0 left-0 z-10 bg-[#e8e3de]"
    >
      <Canvas
        camera={{
          fov: 45,
        }}
        // shadows
        gl={{
          // antialias: true,
          toneMapping: THREE.LinearToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMappingExposure: 1.0,
          // powerPreference: "high-performance",
          // depth: false,
          // alpha: false,
        }}
      >
        <Suspense fallback={null}>
          <Lights />
          <group position={[0, -height / 2, 0]}>
            <BookStack />
          </group>
        </Suspense>
        <MobileCameraController />
      </Canvas>
    </div>
  );
};

const MobileCameraController = () => {
  const { camera } = useThree();
  const [width, thickness, height] = getContentfulBookSize("280x260");

  // Camera FOV and aspect ratio
  const fov = 45;
  const fovRadians = (fov * Math.PI) / 180;
  const halfFov = fovRadians / 2;
  const viewportHeightAtUnitDistance = 2 * Math.tan(halfFov);
  const viewportWidthAtUnitDistance =
    viewportHeightAtUnitDistance * (camera as THREE.PerspectiveCamera).aspect;

  // Target constraints
  const heightConstraintPercentage = 0.9; // 80% of viewport height
  const widthConstraintPercentage = 0.9; // 90% of viewport width

  // When book cover faces camera: book height fits in viewport height, book width fits in viewport width
  const distanceForHeightConstraint =
    height / (heightConstraintPercentage * viewportHeightAtUnitDistance);
  const distanceForWidthConstraint =
    width / (widthConstraintPercentage * viewportWidthAtUnitDistance);

  // Use the more restrictive constraint (further distance)
  const optimalZDistance = Math.max(
    distanceForHeightConstraint,
    distanceForWidthConstraint
  );

  const { cameraPosition, cameraLookAt } = useControls({
    cameraPosition: {
      value: [0, 0, optimalZDistance],
      min: -10,
      max: 10,
      step: 0.01,
    },
    cameraLookAt: {
      value: [0, 0, 0],
      min: -10,
      max: 10,
      step: 0.01,
    },
  });

  useFrame(() => {
    camera.position.set(...cameraPosition);
    camera.lookAt(...cameraLookAt);
  });

  return null;
};
