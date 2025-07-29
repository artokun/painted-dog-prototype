import { useMemo, useState, useRef, memo, useEffect } from "react";
import { Environment } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { CoffeeTable } from "./CoffeeTable";
import Book from "./Book";
import CameraController from "./CameraController";
import * as THREE from "three";
import { useSnapshot } from "valtio";
import {
  bookStore,
  setFeaturedBook,
  registerBookThickness,
} from "../store/bookStore";

// Memoized Book Stack Component
interface BookConfig {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  spawnDelay: number;
  index: number;
  cmsData?: {
    title: string;
    author: string;
    price: number;
    description: string;
  };
}

const BookStack = memo(function BookStack({
  bookConfigs,
  featuredIndex,
  onBookClick,
  onFeaturedBookPositionUpdate,
}: {
  bookConfigs: BookConfig[];
  featuredIndex: number | null;
  onBookClick: (index: number) => void;
  onFeaturedBookPositionUpdate: (y: number) => void;
}) {
  return (
    <>
      {bookConfigs.map((config, index) => (
        <Book
          key={`book-${index}`}
          {...config}
          isFeatured={index === featuredIndex}
          onClick={() => onBookClick(index)}
          isTopBook={index === bookConfigs.length - 1}
          onPositionUpdate={
            index === featuredIndex ? onFeaturedBookPositionUpdate : undefined
          }
        />
      ))}
    </>
  );
});

// Paper Sphere Background Component (commented out for now)
// function PaperSphere({ cameraY }: { cameraY: number }) {
//   const meshRef = useRef<THREE.Mesh>(null);
//   return (
//     <mesh ref={meshRef} scale={[5, 5, 5]}>
//       <sphereGeometry args={[1, 64, 64]} />
//       <meshStandardMaterial
//         color="#F9F6F0"
//         side={THREE.BackSide}
//         roughness={0.9}
//         metalness={0}
//       />
//     </mesh>
//   );
// }

