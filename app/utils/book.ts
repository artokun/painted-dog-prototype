import { BookId, BookMap, SortBy, SortOrder } from "@/types/app";
import Fuse from "fuse.js";
import * as THREE from "three";
import { bookStore } from "../store/bookStore";
import { filterStore } from "../store/filterStore";

// Dynamic font sizing for spine based on title length
export const getSpineFontSize = (text: string) => {
  if (text.length > 20) return 0.005; // Very small for long titles
  if (text.length > 15) return 0.006; // Small for medium titles
  if (text.length > 10) return 0.007; // Normal-small for slightly long titles
  return 0.008; // Normal size for short titles
};

// Text wrapping function for face titles - returns array of lines
export const wrapText = (text: string, maxLength: number = 12): string[] => {
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

export const calculateXFromCameraDepthOnRotation = (
  camera: THREE.PerspectiveCamera,
  normalizedX: number, // Expected: -1 to 1 (screen coordinates)
  targetZ: number = 0 // Z position where you want to place the HTML element
) => {
  const cameraRotation = camera.rotation.y;
  const fovRadians = (camera.fov * Math.PI) / 180;

  // Calculate the world width at the target Z distance
  const distanceToTarget = camera.position.z - targetZ;
  const worldWidth =
    2 * Math.tan(fovRadians / 2) * distanceToTarget * camera.aspect;

  // Convert normalized screen X to world X
  const worldX = normalizedX * (worldWidth / 2);

  // Compensate for camera rotation
  const compensatedX = worldX * Math.cos(cameraRotation);
  const compensatedZ = worldX * Math.sin(cameraRotation);

  return {
    x: compensatedX,
    z: targetZ + compensatedZ,
  };
};

// Calculate optimal Z distance for focused book with viewport constraints
// Calculate world units for a percentage of screen width at a given Z position
export const calculateScreenPercentageInWorldUnits = (
  camera: THREE.PerspectiveCamera,
  screenPercentage: number, // 0.4 for 40%
  zPosition: number = 0
): number => {
  const fov = 45; // From your setup
  const fovRadians = (fov * Math.PI) / 180;
  const halfFov = fovRadians / 2;

  // Distance from camera to the Z position
  const distanceToPosition = Math.abs(camera.position.z - zPosition);

  // Calculate viewport width at this Z position
  const viewportHeightAtPosition = 2 * Math.tan(halfFov) * distanceToPosition;
  const viewportWidthAtPosition = viewportHeightAtPosition * camera.aspect;

  // Return the world units for the given screen percentage
  return viewportWidthAtPosition * screenPercentage;
};

// Calculate precise centering offset for focused books using screen percentage
export const calculateFocusedBookCenterOffset = (
  camera: THREE.Camera,
  bookSize: string,
  zPosition: number = 0
): number => {
  // Get the 40% screen width constraint used in calculateOptimalZDistance
  const fortyPercentWidth = calculateScreenPercentageInWorldUnits(
    camera as THREE.PerspectiveCamera,
    0.4,
    zPosition
  );

  const [width, , height] = getContentfulBookSize(bookSize);

  // Special handling for the 280x260 book which has unique proportions
  if (bookSize === "280x260") {
    // This book might need a different centering calculation
    const rightAlignOffset = (fortyPercentWidth * width) / 2;
    return fortyPercentWidth / 2 - rightAlignOffset * 4;
  }

  // Check if book is portrait (height > width)
  const isPortrait = height > width;

  if (!isPortrait) {
    // For portrait books, use geometric center
    return 0;
  } else {
    // For landscape books, use the centering offset calculation
    const rightAlignOffset = (fortyPercentWidth * width) / 2;
    return rightAlignOffset / 2;
  }
};

export const calculateOptimalZDistance = (
  camera: THREE.Camera,
  bookSize?: string
) => {
  // If no book size provided, use the old fixed reference behavior
  if (!bookSize) {
    const referenceBookHeight = 0.28;
    const targetScreenPercentage = 0.8;
    const fov = 45;
    const fovRadians = (fov * Math.PI) / 180;
    const halfFov = fovRadians / 2;
    const viewportHeightAtUnitDistance = 2 * Math.tan(halfFov);
    const distance =
      referenceBookHeight /
      (targetScreenPercentage * viewportHeightAtUnitDistance);
    return camera.position.z - distance;
  }

  // Get actual book dimensions
  const [width, thickness, height] = getContentfulBookSize(bookSize);

  // Camera FOV and aspect ratio
  const fov = 45;
  const fovRadians = (fov * Math.PI) / 180;
  const halfFov = fovRadians / 2;

  // Get viewport dimensions at unit distance
  const viewportHeightAtUnitDistance = 2 * Math.tan(halfFov);
  const viewportWidthAtUnitDistance =
    viewportHeightAtUnitDistance * (camera as THREE.PerspectiveCamera).aspect;

  // Target constraints
  const heightConstraintPercentage = 0.8; // 80% of viewport height
  const widthConstraintPercentage = 0.4; // 40% of viewport width

  let optimalDistance = 0;

  if (bookSize === "280x260") {
    const distanceForHeightConstraint =
      width / (heightConstraintPercentage * viewportHeightAtUnitDistance);
    const distanceForWidthConstraint =
      height / (widthConstraintPercentage * viewportWidthAtUnitDistance);

    // Use the more restrictive constraint (further distance)
    optimalDistance = Math.max(
      distanceForHeightConstraint,
      distanceForWidthConstraint + 0.05
    );
  } else {
    const distanceForHeightConstraint =
      height / (heightConstraintPercentage * viewportHeightAtUnitDistance);
    const distanceForWidthConstraint =
      width / (widthConstraintPercentage * viewportWidthAtUnitDistance);

    // Use the more restrictive constraint (further distance)
    optimalDistance = Math.max(
      distanceForHeightConstraint,
      distanceForWidthConstraint
    );
  }

  return camera.position.z - optimalDistance;
};

// Precise GLTF model dimensions from vertex geometry analysis
const contentfulSizeMap: Record<
  string,
  [width: number, thickness: number, height: number]
> = {
  XS: [0.113, 0.0347, 0.1793], // 113.0mm × 34.7mm × 179.3mm
  SM: [0.1317, 0.0187, 0.2072], // 131.7mm × 18.7mm × 207.2mm
  MD: [0.138, 0.0195, 0.2075], // 138.0mm × 19.5mm × 207.5mm
  LG: [0.1452, 0.0297, 0.2204], // 145.2mm × 29.7mm × 220.4mm
  XL: [0.1572, 0.0226, 0.2333], // 157.2mm × 22.6mm × 233.3mm
  "280x260": [0.26, 0.026, 0.285], // 280.0mm × 26.0mm × 260.0mm
};

// Direct Contentful size getter (more efficient)
export const getContentfulBookSize = (
  size: string
): [width: number, thickness: number, height: number] => {
  return (
    contentfulSizeMap[size as keyof typeof contentfulSizeMap] ||
    contentfulSizeMap["MD"]
  );
};

export const getSortedBooks = () => {
  const books = bookStore.books;
  const { sortBy, sortOrder } = filterStore;
  return (
    Object.values(books)
      .sort((a, b) => {
        switch (sortBy) {
          case SortBy.Title:
            return sortOrder === SortOrder.Asc
              ? a.title.localeCompare(b.title)
              : b.title.localeCompare(a.title);
          case SortBy.Author:
            // Handle Contentful structure
            const aAuthor =
              "authors" in a && a.authors.length > 0
                ? a.authors[0].fullName
                : "firstName" in a
                  ? `${(a as any).firstName} ${(a as any).surname}`
                  : "Unknown";
            const bAuthor =
              "authors" in b && b.authors.length > 0
                ? b.authors[0].fullName
                : "firstName" in b
                  ? `${(b as any).firstName} ${(b as any).surname}`
                  : "Unknown";
            return sortOrder === SortOrder.Asc
              ? aAuthor.localeCompare(bAuthor)
              : bAuthor.localeCompare(aAuthor);
        }
      })
      // Move featured books to the top
      .sort((a, b) => {
        const aFeatured =
          "featured" in a
            ? a.featured
            : "isFeatured" in a
              ? (a as any).isFeatured
              : false;
        const bFeatured =
          "featured" in b
            ? b.featured
            : "isFeatured" in b
              ? (b as any).isFeatured
              : false;
        if (aFeatured && !bFeatured) return 1;
        if (!aFeatured && bFeatured) return -1;
        return 0;
      })
  );
};

export const getBookStackHeight = (): number => {
  const sortedBooks = getSortedBooks();
  const filteredBooks = sortedBooks.filter((book) => {
    return "featured" in book
      ? !book.featured
      : !("isFeatured" in book ? (book as any).isFeatured : false);
  });
  return filteredBooks.reduce((acc, book) => {
    const [, thickness] = getContentfulBookSize(book.bookSize);
    return acc + thickness;
  }, 0);
};

export const getDropHeight = (bookId: BookId): number => {
  const focusedBookId = bookStore.focusedBookId;
  const books = bookStore.books;
  if (focusedBookId !== null && focusedBookId !== bookId) {
    const sortedBooks = getSortedBooks();
    const bookIndex = sortedBooks.findIndex((book) => book.id === bookId);
    const focusedBookIndex = sortedBooks.findIndex(
      (book) => book.id === focusedBookId
    );
    if (bookIndex <= focusedBookIndex) return 0;
    const focusedBook = books[focusedBookId];
    const [, thickness] = getContentfulBookSize(focusedBook.bookSize);
    return thickness;
  }
  return 0;
};

export const getBookSortYPosition = (
  bookId: BookId
): { posX: number; posY: number; posZ: number } => {
  const books = bookStore.books;
  const book = books[bookId];
  const isFeatured = book.featured;
  const [, ownThickness, ownLength] = getContentfulBookSize(book.bookSize);

  if (isFeatured) {
    const stackHeight = getBookStackHeight();
    const featuredY = stackHeight + ownLength / 2;
    return { posX: 0, posY: featuredY, posZ: 0 };
  }

  const sortedBooks = getSortedBooks();

  //remove featured books
  const filteredBooks = sortedBooks.filter((book) => {
    return !book.featured;
  });

  const bookIndex = filteredBooks.findIndex((book) => book.id === bookId);
  const slicedBooks = filteredBooks.slice(0, bookIndex);

  const y = slicedBooks.reduce((acc, book) => {
    const [, thickness] = getContentfulBookSize(book.bookSize);
    return acc + thickness;
  }, ownThickness / 2);

  return { posX: 0, posY: y, posZ: 0 };
};

// In Mobile book stack mode, the books are on their sides, spine forward
// like on a bookshelf. So we stack with thickness going left to right, with the
// leftmost book being the first in the stack.
export const getBookSortXPostition = (
  bookId: BookId
): { posX: number; posY: number; posZ: number } => {
  const books = bookStore.books;
  const book = books[bookId];
  const [, ownThickness] = getContentfulBookSize(book.bookSize);
  const sortedBooks = getSortedBooks().reverse();
  const bookIndex = sortedBooks.findIndex((book) => book.id === bookId);
  const slicedBooks = sortedBooks.slice(0, bookIndex);
  const x = slicedBooks.reduce((acc, book) => {
    const [, thickness] = getContentfulBookSize(book.bookSize);
    return acc + thickness;
  }, ownThickness / 2);
  const halfOfFirstBookThickness =
    getContentfulBookSize(sortedBooks[0].bookSize)[1] / 2;
  return { posX: x - halfOfFirstBookThickness, posY: 0, posZ: 0 };
};

export const calculateSortGridPosition = (
  bookId: BookId,
  overrides?: {
    gridItemWidth?: number;
    gridItemHeight?: number;
    columnSpacing?: number;
    rowSpacing?: number;
    yOffset?: number;
    zOffset?: number;
    columns?: number;
  }
): { posX: number; posY: number; posZ: number } => {
  const columns = overrides?.columns || 4;
  const bookIndex = getCurrentBookIndex(bookId);
  const gridItemWidth = overrides?.gridItemWidth || 0.24;
  const gridItemHeight = overrides?.gridItemHeight || 0.24;
  const columnSpacing = overrides?.columnSpacing || 0.0;
  const rowSpacing = overrides?.rowSpacing || 0.03;
  const yOffset = overrides?.yOffset || 0.1;
  const zOffset = overrides?.zOffset || 0;
  const totalBooks = Object.keys(bookStore.books).length;
  const totalRows = Math.ceil(totalBooks / columns);
  const bottomRowY = -yOffset; // Bottom of the last row

  const reversedIndex = totalBooks - 1 - bookIndex;
  const row = Math.floor(reversedIndex / columns);
  const col = reversedIndex % columns;

  const xStep = gridItemWidth + columnSpacing;
  const yStep = gridItemHeight + rowSpacing;

  // Center columns around 0 on X and calculate Y from bottom row up
  const x = (col - (columns - 1) / 2) * xStep;
  const y = bottomRowY + (totalRows - 1 - row) * yStep + gridItemHeight / 2;
  const z = -0.3 + zOffset;

  return { posX: x, posY: y, posZ: z };
};

export const getGridHeight = (overrides?: {
  columns?: number;
  gridItemHeight?: number;
  rowSpacing?: number;
}): { topLimit: number; bottomLimit: number } => {
  const columns = overrides?.columns || 4;
  const gridItemHeight = overrides?.gridItemHeight || 0.24;
  const rowSpacing = overrides?.rowSpacing || 0.02;
  const bottomRowY = -0.3; // Bottom of the last row

  const totalBooks = Object.keys(bookStore.books).length;
  const totalRows = Math.ceil(totalBooks / columns);

  // Bottom limit is the bottom of the bottom row
  const bottomLimit = bottomRowY - gridItemHeight / 2;

  // Top limit is calculated based on the number of rows
  const yStep = gridItemHeight + rowSpacing;
  const topLimit = bottomRowY + (totalRows - 1) * yStep + gridItemHeight / 2;

  return { topLimit, bottomLimit };
};

export const getCurrentBookIndex = (bookId: BookId) => {
  const sortedBooks = getSortedBooks();
  return sortedBooks.findIndex((book) => book.id === bookId);
};

// Configure Fuse.js for fuzzy searching books
const fuseOptions = {
  keys: [
    { name: "title", weight: 0.7 },
    { name: "authors.fullName", weight: 0.3 }, // Search in authors array
  ],
  threshold: 0.3, // Balance between strict and fuzzy (0 = exact, 1 = match anything)
  includeScore: true,
  includeMatches: true,
  ignoreLocation: true, // Search anywhere in the string
  shouldSort: true, // Sort by best match
};

export const filterBooksByFuzzySearch = (search: string) => {
  const books = bookStore.books;
  // If no search term, return all books
  if (!search || search.trim() === "") {
    return books;
  }

  // Create Fuse instance with the books
  const bookArray = Object.values(books);

  const fuse = new Fuse(bookArray, fuseOptions);

  // Perform the search
  const results = fuse.search(search);

  // Convert results back to BookMap format
  const filteredBooks: BookMap = Object.values(books).reduce((acc, book) => {
    acc[book.id] = {
      ...book,
      hidden: true,
    };
    return acc;
  }, {} as BookMap);

  results.forEach((result) => {
    filteredBooks[result.item.id].hidden = false;
  });

  return search.length > 1 ? filteredBooks : books;
};
