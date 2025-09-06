"use client";

import { useRef } from "react";
import { useSpring, animated, config } from "@react-spring/three";
import { useSnapshot } from "valtio";
import { useControls } from "leva";
import { bookStore } from "../store/bookStore";
import { Mesh } from "three";
import { filterStore, FilterView } from "../store/filterStore";

export default function Backdrop() {
  const { focusedBookId } = useSnapshot(bookStore);
  const { view } = useSnapshot(filterStore);
  const isGridMode = view === FilterView.Grid;
  const meshRef = useRef<Mesh>(null);

  const { backdropColor } = useControls("Backdrop", {
    backdropColor: { value: "#fffee9", label: "Backdrop Color" },
  });

  // Show backdrop when a book is focused
  const isVisible = focusedBookId !== null;

  // Spring for opacity animation
  const [spring] = useSpring(
    () => ({
      opacity: isVisible ? 1 : 0,
      config: isVisible ? config.stiff : config.gentle,
      delay: isVisible ? 600 : 0, // Only delay on fade in, not fade out
    }),
    [isVisible]
  );

  // Position the backdrop between the stack and featured book
  // Using a Z position that's closer than the featured book but further than the stack
  const zPosition = isGridMode ? -0.45 : 0.09; // Halfway between stack (0) and featured book (~0.3)

  // Only render the mesh when it should be interactive
  if (!isVisible && spring.opacity.get() <= 0.01) {
    return null;
  }

  return (
    <animated.mesh
      receiveShadow
      ref={meshRef}
      position={[0, 0, zPosition]}
      onClick={(e) => {
        if (focusedBookId !== null) {
          e.stopPropagation();
        }
      }}
    >
      <planeGeometry args={[10, 10, 100, 100]} />
      <animated.meshBasicMaterial
        color={backdropColor}
        opacity={spring.opacity}
        transparent
        depthWrite={false}
        depthTest={true}
      />
    </animated.mesh>
  );
}
