import { useSnapshot } from "valtio";
import Book from "./Book";
import { useEffect } from "react";
import { bookStore, type BookState, loadBooks } from "../store/bookStore";
import { FilterKey, filterStore } from "../store/filterStore";
import { filterBooksByFuzzySearch } from "../utils/book";
import { subscribeKey } from "valtio/utils";
import { useBookMaterialControls } from "../hooks/useBookMaterialControls";
import { BookMap } from "@/types/book";

export default function BookStack() {
  const { books, isLoading, error } = useSnapshot(bookStore) as BookState & {
    books: BookMap;
  };
  const materialControls = useBookMaterialControls();

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
  if (isLoading) {
    return null; // Could add a loading indicator here
  }

  // Show error state
  if (error) {
    console.error("Error loading books:", error);
    return null; // Could add error display here
  }

  return Object.entries(books).map(([id, book]) => (
    <Book key={id} book={book} materialControls={materialControls} />
  ));
}
