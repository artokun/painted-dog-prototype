"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Suspense, useMemo } from "react";
import BookStack from "./BookStack";
import Lights from "../Lights";
import { getBookStackHeight, getContentfulBookSize } from "@/app/utils/book";
import { Leva, useControls } from "leva";
import { DragControls, ScrollControls, useScroll } from "@react-three/drei";
import { lerp } from "three/src/math/MathUtils.js";
import { useSpring } from "@react-spring/three";
import { bookStore } from "@/app/store/bookStore";
import { useSnapshot } from "valtio";

export const MiddleMobile = () => {
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
          <ScrollControls pages={2} damping={0} horizontal>
            <Lights />
            <BookStack />
            <MobileCameraController />
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  );
};

const MobileCameraController = () => {
  const { camera } = useThree();
  const scroll = useScroll();
  const { isRendered } = useSnapshot(bookStore);
  const [width, thickness, height] = getContentfulBookSize("280x260");

  const distance = useMemo(() => {
    const bookWidth = 0.28;
    const desiredScreenPercentage = 0.7;
    const fov = (camera as THREE.PerspectiveCamera).fov;
    const calculatedDistance =
      bookWidth /
      desiredScreenPercentage /
      (2 * Math.tan((fov * Math.PI) / 360));

    return calculatedDistance;
  }, [camera]);

  const stackHeight = useMemo(() => {
    return getBookStackHeight();
  }, [isRendered]);

  const { leftLimit, rightLimit } = useMemo(() => {
    return {
      leftLimit: -0.01,
      rightLimit: stackHeight + 0.01,
    };
  }, [stackHeight]);

  const [{ cameraX }, api] = useSpring(() => ({
    cameraX: lerp(leftLimit, rightLimit, scroll.offset),
    immediate: true,
  }));

  useFrame(() => {
    const scrollValue = scroll.offset;
    const scrollBasedX = leftLimit + (rightLimit - leftLimit) * scrollValue;

    api.start({
      cameraX: scrollBasedX,
    });

    const currentX = cameraX.get();

    camera.position.x = currentX;
    camera.position.y = 0;
    camera.position.z = distance;

    camera.lookAt(
      currentX < 0 ? 0 : currentX > stackHeight ? stackHeight : currentX,
      0,
      0
    );
  });

  return null;
};
