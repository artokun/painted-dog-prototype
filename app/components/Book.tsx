import { useRef, useEffect, useState } from "react";
import { Text } from "@react-three/drei";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BookProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  spawnDelay?: number;
}

function Book({
  position,
  size,
  color,
  spawnDelay = 0,
}: BookProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [width, _, depth] = size;
  const [isHovered, setIsHovered] = useState(false);
  const [hasSpawned, setHasSpawned] = useState(false);

  // Use refs for values that change in useFrame
  const isKinematicRef = useRef(false);
  const isSleepingRef = useRef(false);
  const settledPositionRef = useRef<{ x: number; y: number; z: number } | null>(
    null
  );
  const currentZRef = useRef(position[2]);
  const opacityRef = useRef(0);

  // Handle spawn animation
  useEffect(() => {
    if (spawnDelay === Number.MAX_SAFE_INTEGER) return; // Don't spawn if delay is max

    const timer = setTimeout(() => {
      setHasSpawned(true);
    }, spawnDelay);
    return () => clearTimeout(timer);
  }, [spawnDelay]);

  // Monitor sleep state and handle opacity
  useFrame(() => {
    // Handle opacity fade-in
    if (hasSpawned && opacityRef.current < 1) {
      opacityRef.current = Math.min(1, opacityRef.current + 0.35); // ~3 frames to full opacity
      if (meshRef.current && meshRef.current.material) {
        (meshRef.current.material as THREE.MeshStandardMaterial).opacity =
          opacityRef.current;
      }
    }

    // Handle sleep state
    if (rigidBodyRef.current && !isKinematicRef.current && hasSpawned) {
      const sleeping = rigidBodyRef.current.isSleeping();
      if (sleeping && !isSleepingRef.current) {
        // Capture the settled position before converting to kinematic
        const pos = rigidBodyRef.current.translation();
        settledPositionRef.current = { x: pos.x, y: pos.y, z: pos.z };
        currentZRef.current = pos.z;

        isSleepingRef.current = true;
        isKinematicRef.current = true;
        rigidBodyRef.current.setBodyType(2, true); // 2 = KinematicPositionBased
      }
    }
  });

  // Handle hover animation
  useFrame(() => {
    if (
      isKinematicRef.current &&
      rigidBodyRef.current &&
      groupRef.current &&
      settledPositionRef.current
    ) {
      const baseZ = settledPositionRef.current.z;
      const targetZ = isHovered ? baseZ + 0.02 : baseZ; // Slide out 2cm from settled position
      const newZ = THREE.MathUtils.lerp(currentZRef.current, targetZ, 0.1);
      currentZRef.current = newZ;

      rigidBodyRef.current.setTranslation(
        {
          x: settledPositionRef.current.x,
          y: settledPositionRef.current.y,
          z: newZ,
        },
        true
      );

      // Update the visual group position to match
      groupRef.current.position.z = newZ - baseZ;
    }
  });

  if (!hasSpawned) return null;

  // Start books at their target position (no drop)
  const startPosition: [number, number, number] = [
    position[0],
    position[1], // Start at exact target position
    position[2],
  ];

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={startPosition}
      restitution={0.01}
      lockRotations={true}
      colliders="cuboid"
      type="dynamic"
    >
      <group
        ref={groupRef}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setIsHovered(true);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setIsHovered(false);
        }}
      >
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial
            color={color}
            metalness={0.1}
            roughness={0.8}
            transparent
            opacity={0}
          />
        </mesh>

        {/* Title - On the spine facing forward */}
        <Text
          position={[-width / 3, 0, depth / 2 + 0.0002]}
          rotation={[0, 0, 0]}
          fontSize={0.008}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/fields-bold.otf"
          raycast={() => null}
        >
          The Promise
        </Text>

        {/* Author - On the spine facing forward */}
        <Text
          position={[width / 3, 0, depth / 2 + 0.0002]}
          rotation={[0, 0, 0]}
          fontSize={0.005}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
          fontWeight={300}
          raycast={() => null}
        >
          Damon Galmut
        </Text>
      </group>
    </RigidBody>
  );
}

export default Book;
