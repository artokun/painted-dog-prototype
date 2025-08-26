import { BookId, BookMap, SortBy, SortOrder } from "@/types/book";
import { filterStore } from "../store/filterStore";
import Fuse from "fuse.js";
import * as THREE from "three";

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

// Calculate optimal Z distance for focused book to fill 75% of viewport height
export const calculateOptimalZDistance = (camera: THREE.Camera) => {
  // Use a fixed reference book height so all books appear the same size on screen
  // Using medium book width (0.185) as the reference since it's in the middle of the range
  const referenceBookHeight = 0.185;

  // VIEWPORT_PERCENTAGE: Adjust this value to change how much of the screen the featured book fills
  const targetScreenPercentage = 0.8;

  // Camera FOV (from page.tsx)
  const fov = 45;
  const fovRadians = (fov * Math.PI) / 180;

  // Calculate distance needed for book to fill target percentage of viewport
  // Using: tan(fov/2) = (height/2) / distance
  // Rearranged: distance = (height/2) / tan(fov/2)
  const halfFov = fovRadians / 2;
  const viewportHeightAtUnitDistance = 2 * Math.tan(halfFov);

  // Same distance for all books so they appear the same size on screen
  const distance =
    referenceBookHeight /
    (targetScreenPercentage * viewportHeightAtUnitDistance);

  return camera.position.z - distance;
};

const bookSizeMap: Record<
  string,
  [width: number, height: number, depth: number]
> = {
  thin: [0.18, 0.01, 0.13],
  thick: [0.19, 0.015, 0.14],
  medium: [0.185, 0.02, 0.135],
  veryThick: [0.175, 0.025, 0.12],
  extraThick: [0.182, 0.03, 0.138],
};

export const getBookSize = (
  size: string
): [width: number, height: number, depth: number] => {
  return bookSizeMap[size as keyof typeof bookSizeMap];
};

export const getSortedBooks = (
  books: BookMap,
  sortBy: SortBy,
  sortOrder: SortOrder
) => {
  return (
    Object.values(books)
      .sort((a, b) => {
        switch (sortBy) {
          case SortBy.Title:
            return sortOrder === SortOrder.Asc
              ? a.title.localeCompare(b.title)
              : b.title.localeCompare(a.title);
          case SortBy.Author:
            return sortOrder === SortOrder.Asc
              ? a.firstName.localeCompare(b.firstName)
              : b.firstName.localeCompare(a.firstName);
        }
      })
      // Move featured books to the top
      .sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return 1;
        if (!a.isFeatured && b.isFeatured) return -1;
        return 0;
      })
  );
};

export const getBookStackHeight = (books: BookMap): number => {
  const sortedBooks = getSortedBooks(books, SortBy.Title, SortOrder.Desc);
  const filteredBooks = sortedBooks.filter((book) => !book.isFeatured);
  return filteredBooks.reduce((acc, book) => {
    const [, height] = getBookSize(book.size);
    return acc + height;
  }, 0);
};

export const getDropHeight = (
  bookId: BookId,
  focusedBookId: BookId | null,
  books: BookMap,
  sortBy: SortBy,
  sortOrder: SortOrder
): number => {
  if (focusedBookId !== null && focusedBookId !== bookId) {
    const sortedBooks = getSortedBooks(books, sortBy, sortOrder);
    const bookIndex = sortedBooks.findIndex((book) => book.id === bookId);
    const focusedBookIndex = sortedBooks.findIndex(
      (book) => book.id === focusedBookId
    );
    if (bookIndex <= focusedBookIndex) return 0;
    const [, height] = getBookSize(books[focusedBookId].size);
    return height;
  }
  return 0;
};

export const getBookSortYPosition = (
  bookId: BookId,
  books: BookMap,
  sortBy: SortBy,
  sortOrder: SortOrder
): { posX: number; posY: number; posZ: number } => {
  const { size, isFeatured } = books[bookId];
  const [ownWidth, ownHeight] = getBookSize(size);

  if (isFeatured) {
    return { posX: 0, posY: getBookStackHeight(books) + ownWidth / 2, posZ: 0 };
  }

  const sortedBooks = getSortedBooks(books, sortBy, sortOrder);

  //remove featured books
  const filteredBooks = sortedBooks.filter((book) => !book.isFeatured);

  const bookIndex = filteredBooks.findIndex((book) => book.id === bookId);
  const slicedBooks = filteredBooks.slice(0, bookIndex);

  const y = slicedBooks.reduce((acc, book) => {
    const [, height] = getBookSize(book.size);
    return acc + height;
  }, ownHeight / 2);

  return { posX: 0, posY: y, posZ: 0 };
};

export const calculateSortGridPosition = (
  bookId: BookId,
  books: BookMap,
  sortBy: SortBy,
  sortOrder: SortOrder
): { posX: number; posY: number; posZ: number } => {
  const columns = 4;
  const bookIndex = getCurrentBookIndex(bookId, books, sortBy, sortOrder);
  const gridItemWidth = 0.2;
  const gridItemHeight = 0.24;
  const columnSpacing = 0.01;
  const rowSpacing = 0.01;
  const baseY = 0.75; // top row baseline

  const totalBooks = Object.keys(books).length;
  const reversedIndex = totalBooks - 1 - bookIndex;
  const row = Math.floor(reversedIndex / columns);
  const col = reversedIndex % columns;

  const xStep = gridItemWidth + columnSpacing;
  const yStep = gridItemHeight + rowSpacing;

  // Center columns around 0 on X and move rows downward from baseY on Y
  const x = (col - (columns - 1) / 2) * xStep;
  const y = baseY - row * yStep;
  const z = -0.5;

  return { posX: x, posY: y, posZ: z };
};

export const getGridHeight = (
  books: BookMap
): { topLimit: number; bottomLimit: number } => {
  const columns = 4;
  const gridItemHeight = 0.24;
  const rowSpacing = 0.01;
  const baseY = 0.75; // top row baseline

  const totalBooks = Object.keys(books).length;
  const totalRows = Math.ceil(totalBooks / columns);

  // Top limit is the baseline Y position
  const topLimit = baseY + gridItemHeight / 2;

  // Bottom limit is calculated based on the number of rows
  const yStep = gridItemHeight + rowSpacing;
  const bottomLimit = baseY - (totalRows - 1) * yStep - gridItemHeight / 2;

  return { topLimit, bottomLimit };
};
export const getCurrentBookIndex = (
  bookId: BookId,
  books: BookMap,
  sortBy: SortBy,
  sortOrder: SortOrder
) => {
  const sortedBooks = getSortedBooks(books, sortBy, sortOrder);
  return sortedBooks.findIndex((book) => book.id === bookId);
};

// Configure Fuse.js for fuzzy searching books
const fuseOptions = {
  keys: [
    { name: "title", weight: 0.7 },
    { name: "firstName", weight: 0.15 },
    { name: "surname", weight: 0.15 },
  ],
  threshold: 0.3, // Balance between strict and fuzzy (0 = exact, 1 = match anything)
  includeScore: true,
  includeMatches: true,
  ignoreLocation: true, // Search anywhere in the string
  shouldSort: true, // Sort by best match
};

export const filterBooksByFuzzySearch = (books: BookMap, search: string) => {
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
      hidden: false,
    };
    return acc;
  }, {} as BookMap);
  results.forEach((result) => {
    filteredBooks[result.item.id].hidden = true;
  });

  return search.length > 1 ? filteredBooks : books;
};
