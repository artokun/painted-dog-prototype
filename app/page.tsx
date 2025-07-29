"use client";

import { Canvas } from "@react-three/fiber";
import { ScrollControls } from "@react-three/drei";
import * as THREE from "three";
import App from "./components/App";
import Link from "next/link";

export default function Home() {
  return (
    <main className="h-dvh w-screen relative bg-[#F9F6F0]">
      <Background />
      <Middle />
      <Foreground />
    </main>
  );
}

const Background = () => {
  return (
    <div className="h-full w-full flex items-center justify-center flex-col flex-wrap text-9xl font-fields text-black opacity-10 pointer-events-none">
      <h1>painted dog</h1>
      <h1>painted dog</h1>
      <h1>painted dog</h1>
      <h1>painted dog</h1>
    </div>
  );
};

const Middle = () => {
  return (
    <div className="absolute inset-0 top-0 left-0 z-10">
      <Canvas
        camera={{ position: [0, 0.01, 0.3], fov: 45 }}
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.LinearToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMappingExposure: 1.0,
        }}
      >
        <ScrollControls pages={3} damping={0.2}>
          <App />
        </ScrollControls>
      </Canvas>
    </div>
  );
};

const Foreground = () => {
  return (
    <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center flex-col z-20 pointer-events-none">
      <Header />
    </div>
  );
};

const Header = () => {
  return (
    <div className="fixed top-0 left-0 w-full flex items-center justify-center z-20 text-black font-[500] border-b-1 border-gray-200 backdrop-blur-sm pointer-events-auto">
      <div className="flex items-center justify-between max-w-screen-lg mx-auto gap-4 px-4 h-18 w-full">
        <div className="flex gap-2 items-center flex-1">
          <Link href="/reviews">Reviews</Link>
          <span>&middot;</span>
          <Link href="/newsletter">Newsletter</Link>
        </div>
        <h1 className="text-4xl flex justify-center whitespace-nowrap items-center text-center font-fields text-black font-[600] flex-1">
          painted dog
        </h1>
        <div className="gap-2 items-center flex-1 flex justify-end">
          <Link href="/podcast">Podcast</Link>
          <button className="text-gray-800">Menu</button>
        </div>
      </div>
    </div>
  );
};
