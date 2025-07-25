"use client";

import { Canvas, type ThreeElements, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type * as THREE from "three";
import App from "./components/App";

export default function Home() {
  return (
    <main className="h-screen w-screen">
      <Canvas 
        camera={{ position: [0, 0.3, 0.5], fov: 50 }}
        shadows
      >
        <App />
      </Canvas>
    </main>
  );
}
