import { useRef, useEffect, useState } from "react";
import { Environment, OrbitControls, Text } from "@react-three/drei";
import {
  Physics,
  RigidBody,
  CoefficientCombineRule,
} from "@react-three/rapier";
import { useThree, useFrame } from "@react-three/fiber";
import type * as THREE from "three";

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
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3, 0.2, 32]} />
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
  const ref = useRef<THREE.Mesh>(null);
  const [width, thickness, depth] = size;

  return (
    <RigidBody
      position={position}
      restitution={0}
      lockRotations={true}
      colliders="cuboid"
    >
      <group>
        <mesh ref={ref} castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color={color} metalness={0.1} roughness={0.8} />
        </mesh>

        {/* Title - On the spine facing forward */}
        <Text
          position={[-width / 3, 0, depth / 2 + 0.002]}
          rotation={[0, 0, 0]}
          fontSize={0.06}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight={700}
        >
          The Promise
        </Text>

        {/* Author - On the spine facing forward */}
        <Text
          position={[width / 3, 0, depth / 2 + 0.002]}
          rotation={[0, 0, 0]}
          fontSize={0.04}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
          fontWeight={300}
        >
          Damon Galmut
        </Text>
      </group>
    </RigidBody>
  );
}

function CameraController({ stackTop }: { stackTop: number }) {
  const { camera } = useThree();
  const [scrollY, setScrollY] = useState(-1); // -1 indicates uninitialized
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [currentTilt, setCurrentTilt] = useState(0);
  const lastScrollTime = useRef(0);

  // Calculate camera distance to make books fill 60% of screen width
  const bookWidth = 1.9; // Maximum book width (largest type)
  const desiredScreenPercentage = 0.6;
  const fov = 50;
  const distance =
    bookWidth / desiredScreenPercentage / (2 * Math.tan((fov * Math.PI) / 360));

  // Stack height calculations
  const bottomLimit = 0.15; // Bottom book position
  const topLimit = stackTop;
  const initialY = (stackTop + bottomLimit) / 2;

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      lastScrollTime.current = now;

      setScrollY((prev) => {
        const newY = prev + e.deltaY * 0.001;
        return Math.max(bottomLimit, Math.min(topLimit, newY));
      });

      // Track scroll velocity for tilt
      setScrollVelocity(e.deltaY);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [bottomLimit, topLimit]);

  useFrame(() => {
    // Initialize camera position to middle of stack on first frame
    let targetY = scrollY;
    if (scrollY === -1) {
      targetY = initialY;
      setScrollY(targetY);
    }

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
    camera.position.y = targetY;
    camera.position.z = distance;

    // Look at current Y position with tilt
    const lookAtY =
      targetY + Math.sin((currentTilt * Math.PI) / 180) * distance;
    camera.lookAt(0, lookAtY, 0);
  });

  return null;
}

export default function App() {
  // Define 5 book types with varied thickness but similar other dimensions
  const bookTypes = [
    { width: 1.8, thickness: 0.1, depth: 1.3 }, // Thin book
    { width: 1.9, thickness: 0.12, depth: 1.31 }, // Thick book
    { width: 1.85, thickness: 0.15, depth: 1.32 }, // Medium book
    { width: 1.75, thickness: 0.2, depth: 1.29 }, // Very thick book
    { width: 1.82, thickness: 0.3, depth: 1.38 }, // Extra thicc book
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
    const xOffset = (Math.random() - 0.5) * 0.1;

    return {
      color,
      bookType,
      xOffset,
      yPosition: 0, // Will be calculated next
    };
  });

  // Calculate Y positions sequentially
  // Books are positioned by their center, so we need to account for half thickness
  let currentY = 0; // Start at table top (table is at -0.1 with 0.2 height, so top is at 0.1)

  books.forEach((book, index) => {
    // Position is the center of the book
    // So we need to add half of the current book's thickness to place it properly
    book.yPosition = currentY + book.bookType.thickness / 2;

    // For the next book, we need to account for the full thickness of this book plus a small gap
    currentY += book.bookType.thickness + 0.02; // 1cm gap between books
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
      <OrbitControls
        enableDamping
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        target={[0, 1, 0]}
      />
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

      <Physics gravity={[0, -1, 0]}>
        <Table />
        {bookConfigs.map((config, index) => (
          <Book key={index} {...config} />
        ))}
      </Physics>
    </>
  );
}
