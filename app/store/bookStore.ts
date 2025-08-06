import { proxy } from "valtio";
import { BookId, BookMap, validateBooks } from "../../types/book";
import booksDataRaw from "../../public/books.json";

interface BookState {
  focusedBookId: BookId | null;
  books: BookMap;
}

export const bookStore = proxy<BookState>({
  focusedBookId: null,
  books: {},
});

export const loadBooks = () => {
  const books = validateBooks(booksDataRaw);
  const booksMap = books.reduce((acc, book) => {
    acc[book.id] = book;
    return acc;
  }, {} as BookMap);
  bookStore.books = booksMap;
};
