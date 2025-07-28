import { RigidBody, CoefficientCombineRule } from "@react-three/rapier";
import { memo } from "react";

const Table = memo(function Table() {
  return (
    <RigidBody
      type="fixed"
      colliders="cuboid"
      restitution={0}
      friction={10}
      frictionCombineRule={CoefficientCombineRule.Min}
      restitutionCombineRule={CoefficientCombineRule.Min}
    >
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} />
        <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.7} />
      </mesh>
    </RigidBody>
  );
});

export default Table;