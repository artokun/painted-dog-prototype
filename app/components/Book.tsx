import { useRef, useEffect, useState } from "react";
import { Text } from "@react-three/drei";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSpring, animated, config, useChain, useSpringRef } from "@react-spring/three";
import { useSnapshot } from "valtio";
import { bookStore } from "../store/bookStore";

interface BookProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  spawnDelay?: number;
  isFeatured?: boolean;
  onClick?: () => void;
  isTopBook?: boolean;
  onPositionUpdate?: (y: number) => void;
  index: number;
}

function Book({
  position,
  size,
  color,
  spawnDelay = 0,
  isFeatured = false,
  onClick,
  isTopBook = false,
  onPositionUpdate,
  index,
}: BookProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [width, , depth] = size;
  // const [isHovered, setIsHovered] = useState(false); // Disabled for debugging
  const [hasSpawned, setHasSpawned] = useState(false);
  const snap = useSnapshot(bookStore);

  // Use refs for values that change in useFrame
  const isKinematicRef = useRef(false);
  const isSleepingRef = useRef(false);
  const settledPositionRef = useRef<{ x: number; y: number; z: number } | null>(
    null
  );
  const originalSettledZRef = useRef<number | null>(null);
  // const currentZRef = useRef(position[2]); // Not needed without hover
  
  // Calculate vertical offset based on featured book
  const verticalOffset = useRef(0);
  useEffect(() => {
    if (snap.featuredBookIndex !== null) {
      if (index > snap.featuredBookIndex && !isFeatured) {
        // This book is above the featured book, move down
        verticalOffset.current = -snap.slidOutBookThickness;
      } else {
        verticalOffset.current = 0;
      }
    } else {
      verticalOffset.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap.featuredBookIndex, snap.slidOutBookThickness, isFeatured]); // index is stable
  
  // Spring refs for chaining
  const slideRef = useSpringRef();
  const rotateRef = useSpringRef();
  const dropRef = useSpringRef();
  
  // Spring for vertical drop animation (books above featured)
  const [dropSpring] = useSpring(() => ({
    ref: dropRef,
    from: { dropY: 0 },
    to: { dropY: verticalOffset.current },
    config: config.gentle
  }), [verticalOffset.current]);
  
  // Spring for slide animation
  const [slideSpring] = useSpring(() => ({
    ref: slideRef,
    from: { posY: 0, posZ: 0 },
    to: isFeatured ? {
      posY: isTopBook ? width / 2 : 0,
      posZ: isTopBook ? 0 : depth * 1.5
    } : { posY: 0, posZ: 0 },
    config: config.gentle
  }), [isFeatured, isTopBook, width, depth]);
  
  // Spring for rotation animation
  const [rotateSpring] = useSpring(() => ({
    ref: rotateRef,
    from: { rotX: 0, rotY: 0 },
    to: isFeatured ? { rotX: -Math.PI / 2, rotY: -Math.PI / 2 } : { rotX: 0, rotY: 0 },
    config: config.gentle
  }), [isFeatured]);
  
  // Chain animations: drop books above, slide featured, then rotate
  useChain(
    isFeatured ? 
      (isTopBook ? [dropRef, slideRef, rotateRef] : [dropRef, slideRef, rotateRef]) : 
      [rotateRef, slideRef, dropRef],
    isFeatured ? 
      (isTopBook ? [0, 0, 0] : [0, 0, 0.3]) : // Top book: all at once, others: rotate after 30% of slide
      [0, 0.3, 0.3] // Reverse: rotate first, then slide and drop
  );

  // Handle spawn animation
  useEffect(() => {
    if (spawnDelay === Number.MAX_SAFE_INTEGER) return; // Don't spawn if delay is max

    const timer = setTimeout(() => {
      setHasSpawned(true);
    }, spawnDelay);
    return () => clearTimeout(timer);
  }, [spawnDelay]);

  // No need for manual animation state management - springs handle it

  // Monitor sleep state
  useFrame(() => {

    // Handle sleep state
    if (rigidBodyRef.current && !isKinematicRef.current && hasSpawned) {
      const sleeping = rigidBodyRef.current.isSleeping();
      if (sleeping && !isSleepingRef.current) {
        // Capture the settled position before converting to kinematic
        const pos = rigidBodyRef.current.translation();
        settledPositionRef.current = { x: pos.x, y: pos.y, z: pos.z };
        
        // Store original Z position if not already stored
        if (originalSettledZRef.current === null) {
          originalSettledZRef.current = pos.z;
        }

        isSleepingRef.current = true;
        isKinematicRef.current = true;
        rigidBodyRef.current.setBodyType(2, true); // 2 = KinematicPositionBased
      }
    }
  });

  // Report position updates for camera tracking
  useFrame(() => {
    // Report actual Y position when featured
    if (isFeatured && onPositionUpdate && settledPositionRef.current && groupRef.current) {
      const actualY = settledPositionRef.current.y + groupRef.current.position.y;
      onPositionUpdate(actualY);
    }

    // Handle rigid body position updates
    if (
      isKinematicRef.current &&
      rigidBodyRef.current &&
      settledPositionRef.current
    ) {
      // Always use original Z position as base
      const baseZ = originalSettledZRef.current ?? settledPositionRef.current.z;
      
      // Keep rigid body at settled position
      rigidBodyRef.current.setTranslation(
        {
          x: settledPositionRef.current.x,
          y: settledPositionRef.current.y,
          z: baseZ,
        },
        true
      );
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
      <animated.group
        ref={groupRef}
        position-y={slideSpring.posY}
        position-z={slideSpring.posZ}
        rotation-x={rotateSpring.rotX}
        rotation-y={rotateSpring.rotY}
        onPointerEnter={(e) => {
          e.stopPropagation();
          // Hover disabled for debugging
          // if (!isFeatured) setIsHovered(true);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          // setIsHovered(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
      >
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial
            color={color}
            metalness={0.1}
            roughness={0.8}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Spine text - always visible */}
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
      </animated.group>
    </RigidBody>
  );
}

export default Book;
