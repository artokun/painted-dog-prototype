"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import App from "./App";
import * as THREE from "three";
import { Suspense, useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { hydrateAuth } from "@/app/store/authStore";

export const Middle = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    hydrateAuth();
  }, []);

  return (
    <div id="middle" className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0.1, 0.676], fov: 45 }}
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.LinearToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMappingExposure: 1.0,
          powerPreference: isMobile ? "low-power" : "high-performance",
          alpha: isMobile,
        }}
      >
        <Suspense fallback={null}>
          <App />
        </Suspense>
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
};
