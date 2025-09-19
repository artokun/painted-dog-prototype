import { useSnapshot } from "valtio";
import Book from "./Book";
import { Suspense, useEffect } from "react";
import { bookStore, type BookState, loadBooks } from "../../store/bookStore";
import { FilterKey, filterStore } from "../../store/filterStore";
import {
  filterBooksByFuzzySearch,
  getContentfulBookSize,
} from "../../utils/book";
import { subscribeKey } from "valtio/utils";
import { useBookMaterialControls } from "../../hooks/useBookMaterialControls";
import { BookMap } from "@/types/app";
import { useGridOverrideControls } from "../../hooks/useGridOverrideControls";

export default function BookStack() {
  const { books, isLoading, error } = useSnapshot(bookStore) as BookState & {
    books: BookMap;
  };
  const materialControls = useBookMaterialControls();
  const gridOverrideControls = useGridOverrideControls();
  const [height] = getContentfulBookSize("280x260");

  useEffect(() => {
    // Load books from Contentful
    loadBooks();

    const unsubscribe = subscribeKey(
      filterStore,
      FilterKey.Search,
      (search) => {
        const filteredBooks = filterBooksByFuzzySearch(search);
        bookStore.books = filteredBooks;
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Show loading state
  if (isLoading || Object.keys(books).length === 0) {
    return null; // Could add a loading indicator here
  }

  // Show error state
  if (error) {
    console.error("Error loading books:", error);
    return null; // Could add error display here
  }

  return (
    <Suspense fallback={null}>
      <group position-y={-height / 2 - 0.015}>
        {Object.entries(books).map(([id, book]) => (
          <Book
            key={id}
            book={book}
            materialControls={materialControls}
            gridOverrideControls={gridOverrideControls}
          />
        ))}
      </group>
      <Rendered />
    </Suspense>
  );
}

const Rendered = () => {
  useEffect(() => {
    bookStore.isRendered = true;

    return () => {
      bookStore.isRendered = false;
    };
  }, []);

  return null;
};
