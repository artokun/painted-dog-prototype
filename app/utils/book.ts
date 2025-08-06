import { BookId, BookMap, SortBy, SortOrder } from "@/types/book";

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
export const calculateOptimalZDistance = () => {
  // Use a fixed reference book height so all books appear the same size on screen
  // Using medium book width (0.185) as the reference since it's in the middle of the range
  const referenceBookHeight = 0.185;

  // VIEWPORT_PERCENTAGE: Adjust this value to change how much of the screen the featured book fills
  const targetScreenPercentage = 1.6;

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

  return distance;
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
): number => {
  const { size, isFeatured } = books[bookId];
  const [ownWidth, ownHeight] = getBookSize(size);

  if (isFeatured) {
    return getBookStackHeight(books) + ownWidth / 2;
  }

  const sortedBooks = getSortedBooks(books, sortBy, sortOrder);

  //remove featured books
  const filteredBooks = sortedBooks.filter((book) => !book.isFeatured);

  const bookIndex = filteredBooks.findIndex((book) => book.id === bookId);
  const slicedBooks = filteredBooks.slice(0, bookIndex);

  return slicedBooks.reduce((acc, book) => {
    const [, height] = getBookSize(book.size);
    return acc + height;
  }, ownHeight / 2);
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
