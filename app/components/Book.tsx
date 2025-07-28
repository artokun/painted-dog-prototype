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
  isFeatured?: boolean;
  onClick?: () => void;
  isTopBook?: boolean;
  onPositionUpdate?: (y: number) => void;
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
}: BookProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [width, _, depth] = size;
  // const [isHovered, setIsHovered] = useState(false); // Disabled for debugging
  const [hasSpawned, setHasSpawned] = useState(false);

  // Use refs for values that change in useFrame
  const isKinematicRef = useRef(false);
  const isSleepingRef = useRef(false);
  const settledPositionRef = useRef<{ x: number; y: number; z: number } | null>(
    null
  );
  const originalSettledZRef = useRef<number | null>(null);
  // const currentZRef = useRef(position[2]); // Not needed without hover
  const opacityRef = useRef(0);
  const currentRotationYRef = useRef(0);
  const targetRotationYRef = useRef(isFeatured ? -Math.PI / 2 : 0);
  const currentRotationXRef = useRef(0);
  const targetRotationXRef = useRef(isFeatured ? -Math.PI / 2 : 0);
  const currentYOffsetRef = useRef(0);
  const targetYOffsetRef = useRef(0);
  const currentZOffsetRef = useRef(0);
  const targetZOffsetRef = useRef(0);
  const animationPhaseRef = useRef<'idle' | 'sliding-out' | 'rotating' | 'rotating-back' | 'sliding-in'>('idle');

  // Handle spawn animation
  useEffect(() => {
    if (spawnDelay === Number.MAX_SAFE_INTEGER) return; // Don't spawn if delay is max

    const timer = setTimeout(() => {
      setHasSpawned(true);
    }, spawnDelay);
    return () => clearTimeout(timer);
  }, [spawnDelay]);

  // Update target positions when featured state changes
  useEffect(() => {
    if (isFeatured) {
      // Clear hover state when becoming featured
      // setIsHovered(false);
      
      // Start sliding phase
      animationPhaseRef.current = 'sliding-out';
      
      if (isTopBook) {
        // Top book just lifts up
        targetYOffsetRef.current = width / 2;
        targetZOffsetRef.current = 0;
        // Top book can rotate immediately
        targetRotationYRef.current = -Math.PI / 2;
        targetRotationXRef.current = -Math.PI / 2;
      } else {
        // Other books: slide out first, rotation will happen in the animation loop
        targetYOffsetRef.current = 0;
        // Move forward by 1.5x the book depth
        targetZOffsetRef.current = depth * 1.5;
        // Don't set rotation targets yet - will be set after sliding completes
      }
    } else if (!isFeatured && animationPhaseRef.current !== 'idle') {
      // Start reverse animation only if we were previously animating
      if (isTopBook) {
        // Top book: rotate and lower simultaneously
        animationPhaseRef.current = 'rotating-back';
        targetRotationYRef.current = 0;
        targetRotationXRef.current = 0;
        targetYOffsetRef.current = 0;
        targetZOffsetRef.current = 0;
      } else {
        // Other books: rotate back first, keep position
        animationPhaseRef.current = 'rotating-back';
        targetRotationYRef.current = 0;
        targetRotationXRef.current = 0;
        // Don't change Z offset yet - will slide back after rotation completes
      }
    }
  }, [isFeatured, width, depth, isTopBook]);

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

  // Handle hover and rotation animation
  useFrame(() => {
    // Handle rotation animation and Y/Z offset
    if (groupRef.current) {
      const lerpSpeed = 0.08; // Faster with blended animations

      // Apply Y offset for featured book
      const newYOffset = THREE.MathUtils.lerp(
        currentYOffsetRef.current,
        targetYOffsetRef.current,
        lerpSpeed
      );
      currentYOffsetRef.current = newYOffset;
      groupRef.current.position.y = newYOffset;
      
      // Report actual Y position when featured
      if (isFeatured && onPositionUpdate && settledPositionRef.current) {
        const actualY = settledPositionRef.current.y + newYOffset;
        onPositionUpdate(actualY);
      }

      // Apply Z offset for featured book (move toward camera)
      const newZOffset = THREE.MathUtils.lerp(
        currentZOffsetRef.current,
        targetZOffsetRef.current,
        lerpSpeed
      );
      currentZOffsetRef.current = newZOffset;
      groupRef.current.position.z = newZOffset;

      // Check animation phase transitions with blending
      if (animationPhaseRef.current === 'sliding-out' && isFeatured && !isTopBook) {
        // Start rotating when slide is 60% complete for smoother blend
        const slideProgress = newZOffset / targetZOffsetRef.current;
        if (slideProgress > 0.6) {
          // Start rotating phase while still sliding
          animationPhaseRef.current = 'rotating';
          targetRotationYRef.current = -Math.PI / 2;
          targetRotationXRef.current = -Math.PI / 2;
        }
      } else if (animationPhaseRef.current === 'rotating-back') {
        // Start sliding back when rotation is 40% complete
        const rotateProgress = (Math.abs(currentRotationYRef.current) + Math.abs(currentRotationXRef.current)) / Math.PI;
        if (rotateProgress < 0.4) {
          if (isTopBook) {
            // Top book animation complete
            animationPhaseRef.current = 'idle';
          } else {
            // Start sliding back in for other books while still rotating
            animationPhaseRef.current = 'sliding-in';
            targetZOffsetRef.current = 0;
          }
        }
      } else if (animationPhaseRef.current === 'sliding-in' && !isFeatured && !isTopBook) {
        const slideComplete = Math.abs(newZOffset) < 0.001;
        const rotateComplete = Math.abs(currentRotationYRef.current) < 0.001 && 
                              Math.abs(currentRotationXRef.current) < 0.001;
        if (slideComplete && rotateComplete) {
          // Animation complete when both are done
          animationPhaseRef.current = 'idle';
        }
      }

      // Apply rotation
      const newRotationY = THREE.MathUtils.lerp(
        currentRotationYRef.current,
        targetRotationYRef.current,
        lerpSpeed
      );
      currentRotationYRef.current = newRotationY;
      groupRef.current.rotation.y = newRotationY;

      const newRotationX = THREE.MathUtils.lerp(
        currentRotationXRef.current,
        targetRotationXRef.current,
        lerpSpeed
      );
      currentRotationXRef.current = newRotationX;
      groupRef.current.rotation.x = newRotationX;
    }

    // Handle rigid body position updates
    if (
      isKinematicRef.current &&
      rigidBodyRef.current &&
      settledPositionRef.current
    ) {
      // Always use original Z position as base
      const baseZ = originalSettledZRef.current ?? settledPositionRef.current.z;
      
      if (isFeatured || animationPhaseRef.current !== 'idle') {
        // When featured or animating, update rigid body position
        // Don't add the offset here since the group already has it
        rigidBodyRef.current.setTranslation(
          {
            x: settledPositionRef.current.x,
            y: settledPositionRef.current.y,
            z: baseZ,
          },
          true
        );
      } else {
        // When idle, keep at original position (no hover)
        rigidBodyRef.current.setTranslation(
          {
            x: settledPositionRef.current.x,
            y: settledPositionRef.current.y,
            z: baseZ,
          },
          true
        );
        
        // Reset visual position to ensure no offset
        if (groupRef.current) {
          groupRef.current.position.z = 0;
          groupRef.current.position.y = 0;
        }
      }
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
            opacity={0}
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
      </group>
    </RigidBody>
  );
}

export default Book;