export default function App() {
  const snap = useSnapshot(bookStore);
  const [featuredBookY, setFeaturedBookY] = useState<number | null>(null);
  // Memoize book configurations without spawn delay to prevent re-calculation
  const { bookConfigs: baseBookConfigs, stackTop } = useMemo(() => {
    const bookSizeMap = {
      thin: { width: 0.18, thickness: 0.01, depth: 0.13 },
      thick: { width: 0.19, thickness: 0.015, depth: 0.14 },
      medium: { width: 0.185, thickness: 0.02, depth: 0.135 },
      veryThick: { width: 0.175, thickness: 0.025, depth: 0.12 },
      extraThick: { width: 0.182, thickness: 0.03, depth: 0.138 },
    };

    const CMSBooks = [
      {
        title: "The Promise",
        author: "Damon Galgut",
        size: "medium",
        color: "#1a1a1a",
        price: 28,
        description:
          "Booker Prize winner exploring a white South African family's decline over decades",
      },
      {
        title: "Disgrace",
        author: "J.M. Coetzee",
        size: "thick",
        color: "#2d2d2d",
        price: 24,
        description:
          "Nobel laureate's powerful novel about post-apartheid South Africa",
      },
      {
        title: "July's People",
        author: "Nadine Gordimer",
        size: "thin",
        color: "#262626",
        price: 22,
        description:
          "Nobel Prize winner's prescient tale of racial upheaval and survival",
      },
      {
        title: "Zoo City",
        author: "Lauren Beukes",
        size: "medium",
        color: "#333333",
        price: 26,
        description:
          "Arthur C. Clarke Award winner blending urban fantasy with contemporary Johannesburg",
      },
      {
        title: "Ways of Dying",
        author: "Zakes Mda",
        size: "thick",
        color: "#1f1f1f",
        price: 25,
        description:
          "Magical realist masterpiece about love and loss in post-apartheid transition",
      },
      {
        title: "A Dry White Season",
        author: "André Brink",
        size: "veryThick",
        color: "#3a3a3a",
        price: 23,
        description:
          "Anti-apartheid classic about an Afrikaner teacher's awakening to injustice",
      },
      {
        title: "Triomf",
        author: "Marlene van Niekerk",
        size: "extraThick",
        color: "#242424",
        price: 32,
        description:
          "Dark comedy chronicling poor white Afrikaners on the eve of democracy",
      },
      {
        title: "Mother to Mother",
        author: "Sindiwe Magona",
        size: "medium",
        color: "#2e2e2e",
        price: 21,
        description:
          "Heart-wrenching exploration of township life and the roots of violence",
      },
      {
        title: "Double Negative",
        author: "Ivan Vladislavić",
        size: "thin",
        color: "#202020",
        price: 27,
        description:
          "Experimental novel capturing the disorientation of post-apartheid Johannesburg",
      },
      {
        title: "You Can't Get Lost in Cape Town",
        author: "Zoë Wicomb",
        size: "thick",
        color: "#363636",
        price: 24,
        description:
          "Groundbreaking collection exploring coloured identity under apartheid",
      },
      {
        title: "The Heart of Redness",
        author: "Zakes Mda",
        size: "veryThick",
        color: "#282828",
        price: 29,
        description:
          "Epic tale weaving together 19th-century Xhosa prophecies with modern South Africa",
      },
      {
        title: "Waiting for the Barbarians",
        author: "J.M. Coetzee",
        size: "medium",
        color: "#313131",
        price: 26,
        description:
          "Allegorical masterpiece about empire, torture, and moral responsibility",
      },
      {
        title: "Born a Crime",
        author: "Trevor Noah",
        size: "thick",
        color: "#1d1d1d",
        price: 24,
        description:
          "Comedian's memoir of growing up in apartheid South Africa",
      },
      {
        title: "Nervous Conditions",
        author: "Tsitsi Dangarembga",
        size: "medium",
        color: "#2f2f2f",
        price: 23,
        description:
          "Coming-of-age novel about education and colonial Zimbabwe",
      },
      {
        title: "Broken Glass",
        author: "Alain Mabanckou",
        size: "thin",
        color: "#272727",
        price: 22,
        description:
          "Congolese author's tale of bar life and storytelling in Brazzaville",
      },
      {
        title: "The Beautiful Ones Are Not Yet Born",
        author: "Ayi Kwei Armah",
        size: "veryThick",
        color: "#343434",
        price: 28,
        description:
          "Ghanaian classic exploring corruption in post-independence Africa",
      },
      {
        title: "Purple Hibiscus",
        author: "Chimamanda Ngozi Adichie",
        size: "medium",
        color: "#222222",
        price: 25,
        description:
          "Nigerian author's debut about family, faith, and political upheaval",
      },
      {
        title: "Burger's Daughter",
        author: "Nadine Gordimer",
        size: "extraThick",
        color: "#383838",
        price: 30,
        description:
          "Anti-apartheid novel following the daughter of a political activist",
      },
      {
        title: "The Conservationist",
        author: "Nadine Gordimer",
        size: "thick",
        color: "#2b2b2b",
        price: 27,
        description:
          "Booker Prize winner examining white South African identity",
      },
      {
        title: "My Son's Story",
        author: "Nadine Gordimer",
        size: "medium",
        color: "#303030",
        price: 24,
        description: "Family drama set against the backdrop of apartheid's end",
      },
      {
        title: "The Book of Not",
        author: "Tsitsi Dangarembga",
        size: "thick",
        color: "#252525",
        price: 26,
        description: "Sequel exploring colonial education and African identity",
      },
      {
        title: "Coconut",
        author: "Kopano Matlwa",
        size: "thin",
        color: "#404040",
        price: 21,
        description:
          "Young South African voices navigating post-apartheid identity",
      },
      {
        title: "The Pickup",
        author: "Nadine Gordimer",
        size: "medium",
        color: "#353535",
        price: 23,
        description:
          "Cross-cultural love story examining privilege and displacement",
      },
      {
        title: "Age of Iron",
        author: "J.M. Coetzee",
        size: "veryThick",
        color: "#2c2c2c",
        price: 29,
        description: "Dying woman's letter during the final years of apartheid",
      },
    ].reverse();

    // Convert CMS books to physical book objects with positions
    const books = CMSBooks.map((cmsBook, index) => {
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
      cmsData: {
        title: book.title,
        author: book.author,
        price: book.price,
        description: book.description,
      },
    }));

    return { bookConfigs: configs, stackTop: currentY };
  }, []); // No dependencies - calculated once

  // Add spawn delays
  const bookConfigs = baseBookConfigs.map((config) => ({
    ...config,
    spawnDelay: config.index * 150, // 150ms between each book (faster spawning)
  }));

  // Register book thicknesses after component mounts
  useEffect(() => {
    bookConfigs.forEach((config) => {
      registerBookThickness(config.index, config.size[1]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount - bookConfigs is stable

  return (
    <>
      {/* <color attach="background" args={["#F9F6F0"]} /> */}
      {/* <fog attach="fog" args={["#F9F6F0", 5, 15]} /> */}
      <CameraController
        stackTop={stackTop}
        totalBooks={bookConfigs.length}
        onCameraMove={() => {}}
        featuredBookY={featuredBookY}
      />
      {/* <OrbitControls /> */}

      {/* Paper sphere background */}
      {/* <PaperSphere cameraY={cameraY} /> */}

      {/* Environment for lighting and reflections only, no background */}
      {/* <Environment files="/artist_workshop_1k.hdr" background={false} /> */}
      <ambientLight intensity={3} />
      {/* Single directional light for shadow debugging */}
      <directionalLight
        position={[2, 4, 2]}
        intensity={3}
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

      <Physics gravity={[0, -0.1, 0]}>
        <CoffeeTable
          receiveShadow
          scale={0.15}
          rotation={[0, Math.PI / 4, 0]}
          position={[0, -1.35, -0.15]}
        />
        <BookStack
          bookConfigs={bookConfigs}
          featuredIndex={snap.featuredBookIndex}
          onBookClick={(index) => {
            // Toggle featured state
            if (snap.featuredBookIndex === index) {
              setFeaturedBook(null);
              setFeaturedBookY(null);
            } else {
              setFeaturedBook(index);
              // Don't set initial position - let the book report its actual position
            }
          }}
          onFeaturedBookPositionUpdate={setFeaturedBookY}
        />
      </Physics>
    </>
  );
}
