import { useSnapshot, subscribe } from "valtio";
import Book from "./Book";
import { useEffect } from "react";
import { bookStore, loadBooks } from "../store/bookStore";
import { FilterKey, filterStore } from "../store/filterStore";
import { filterBooksByFuzzySearch } from "../utils/book";
import { subscribeKey } from "valtio/utils";

export default function BookStack() {
  const { books } = useSnapshot(bookStore);

  useEffect(() => {
    loadBooks();

    const unsubscribe = subscribeKey(
      filterStore,
      FilterKey.Search,
      (search) => {
        const filteredBooks = filterBooksByFuzzySearch(books, search);
        bookStore.books = filteredBooks;
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return Object.entries(books).map(([id, book]) => <Book key={id} {...book} />);
}
