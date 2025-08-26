import { animated, config, SpringValue, useSpring } from "@react-spring/three";
import { useSnapshot } from "valtio";
import { bookStore } from "../store/bookStore";
import { filterStore, FilterView } from "../store/filterStore";

export default function Floor() {
  const { focusedBookId } = useSnapshot(bookStore);
  const { view } = useSnapshot(filterStore);
  const isGridMode = view === FilterView.Grid;
  const hideFloor = isGridMode || focusedBookId !== null;

  const [floorSpring, api] = useSpring(
    () => ({
      opacity: hideFloor ? 0 : 1,
      config: config.gentle,
      delay: hideFloor ? 600 : 0,
    }),
    [focusedBookId, isGridMode]
  );

  return (
    <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.5, 128]} />
      <animated.meshStandardMaterial
        color="#F9F6F0"
        transparent
        opacity={floorSpring.opacity}
      />
    </mesh>
  );
}
