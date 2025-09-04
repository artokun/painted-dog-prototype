import { animated, config, useSpring } from "@react-spring/three";
import { useSnapshot } from "valtio";
import { bookStore } from "../store/bookStore";
import { filterStore, FilterView } from "../store/filterStore";

export default function Floor() {
  const { focusedBookId } = useSnapshot(bookStore);
  const { view } = useSnapshot(filterStore);
  const hideFloor = focusedBookId !== null;
  const isGridMode = view === FilterView.Grid;

  const [floorSpring] = useSpring(
    () => ({
      opacity: hideFloor ? 0 : 1,
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
      <circleGeometry args={[0.5, 128]} />
      <animated.meshStandardMaterial
        color="#F5E9DC"
        transparent
        opacity={floorSpring.opacity}
      />
    </animated.mesh>
  );
}
