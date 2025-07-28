import { useMemo, useState, useRef, memo } from "react";
import { Environment } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { CoffeeTable } from "./CoffeeTable";
import Book from "./Book";
import CameraController from "./CameraController";
import * as THREE from "three";

// Memoized Book Stack Component
interface BookConfig {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  spawnDelay: number;
  index: number;
}

const BookStack = memo(function BookStack({
  bookConfigs,
}: {
  bookConfigs: BookConfig[];
}) {
  return (
    <>
      {bookConfigs.map((config, index) => (
        <Book key={`book-${index}`} {...config} />
      ))}
    </>
  );
});

// Paper Sphere Background Component
function PaperSphere({ cameraY }: { cameraY: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // useFrame(() => {
  //   if (meshRef.current) {
  //     // Create parallax effect: sphere rotates as camera moves
  //     const normalizedY = (cameraY - 0.05) / 0.5;
  //     const parallaxRotation = normalizedY * 0.3;

  //     meshRef.current.rotation.y = -Math.PI / 4 + parallaxRotation;
  //     meshRef.current.rotation.x = normalizedY * 0.1;
  //   }
  // });

  return (
    <mesh ref={meshRef} scale={[5, 5, 5]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#F9F6F0"
        side={THREE.BackSide}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
}

export default function App() {
  const [cameraY, setCameraY] = useState(0.05);
  // Memoize book configurations without spawn delay to prevent re-calculation
  const { bookConfigs: baseBookConfigs, stackTop } = useMemo(() => {
    // Define 5 book types with realistic sizes (in meters)
    const bookTypes = [
      { width: 0.18, thickness: 0.01, depth: 0.13 }, // Thin book (18cm x 1.5cm x 23cm)
      { width: 0.19, thickness: 0.015, depth: 0.14 }, // Thick book (19cm x 2.5cm x 24cm)
      { width: 0.185, thickness: 0.02, depth: 0.135 }, // Medium book (18.5cm x 2cm x 23.5cm)
      { width: 0.175, thickness: 0.025, depth: 0.12 }, // Very thick book (17.5cm x 3.5cm x 22cm)
      { width: 0.182, thickness: 0.03, depth: 0.138 }, // Extra thicc book (18.2cm x 5cm x 23.8cm)
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
      // First book should always be the thickest (index 4 in bookTypes)
      const bookType = index === 0 ? bookTypes[4] : bookTypes[index % 5];
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
    // Coffee table models typically have their top surface around 0.4-0.5 units at scale 0.01
    let currentY = 0.0045; // Adjusted for coffee table top surface

    books.forEach((book) => {
      // Position is the center of the book
      // So we need to add half of the current book's thickness to place it properly
      book.yPosition = currentY + book.bookType.thickness / 2;

      // For the next book, we need to account for the full thickness of this book plus a small gap
      currentY += book.bookType.thickness + 0.002; // 2mm gap between books
    });

    // Convert to final config format without spawn delay
    const configs = books.map((book, index) => ({
      position: [book.xOffset, book.yPosition, 0] as [number, number, number],
      size: [
        book.bookType.width,
        book.bookType.thickness,
        book.bookType.depth,
      ] as [number, number, number],
      color: book.color,
      targetY: book.yPosition + book.bookType.thickness / 2, // Top of this book
      index, // Keep track of index for spawn delay
    }));

    return { bookConfigs: configs, stackTop: currentY };
  }, []); // No dependencies - calculated once

  // Add spawn delays
  const bookConfigs = baseBookConfigs.map((config) => ({
    ...config,
    spawnDelay: config.index * 150, // 150ms between each book (faster spawning)
  }));

  return (
    <>
      {/* <color attach="background" args={["#F9F6F0"]} /> */}
      {/* <fog attach="fog" args={["#F9F6F0", 5, 15]} /> */}
      <CameraController
        stackTop={stackTop - 0.1}
        totalBooks={bookConfigs.length}
        onCameraMove={setCameraY}
      />
      {/* <OrbitControls /> */}

      {/* Paper sphere background */}
      {/* <PaperSphere cameraY={cameraY} /> */}

      {/* Environment for lighting and reflections only, no background */}
      <Environment files="/artist_workshop_1k.hdr" background={false} />
      {/* <ambientLight intensity={0.2} /> */}
      {/* Main front light */}
      <directionalLight
        position={[-3, 5, 8]}
        intensity={0.5}
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
        intensity={0.5}
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
      <pointLight
        position={[0.2, 0.5, 0.4]}
        intensity={1}
        rotation={[0, 0, 0]}
      />

      <Physics gravity={[0, -0.1, 0]}>
        <CoffeeTable
          receiveShadow
          scale={0.15}
          rotation={[0, Math.PI / 4, 0]}
          position={[0, -1.35, -0.15]}
        />
        <BookStack bookConfigs={bookConfigs} />
      </Physics>
    </>
  );
}
