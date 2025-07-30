import React, { useMemo, memo, useEffect, Suspense, useState } from "react";
import { Environment } from "@react-three/drei";
import { CoffeeTable } from "./CoffeeTable";
import Book from "./Book";
import CameraController from "./CameraController";
import Backdrop from "./Backdrop";
import { useSnapshot } from "valtio";
import { useSpring, config, animated } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import {
  bookStore,
  setFeaturedBook,
  registerBookThickness,
} from "../store/bookStore";
import { validateBooksSafe, type Book as BookData } from "../../types/book";

// Memoized Book Stack Component
interface BookConfig {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  spawnDelay: number;
  index: number;
  id: string;
  cmsData?: {
    title: string;
    firstName: string;
    surname: string;
    price: number;
    description: string;
  };
}

const BookStackInner = memo(function BookStackInner({
  bookConfigs,
  featuredId,
  onBookClick,
  onFeaturedBookPositionUpdate,
}: {
  bookConfigs: BookConfig[];
  featuredId: string | null;
  onBookClick: (id: string) => void;
  onFeaturedBookPositionUpdate: (y: number) => void;
}) {
  // Find the featured book's index for ordering logic
  const featuredIndex = featuredId
    ? bookConfigs.findIndex((config) => config.id === featuredId)
    : null;

  return (
    <>
      {bookConfigs.map((config, index) => (
        <Book
          key={config.id}
          {...config}
          isFeatured={config.id === featuredId}
          onClick={() => onBookClick(config.id)}
          isTopBook={index === bookConfigs.length - 1}
          onPositionUpdate={
            config.id === featuredId ? onFeaturedBookPositionUpdate : undefined
          }
          featuredBookIndex={featuredIndex}
        />
      ))}
    </>
  );
});

// Wrap BookStack with Suspense
const BookStack = (props: any) => (
  <Suspense fallback={null}>
    <BookStackInner {...props} />
  </Suspense>
);

// Animated CoffeeTable wrapper

export default function App() {
  const snap = useSnapshot(bookStore);
  const [booksData, setBooksData] = useState<BookData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load and validate books data
  useEffect(() => {
    async function loadBooksData() {
      try {
        setIsLoading(true);
        const response = await fetch("/books.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch books: ${response.statusText}`);
        }
        const rawData = await response.json();

        const validation = validateBooksSafe(rawData);
        if (!validation.success) {
          console.error("Book data validation failed:", validation.error);
          throw new Error("Invalid book data format");
        }

        setBooksData(validation.data.reverse()); // Reverse to match original order
        setLoadError(null);
      } catch (error) {
        console.error("Error loading books data:", error);
        setLoadError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    loadBooksData();
  }, []);

  // Animate coffee table opacity
  const [tableSpring] = useSpring(
    () => ({
      opacity: snap.featuredBookId !== null ? 0 : 1,
      config: config.gentle,
      delay: snap.featuredBookId !== null ? 600 : 0,
    }),
    [snap.featuredBookId]
  );

  // Memoize book configurations without spawn delay to prevent re-calculation
  const { bookConfigs: baseBookConfigs, stackTop } = useMemo(() => {
    if (booksData.length === 0) {
      return { bookConfigs: [], stackTop: 0 };
    }

    const bookSizeMap = {
      thin: { width: 0.18, thickness: 0.01, depth: 0.13 },
      thick: { width: 0.19, thickness: 0.015, depth: 0.14 },
      medium: { width: 0.185, thickness: 0.02, depth: 0.135 },
      veryThick: { width: 0.175, thickness: 0.025, depth: 0.12 },
      extraThick: { width: 0.182, thickness: 0.03, depth: 0.138 },
    };

    // Convert CMS books to physical book objects with positions
    const books = booksData.map((cmsBook) => {
      const bookType = bookSizeMap[cmsBook.size as keyof typeof bookSizeMap];
      const xOffset = (Math.random() - 0.5) * 0.01; // 1cm max offset

      return {
        ...cmsBook,
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
      currentY += book.bookType.thickness; // 2mm gap between books
    });

    // Adjust the top book's position since it's standing
    const topBookIndex = books.length - 1;
    if (books[topBookIndex]) {
      // When the book is standing, its width becomes its height
      // So we need to adjust the Y position to account for this
      const topBook = books[topBookIndex];
      const halfWidth = topBook.bookType.width / 2;
      // Position the top book so its bottom edge sits on the book below
      books[topBookIndex].yPosition =
        currentY - topBook.bookType.thickness + halfWidth;
    }

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
      id: book.id, // Unique identifier for the book
      cmsData: {
        title: book.title,
        firstName: book.firstName,
        surname: book.surname,
        price: book.price,
        description: book.description,
      },
    }));

    return { bookConfigs: configs, stackTop: currentY };
  }, [booksData]); // Recalculate when books data changes

  // Add spawn delays
  const bookConfigs = baseBookConfigs.map((config) => ({
    ...config,
    spawnDelay: config.index * 50, // 150ms between each book (faster spawning)
  }));

  // Register book thicknesses after component mounts
  useEffect(() => {
    bookConfigs.forEach((config) => {
      registerBookThickness(config.id, config.size[1]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount - bookConfigs is stable

  // Don't render anything while loading or if there's an error
  if (isLoading || loadError || booksData.length === 0) {
    return null; // In a 3D scene context, we just don't render anything
  }

  return (
    <>
      {/* <color attach="background" args={["#F9F6F0"]} /> */}
      {/* <fog attach="fog" args={["#F9F6F0", 5, 15]} /> */}
      <CameraController
        stackTop={stackTop}
        totalBooks={bookConfigs.length}
        onCameraMove={() => {}}
        bookPositions={bookConfigs.map((config) => config.position[1])}
      />
      {/* <OrbitControls /> */}

      {/* Paper sphere background */}
      {/* <PaperSphere cameraY={cameraY} /> */}

      {/* Environment for lighting and reflections only, no background */}
      <Environment
        files="/artist_workshop_1k.hdr"
        background={false}
        environmentIntensity={0.97}
      />
      {/* <ambientLight intensity={3} /> */}
      {/* Single directional light for shadow debugging */}
      <directionalLight
        position={[2, 4, 2]}
        intensity={2.2}
        color="#FFFFFF"
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-near={0.001}
        shadow-camera-far={10}
        shadow-camera-left={-1}
        shadow-camera-right={1}
        shadow-camera-top={1}
        shadow-camera-bottom={-1}
        shadow-bias={-0.0001}
      />

      {/* <AnimatedCoffeeTable
        receiveShadow
        scale={0.15}
        rotation={[0, Math.PI / 4, 0]}
        position={[0, -1.341, -0.15]}
        opacity={tableSpring.opacity}
      /> */}
      <mesh
        position={[0, 0.005, 0]}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.5, 128]} />
        <animated.meshStandardMaterial
          color="#F9F6F0"
          transparent
          opacity={tableSpring.opacity}
        />
      </mesh>
      <Backdrop />
      <BookStack
        bookConfigs={bookConfigs}
        featuredId={snap.featuredBookId}
        onBookClick={(id: string) => {
          // Only allow clicking if no book is featured, or clicking the featured book
          if (snap.featuredBookId === null || snap.featuredBookId === id) {
            // Toggle featured state
            if (snap.featuredBookId === id) {
              setFeaturedBook(null);
            } else {
              setFeaturedBook(id);
              // Don't set initial position - let the book report its actual position
            }
          }
          // If another book is featured, ignore the click
        }}
        onFeaturedBookPositionUpdate={() => {}}
      />
    </>
  );
}
