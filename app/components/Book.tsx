import { useRef, useEffect, useState, Suspense } from "react";
import { Center, Text, Text3D } from "@react-three/drei";
import {
  RigidBody,
  type RapierRigidBody,
  CuboidCollider,
} from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  useSpring,
  animated,
  config,
  useChain,
  useSpringRef,
} from "@react-spring/three";
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
  cmsData?: {
    title: string;
    author: string;
    price: number;
    description: string;
  };
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
  cmsData,
}: BookProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const textGroupRef = useRef<THREE.Group>(null); // For syncing text with book
  const [width, , depth] = size;
  // const [isHovered, setIsHovered] = useState(false); // Disabled for debugging
  const [hasSpawned, setHasSpawned] = useState(false);
  const snap = useSnapshot(bookStore);

  // Mouse position for featured book rotation
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const [mouseRotation, setMouseRotation] = useState({ x: 0, y: 0 });

  // Use refs for values that change in useFrame
  const isKinematicRef = useRef(false);
  const isSleepingRef = useRef(false);
  const settledPositionRef = useRef<{ x: number; y: number; z: number } | null>(
    null
  );
  const originalSettledZRef = useRef<number | null>(null);
  // const currentZRef = useRef(position[2]); // Not needed without hover

  // Default book data for fallback
  const bookTitle = cmsData?.title || `Book ${index + 1}`;
  const bookAuthor = cmsData?.author || "Unknown Author";

  // Dynamic font sizing for spine based on title length
  const getSpineFontSize = (text: string) => {
    if (text.length > 20) return 0.005; // Very small for long titles
    if (text.length > 15) return 0.006; // Small for medium titles
    if (text.length > 10) return 0.007; // Normal-small for slightly long titles
    return 0.008; // Normal size for short titles
  };

  // Text wrapping function for face titles - returns array of lines
  const wrapText = (text: string, maxLength: number = 12): string[] => {
    if (text.length <= maxLength) return [text];

    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      if ((currentLine + word).length > maxLength) {
        if (currentLine) {
          lines.push(currentLine.trim());
          currentLine = word + " ";
        } else {
          // Word is too long, just add it
          lines.push(word);
        }
      } else {
        currentLine += word + " ";
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    return lines;
  };

  // Calculate if this book should drop (is above the featured book)
  const shouldDrop =
    snap.featuredBookIndex !== null &&
    index > snap.featuredBookIndex &&
    !isFeatured;

  // Spring refs for chaining
  const slideRef = useSpringRef();
  const rotateRef = useSpringRef();

  // Spring for vertical drop animation (books above featured)
  const [dropSpring] = useSpring(
    () => ({
      dropY: shouldDrop ? -snap.slidOutBookThickness : 0,
      config: config.gentle,
    }),
    [shouldDrop, snap.slidOutBookThickness]
  );

  // Calculate minimum Y lift needed to prevent table clipping
  // When book rotates 90 degrees, its corner extends down by depth/2
  // We need to ensure the lowest point stays 2cm (0.02) above table
  const tableHeight = 0.0045; // Table top position from App.tsx
  const minClearance = 0.05; // 5cm clearance

  // When featured and rotating, calculate if we need to lift the book
  const calculateMinLift = () => {
    if (!isFeatured || !settledPositionRef.current) return 0;

    // Current book bottom when flat
    const currentBottom = settledPositionRef.current.y - size[1] / 2;

    // When rotated 90 degrees, the book's corner extends down by depth/2
    const rotatedBottom = settledPositionRef.current.y - depth / 2;

    // Required position to maintain clearance
    const requiredBottom = tableHeight + minClearance;

    // If rotated bottom would go below required position, calculate lift needed
    if (rotatedBottom < requiredBottom) {
      return requiredBottom - rotatedBottom;
    }

    return 0;
  };

  // Spring for slide animation
  const [slideSpring] = useSpring(() => {
    const minLift = calculateMinLift();
    return {
      ref: slideRef,
      from: { posY: 0, posZ: 0 },
      to: isFeatured
        ? {
            posY: isTopBook ? width / 2 : minLift,
            posZ: isTopBook ? 0 : depth,
          }
        : { posY: 0, posZ: 0 },
      config: config.gentle,
    };
  }, [isFeatured, isTopBook, width, depth, settledPositionRef.current]);

  // Spring for rotation animation
  const [rotateSpring] = useSpring(
    () => ({
      ref: rotateRef,
      from: { rotX: 0, rotY: 0 },
      to: isFeatured
        ? { rotX: -Math.PI / 2, rotY: -Math.PI / 2 }
        : { rotX: 0, rotY: 0 },
      config: config.gentle,
    }),
    [isFeatured]
  );

  // Spring for mouse-based tilt when featured
  const [tiltSpring] = useSpring(
    () => ({
      tiltX: mouseRotation.x,
      tiltY: mouseRotation.y,
      config: { mass: 1, tension: 350, friction: 40 },
    }),
    [mouseRotation]
  );

  // Chain animations: slide featured, then rotate
  useChain(
    isFeatured
      ? isTopBook
        ? [slideRef, rotateRef]
        : [slideRef, rotateRef]
      : [rotateRef, slideRef],
    isFeatured
      ? isTopBook
        ? [0, 0]
        : [0, 0.3] // Top book: both at once, others: rotate after 30% of slide
      : [0, 0.3] // Reverse: rotate first, then slide
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

  // Handle mouse movement for featured book
  useEffect(() => {
    if (!isFeatured) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -1 to 1
      mouseX.current = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY.current = -(e.clientY / window.innerHeight) * 2 + 1;

      // Set rotation based on mouse position (subtle effect)
      const maxTilt = 0.15; // Maximum tilt in radians (~8.5 degrees)
      setMouseRotation({
        x: mouseY.current * maxTilt, // Pitch
        y: mouseX.current * maxTilt, // Roll (reversed for natural feel)
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isFeatured]);

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

  // Report position updates for camera tracking and sync text
  useFrame(() => {
    // Report actual Y position when featured
    if (
      isFeatured &&
      onPositionUpdate &&
      settledPositionRef.current &&
      groupRef.current
    ) {
      const actualY =
        settledPositionRef.current.y + groupRef.current.position.y;
      onPositionUpdate(actualY);
    }

    // Text is now inside the rotation groups, no need to sync separately

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
    <Suspense fallback={null}>
      <RigidBody
        ref={rigidBodyRef}
        position={startPosition}
        restitution={0.01}
        lockRotations={true}
        colliders={false}
        type="dynamic"
      >
        {/* <CuboidCollider args={[size[0], size[1], size[2]]} /> */}
        <animated.group position-y={dropSpring.dropY}>
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
            {/* Additional rotation group for mouse-based tilt */}
            <animated.group
              rotation-x={isFeatured ? tiltSpring.tiltY : 0}
              rotation-z={isFeatured ? tiltSpring.tiltX : 0}
            >
              <mesh ref={meshRef} castShadow receiveShadow>
                <boxGeometry args={size} />
                <meshStandardMaterial
                  color={color}
                  metalness={0.1}
                  roughness={0.8}
                  transparent
                  opacity={1}
                />
              </mesh>

              {/* Text group - now inside tilt rotation */}
              <group ref={textGroupRef}>
                {/* Spine text - always visible */}
                {/* Title - On the spine facing forward, left aligned */}
                <Text
                  position={[-width / 2 + 0.006, 0, depth / 2 + 0.0002]}
                  rotation={[0, 0, 0]}
                  fontSize={getSpineFontSize(bookTitle)}
                  color="#ffffff"
                  anchorX="left"
                  anchorY="middle"
                  font="/fonts/fields-bold.otf"
                  raycast={() => null}
                >
                  {bookTitle}
                </Text>

                {/* Author - On the spine facing forward, right aligned */}
                <Text
                  position={[width / 2 - 0.006, 0, depth / 2 + 0.0002]}
                  rotation={[0, 0, 0]}
                  fontSize={0.005}
                  color="#cccccc"
                  anchorX="right"
                  anchorY="middle"
                  fontWeight={300}
                  raycast={() => null}
                >
                  {bookAuthor}
                </Text>

                {/* Front cover text - Title centered in main area */}
                {(() => {
                  const lines = wrapText(bookTitle);
                  const lineHeight = 0.012; // Space between lines
                  const totalHeight = (lines.length - 1) * lineHeight;
                  const startY = totalHeight / 2;
                  
                  return lines.map((line, index) => (
                    <Center key={index} position={[0.01 - (index * lineHeight - startY), -size[1] / 2 - 0.001, 0]}>
                      <Text3D
                        rotation={[Math.PI / 2, 0, -Math.PI / 2]}
                        font="/FSP DEMO - Fields Display_Bold.json"
                        size={0.009}
                        height={0.0005} // Extrusion depth
                        curveSegments={12}
                        bevelEnabled={true}
                        bevelThickness={0.00005}
                        bevelSize={0.00005}
                        bevelOffset={0}
                        bevelSegments={5}
                        letterSpacing={0}
                        raycast={() => null}
                      >
                        {line}
                        <meshStandardMaterial
                          color="#ffffff"
                          metalness={1}
                          roughness={0.2}
                        />
                      </Text3D>
                    </Center>
                  ));
                })()}

                {/* Front cover text - Author below title */}
                <Text
                  position={[-0.02, -size[1] / 2 - 0.0002, 0]}
                  rotation={[Math.PI / 2, 0, -Math.PI / 2]}
                  fontSize={0.006}
                  color="#cccccc"
                  anchorX="center"
                  anchorY="middle"
                  fontWeight={300}
                  raycast={() => null}
                  maxWidth={width * 0.8}
                  textAlign="center"
                >
                  {bookAuthor}
                </Text>
              </group>
            </animated.group>
          </animated.group>
        </animated.group>
      </RigidBody>
    </Suspense>
  );
}

export default Book;
