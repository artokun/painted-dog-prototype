import { animated, config, useSpring } from "@react-spring/three";
import { useSnapshot } from "valtio";
import { useControls } from "leva";
import { bookStore } from "../store/bookStore";
import { filterStore, FilterView } from "../store/filterStore";
import * as THREE from "three";

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

  return (
    <animated.mesh
      position-y={floorSpring.yPos}
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <circleGeometry args={[0.6, 128]} />
      <animated.meshStandardMaterial
        color={floorColor}
        transparent
        opacity={floorSpring.opacity}
      />
    </animated.mesh>
  );
}
