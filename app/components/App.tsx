import { useRef, useEffect, useState } from "react";
import { Environment, OrbitControls, Text } from "@react-three/drei";
import {
  Physics,
  RigidBody,
  CoefficientCombineRule,
  useRapier,
  RigidBodyApi,
} from "@react-three/rapier";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Table() {
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
}

interface BookProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

function Book({ position, size, color }: BookProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rigidBodyRef = useRef<RigidBodyApi>(null);
  const [width, thickness, depth] = size;
  const [isHovered, setIsHovered] = useState(false);
  const [isKinematic, setIsKinematic] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const originalZ = position[2];
  const [currentZ, setCurrentZ] = useState(originalZ);

  // Monitor sleep state
  useFrame(() => {
    if (rigidBodyRef.current && !isKinematic) {
      const sleeping = rigidBodyRef.current.isSleeping();
      if (sleeping && !isSleeping) {
        setIsSleeping(true);
        setIsKinematic(true);
        rigidBodyRef.current.setBodyType(2); // 2 = KinematicPositionBased
      }
    }
  });

  // Handle hover animation
  useFrame(() => {
    if (isKinematic && rigidBodyRef.current && groupRef.current) {
      const targetZ = isHovered ? originalZ + 0.02 : originalZ; // Slide out 2cm
      const newZ = THREE.MathUtils.lerp(currentZ, targetZ, 0.1);
      setCurrentZ(newZ);

      const currentPos = rigidBodyRef.current.translation();
      rigidBodyRef.current.setTranslation(
        { x: currentPos.x, y: currentPos.y, z: newZ },
        true
      );

      // Update the visual group position to match
      groupRef.current.position.z = newZ - originalZ;
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      restitution={0.01}
      lockRotations={true}
      colliders="cuboid"
      type={isKinematic ? "kinematicPosition" : "dynamic"}
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
        <mesh castShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color={color} metalness={0.1} roughness={0.8} />
        </mesh>

        {/* Title - On the spine facing forward */}
        <Text
          position={[-width / 3, 0, depth / 2 + 0.0002]}
          rotation={[0, 0, 0]}
          fontSize={0.008}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight={700}
          raycast={() => null}
        >
          The Promise
        </Text>

        {/* Author - On the spine facing forward */}
        <Text
          position={[width / 3, 0, depth / 2 + 0.0002]}
          rotation={[0, 0, 0]}
          fontSize={0.006}
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

function CameraController({ stackTop }: { stackTop: number }) {
  const { camera, size } = useThree();
  const [targetScrollY, setTargetScrollY] = useState(-1); // Target position
  const [currentScrollY, setCurrentScrollY] = useState(-1); // Actual position
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [currentTilt, setCurrentTilt] = useState(0);
  const lastScrollTime = useRef(0);

  // Calculate camera distance to make books fill appropriate screen percentage
  const bookWidth = 0.19; // Maximum book width (largest type)
  const aspectRatio = size.width / size.height;
  // Use more screen width on portrait orientation, less on landscape
  const desiredScreenPercentage = aspectRatio < 1 ? 0.7 : 0.5;
  const fov = 50;
  const distance =
    bookWidth / desiredScreenPercentage / (2 * Math.tan((fov * Math.PI) / 360));

  // Stack height calculations
  const bottomLimit = 0.02; // Bottom book position (scaled down)
  const topLimit = stackTop;
  const initialY = (stackTop + bottomLimit) / 2;

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      lastScrollTime.current = now;

      // Normalize scroll input (mouse wheels typically have larger deltas)
      const normalizedDelta =
        Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 50);

      setTargetScrollY((prev) => {
        const scrollSpeed = 0.0005; // Reduced for smoother scrolling
        const newY = prev + normalizedDelta * scrollSpeed;
        return Math.max(bottomLimit, Math.min(topLimit, newY));
      });

      // Track scroll velocity for tilt
      setScrollVelocity(normalizedDelta);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [bottomLimit, topLimit]);

  useFrame(() => {
    // Initialize positions on first frame
    if (targetScrollY === -1) {
      setTargetScrollY(initialY);
      setCurrentScrollY(initialY);
    }

    // Smoothly lerp current position to target position
    const lerpFactor = 0.1; // Adjust for smoothness (lower = smoother)
    const newCurrentY = THREE.MathUtils.lerp(
      currentScrollY,
      targetScrollY,
      lerpFactor
    );
    setCurrentScrollY(newCurrentY);

    // Calculate tilt based on scroll velocity
    let targetTilt = 0;
    if (Math.abs(scrollVelocity) > 0.1) {
      // Tilt based on scroll direction and speed
      targetTilt =
        Math.sign(scrollVelocity) *
        Math.min(Math.abs(scrollVelocity) * 0.02, 15);
    }

    // Smoothly lerp current tilt
    setCurrentTilt((prev) => {
      const lerpSpeed = targetTilt === 0 ? 0.1 : 0.2; // Faster when tilting, slower when returning
      return prev + (targetTilt - prev) * lerpSpeed;
    });

    // Decay scroll velocity
    setScrollVelocity((prev) => prev * 0.9);

    // Set camera position
    camera.position.x = 0;
    camera.position.y = newCurrentY;
    camera.position.z = distance;

    // Look at current Y position with tilt
    const lookAtY =
      newCurrentY + Math.sin((currentTilt * Math.PI) / 180) * distance;
    camera.lookAt(0, lookAtY, 0);
  });

  return null;
}

export default function App() {
  // Define 5 book types with realistic sizes (in meters)
  const bookTypes = [
    { width: 0.18, thickness: 0.015, depth: 0.23 }, // Thin book (18cm x 1.5cm x 23cm)
    { width: 0.19, thickness: 0.025, depth: 0.24 }, // Thick book (19cm x 2.5cm x 24cm)
    { width: 0.185, thickness: 0.02, depth: 0.235 }, // Medium book (18.5cm x 2cm x 23.5cm)
    { width: 0.175, thickness: 0.035, depth: 0.22 }, // Very thick book (17.5cm x 3.5cm x 22cm)
    { width: 0.182, thickness: 0.05, depth: 0.238 }, // Extra thicc book (18.2cm x 5cm x 23.8cm)
  ];

  // Generate 21 books with dark/black colors matching the wireframe
  const bookColors = [
    "#1a1a1a",
    "#2d2d2d",
    "#262626",
    "#333333",
    "#1f1f1f",
    "#3a3a3a",
    "#242424",
    "#2e2e2e",
    "#202020",
    "#363636",
    "#282828",
    "#313131",
    "#1d1d1d",
    "#2f2f2f",
    "#272727",
    "#343434",
    "#222222",
    "#383838",
    "#2b2b2b",
    "#303030",
    "#252525",
  ];

  // First, create book objects with sizes
  const books = bookColors.map((color, index) => {
    const bookType = bookTypes[index % 5];
    const xOffset = (Math.random() - 0.5) * 0.01; // 1cm max offset

    return {
      color,
      bookType,
      xOffset,
      yPosition: 0, // Will be calculated next
    };
  });

  // Calculate Y positions sequentially
  // Books are positioned by their center, so we need to account for half thickness
  let currentY = 0.01; // Start at table top (table is at -0.01 with 0.02 height, so top is at 0.01)

  books.forEach((book, index) => {
    // Position is the center of the book
    // So we need to add half of the current book's thickness to place it properly
    book.yPosition = currentY + book.bookType.thickness / 2;

    // For the next book, we need to account for the full thickness of this book plus a small gap
    currentY += book.bookType.thickness + 0.002; // 2mm gap between books
  });

  // Convert to final config format
  const bookConfigs = books.map((book) => ({
    position: [book.xOffset, book.yPosition, 0] as [number, number, number],
    size: [
      book.bookType.width,
      book.bookType.thickness,
      book.bookType.depth,
    ] as [number, number, number],
    color: book.color,
  }));

  return (
    <>
      <CameraController stackTop={currentY} />
      <Environment
        files="/artist_workshop_1k.hdr"
        background
        backgroundRotation={[0, -Math.PI / 4, 0]}
      />
      <ambientLight intensity={0.2} />
      {/* Main front light */}
      <directionalLight
        position={[-3, 5, 8]}
        intensity={2.5}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      {/* Sunset light from front right */}
      <directionalLight
        position={[8, 3, 6]}
        intensity={2.5}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={0.1}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />

      <Physics gravity={[0, -0.1, 0]}>
        <Table />
        {bookConfigs.map((config, index) => (
          <Book key={index} {...config} />
        ))}
      </Physics>
    </>
  );
}
