import { proxy } from "valtio";
import { BookId, BookMap, ContentfulBook } from "../../types/book";

interface BookState {
  focusedBookId: BookId | null;
  hoveredBookId: BookId | null;
  books: BookMap;
  isLoading: boolean;
  error: string | null;
}

export const bookStore = proxy<BookState>({
  focusedBookId: null,
  hoveredBookId: null,
  books: {},
  isLoading: false,
  error: null,
});

// Helper function to convert books array to map
function booksArrayToMap(
  books: ContentfulBook[]
): Record<string, ContentfulBook> {
  return books.reduce(
    (map, book) => {
      map[book.id] = book;
      return map;
    },
    {} as Record<string, ContentfulBook>
  );
}

export const loadBooks = async () => {
  bookStore.isLoading = true;
  bookStore.error = null;

  try {
    // Fetch books from our API route
    const response = await fetch("/api/books");

    if (!response.ok) {
      throw new Error(
        `Failed to fetch books: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch books");
    }

    const booksMap = booksArrayToMap(result.data);
    bookStore.books = booksMap;

    console.log(`✅ Loaded ${result.count} books from Contentful`);
  } catch (error) {
    console.error("Failed to load books:", error);
    bookStore.error =
      error instanceof Error ? error.message : "Failed to load books";
  } finally {
    bookStore.isLoading = false;
  }
};
