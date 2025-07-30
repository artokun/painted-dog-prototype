import { useRef } from "react";
import { useSpring, animated, config } from "@react-spring/three";
import { useSnapshot } from "valtio";
import { bookStore } from "../store/bookStore";
import { Mesh } from "three";

export default function Backdrop() {
  const snap = useSnapshot(bookStore);
  const meshRef = useRef<Mesh>(null);

  // Show backdrop when a book is featured
  const isVisible = snap.featuredBookIndex !== null;

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
  const zPosition = 0.09; // Halfway between stack (0) and featured book (~0.3)

  // Only render the mesh when it should be interactive
  if (!isVisible && spring.opacity.get() <= 0.01) {
    return null;
  }

  return (
    <animated.mesh
      receiveShadow
      ref={meshRef}
      position={[0, 0, zPosition]}
      onPointerDown={(e) => {
        // Prevent clicks from passing through to objects behind
        e.stopPropagation();
      }}
      onPointerOver={(e) => {
        // Also stop hover events
        e.stopPropagation();
      }}
      onPointerMove={(e) => {
        // Stop pointer move events too
        e.stopPropagation();
      }}
      onPointerOut={(e) => {
        // Stop pointer out events
        e.stopPropagation();
      }}
    >
      <planeGeometry args={[10, 10, 100, 100]} />
      <animated.meshBasicMaterial
        color="#F9F6F0"
        opacity={spring.opacity}
        transparent
        depthWrite={false}
        depthTest={true}
      />
    </animated.mesh>
  );
}
