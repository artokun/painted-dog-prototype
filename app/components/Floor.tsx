import { animated, SpringValue } from "@react-spring/three";

interface FloorProps {
  opacity: SpringValue<number>;
}

export default function Floor({ opacity }: FloorProps) {
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
        opacity={opacity}
      />
    </mesh>
  );
}
