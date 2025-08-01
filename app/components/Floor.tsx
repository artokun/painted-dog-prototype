import { animated, config, SpringValue, useSpring } from "@react-spring/three";
import { useSnapshot } from "valtio";
import { bookStore } from "../store/bookStore";

export default function Floor() {
  const { focusedBookId } = useSnapshot(bookStore);

  const [floorSpring, api] = useSpring(
    () => ({
      opacity: focusedBookId !== null ? 0 : 1,
      config: config.gentle,
      delay: focusedBookId !== null ? 600 : 0,
    }),
    [focusedBookId]
  );

  return (
    <mesh
      position={[0, 0.005, 0]}
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <circleGeometry args={[0.5, 128]} />
      <animated.meshStandardMaterial
        color="#F9F6F0"
        transparent
        opacity={floorSpring.opacity}
      />
    </mesh>
  );
}
