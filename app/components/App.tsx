import React, { useMemo, memo, useEffect, Suspense, useState } from "react";
import { Environment } from "@react-three/drei";
import Book from "./Book";
import CameraController from "./CameraController";
import Backdrop from "./Backdrop";
import Floor from "./Floor";
import { useSnapshot } from "valtio";
import { useSpring, config, animated } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import {
  bookStore,
  setFocusedBook,
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
  cumulativeDepth: number;
  sortedYPosition?: number; // Y position for step 2 sorting
  cmsData?: {
    title: string;
    firstName: string;
    surname: string;
    price: number;
    description: string;
    isFeatured: boolean;
  };
}

const BookStackInner = memo(function BookStackInner({
  bookConfigs,
  focusedId,
  onBookClick,
  onFocusedBookPositionUpdate,
}: {
  bookConfigs: BookConfig[];
  focusedId: string | null;
  onBookClick: (id: string) => void;
  onFocusedBookPositionUpdate: (y: number) => void;
}) {
  // Find the focused book's index for ordering logic
  const focusedIndex = focusedId
    ? bookConfigs.findIndex((config) => config.id === focusedId)
    : null;

  return (
    <>
      {bookConfigs.map((config, index) => (
        <Book
          key={config.id}
          {...config}
          isFocused={config.id === focusedId}
          isFeatured={config.cmsData?.isFeatured || false} // JSON flag for top book
          onClick={() => onBookClick(config.id)}
          onPositionUpdate={
            config.id === focusedId ? onFocusedBookPositionUpdate : undefined
          }
          focusedBookIndex={focusedIndex}
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

  // Animate floor opacity - fade during sort steps or when book is focused
  const [floorSpring] = useSpring(
    () => ({
      opacity: snap.focusedBookId !== null || snap.sortStep !== null ? 0 : 1,
      config: config.gentle,
      delay: snap.focusedBookId !== null ? 600 : 0,
    }),
    [snap.focusedBookId, snap.sortStep]
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
    const configs = books.map((book, index) => {
      // Calculate cumulative depth: own depth + sum of all depths below
      const cumulativeDepth = books
        .slice(0, index + 1) // Include current book and all below
        .reduce((sum, b) => sum + b.bookType.depth, 0);

      return {
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
        cumulativeDepth,
        cmsData: {
          title: book.title,
          firstName: book.firstName,
          surname: book.surname,
          price: book.price,
          description: book.description,
          isFeatured: book.isFeatured,
        },
      };
    });

    return { bookConfigs: configs, stackTop: currentY };
  }, [booksData]); // Recalculate when books data changes

  // Calculate sorted Y positions for step 2 (title descending)
  const bookConfigsWithSorting = useMemo(() => {
    if (snap.sortStep !== 2) {
      return baseBookConfigs;
    }

    // Get focused book ID to exclude from sorting
    const focusedBookId = snap.focusedBookId;

    // Separate focused and non-focused books
    const focusedBookConfig = baseBookConfigs.find(
      (config) => config.id === focusedBookId
    );
    const nonFocusedBooks = baseBookConfigs.filter(
      (config) => config.id !== focusedBookId
    );

    // Sort non-focused books by title descending
    const sortedNonFocusedBooks = [...nonFocusedBooks].sort((a, b) => {
      const titleA = a.cmsData?.title || "";
      const titleB = b.cmsData?.title || "";
      return titleB.localeCompare(titleA); // Descending order
    });

    // Calculate new Y positions for sorted books
    // Start from the bottom position (same as original logic)
    let currentY = 0.0045; // Coffee table top surface

    const booksWithNewY = sortedNonFocusedBooks.map((config, index) => {
      // Calculate Y position (same logic as original)
      const bookHeight = config.size[1]; // thickness
      const newYPosition = currentY + bookHeight / 2;
      currentY += bookHeight;

      return {
        ...config,
        sortedYPosition: newYPosition,
      };
    });

    // If there's a focused book, add it back without sortedYPosition
    // (focused book position is handled in Book component directly)
    const result = focusedBookConfig
      ? [...booksWithNewY, focusedBookConfig]
      : booksWithNewY;

    // Sort the result back to original order for consistent rendering
    return result.sort((a, b) => a.index - b.index);
  }, [baseBookConfigs, snap.sortStep, snap.focusedBookId]);

  // Add spawn delays
  const bookConfigs = bookConfigsWithSorting.map((config) => ({
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

      <Floor opacity={floorSpring.opacity} />
      <Backdrop />
      <BookStack
        bookConfigs={bookConfigs}
        focusedId={snap.focusedBookId}
        onBookClick={(id: string) => {
          // Only allow clicking if no book is focused, or clicking the focused book
          if (snap.focusedBookId === null || snap.focusedBookId === id) {
            // Toggle focused state
            if (snap.focusedBookId === id) {
              setFocusedBook(null);
            } else {
              setFocusedBook(id);
              // Don't set initial position - let the book report its actual position
            }
          }
          // If another book is focused, ignore the click
        }}
        onFocusedBookPositionUpdate={() => {}}
      />
    </>
  );
}
