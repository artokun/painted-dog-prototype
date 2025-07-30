"use client";

import { Canvas } from "@react-three/fiber";
import { ScrollControls } from "@react-three/drei";
import * as THREE from "three";
import App from "./components/App";
import Link from "next/link";
import { useState } from "react";
import { SortDesc } from "./components/icons/SortDesc";
import { SortBy } from "./components/icons/SortBy";
import { Search } from "./components/icons/Search";
import AuthGate from "./components/AuthGate";
import { useSnapshot } from "valtio";
import { bookStore, setActiveSortKey } from "./store/bookStore";

export default function Home() {
  return (
    <AuthGate>
      <main className="h-dvh w-screen relative bg-[#F9F6F0]">
        <Background />
        <Middle />
        <Foreground />
      </main>
    </AuthGate>
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
      <FloatingBar />
      <RightFloatingBar />
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

const FloatingBarButton = ({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      className={`flex items-center justify-center p-2 font-fields h-12 min-w-12 border-1 border-black text-black font-[500] rounded-xs ${
        active ? "bg-black text-white" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const FloatingBar = () => {
  return (
    <div className="flex justify-center fixed bottom-4 left-0 w-full h-18 gap-2">
      <div className="flex flex-row gap-4 justify-center items-center m-4 pointer-events-auto">
        <div className="flex p-1 items-center gap-1">
          <div className="bg-[#F9F6F0] p-1 flex gap-1 rounded-xs">
            <FloatingBarButton>Stack</FloatingBarButton>
            <FloatingBarButton>Grid</FloatingBarButton>
          </div>
        </div>
        <div className="bg-[#F9F6F0] p-1 flex gap-1 rounded-xs">
          <FloatingBarButton>
            <SortDesc />
          </FloatingBarButton>
          <FloatingBarButton>
            <SortBy />
          </FloatingBarButton>
          <FloatingBarButton>
            <Search />
          </FloatingBarButton>
        </div>
      </div>
    </div>
  );
};

const RightFloatingBar = () => {
  const snap = useSnapshot(bookStore);

  const setSortStep = (step: number | null) => {
    bookStore.sortStep = step;
  };

  const handleStep4 = () => {
    // Trigger Step 4 animation
    setSortStep(4);

    // After animation completes, make the sort permanent and reset step
    setTimeout(() => {
      setActiveSortKey("title-desc"); // Make the sort permanent
      setSortStep(null); // Reset step to null
    }, 1500); // Wait for animation to complete (adjust timing as needed)
  };

  const handleReset = () => {
    setActiveSortKey(null); // Clear active sort
    setSortStep(null); // Clear sort step
  };

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-20 pointer-events-auto">
      <div className="bg-[#F9F6F0] p-1 flex flex-col gap-1 rounded-xs">
        <FloatingBarButton
          active={snap.sortStep === 1}
          onClick={() => setSortStep(1)}
        >
          1
        </FloatingBarButton>
        <FloatingBarButton
          active={snap.sortStep === 2}
          onClick={() => setSortStep(2)}
        >
          2
        </FloatingBarButton>
        <FloatingBarButton
          active={snap.sortStep === 3}
          onClick={() => setSortStep(3)}
        >
          3
        </FloatingBarButton>
        <FloatingBarButton active={snap.sortStep === 4} onClick={handleStep4}>
          4
        </FloatingBarButton>
        <FloatingBarButton
          active={snap.sortStep === null && snap.activeSortKey === null}
          onClick={handleReset}
        >
          ⌫
        </FloatingBarButton>
      </div>
    </div>
  );
};
