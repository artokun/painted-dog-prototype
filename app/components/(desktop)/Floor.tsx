import { animated, config, useSpring } from "@react-spring/three";
import { useSnapshot } from "valtio";
import { useControls } from "leva";
import { bookStore } from "../../store/bookStore";
import { filterStore, FilterView } from "../../store/filterStore";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";

export default function Floor() {
  const { focusedBookId } = useSnapshot(bookStore);
  const { view } = useSnapshot(filterStore);
  const hideFloor = focusedBookId !== null;
  const isGridMode = view === FilterView.Grid;

  const { floorColor } = useControls("Floor", {
    floorColor: { value: "#e8e3de", label: "Floor Color" },
  });

  const [floorSpring] = useSpring(
    () => ({
      opacity: hideFloor || isGridMode ? 0 : 0.2,
      config: config.default,
      yPos: isGridMode ? -0.11 : 0,
      delay: hideFloor || isGridMode ? 600 : 0,
    }),
    [focusedBookId, isGridMode]
  );

  // Load the radial alpha map texture
  const alphaMap = useLoader(
    THREE.TextureLoader,
    "/models/textures/radial_1.jpg"
  );

  // Configure the texture
  useMemo(() => {
    if (alphaMap) {
      alphaMap.flipY = false;
      alphaMap.wrapS = alphaMap.wrapT = THREE.ClampToEdgeWrapping;
    }
  }, [alphaMap]);

  // Reference to the material for opacity updates
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Update material opacity based on spring
  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.opacity = floorSpring.opacity.get();
    }
  });

  return (
    <animated.mesh
      position-y={floorSpring.yPos}
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[1.2, 1.2, 32, 32]} />
      <meshStandardMaterial
        ref={materialRef}
        color={floorColor}
        transparent
        alphaMap={alphaMap}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </animated.mesh>
  );
}
