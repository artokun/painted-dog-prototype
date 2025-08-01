import { proxy } from "valtio";
import { Book, validateBooks } from "../../types/book";
import booksDataRaw from "../../public/books.json";

export type BookId = string;
interface BookState {
  focusedBookId: BookId | null;
  books: Record<BookId, Book>;
}

export const bookStore = proxy<BookState>({
  focusedBookId: null,
  books: {},
});

export const loadBooks = () => {
  const books = validateBooks(booksDataRaw);
  const booksMap = books.reduce(
    (acc, book) => {
      acc[book.id] = book;
      return acc;
    },
    {} as Record<BookId, Book>
  );
  bookStore.books = booksMap;
};
