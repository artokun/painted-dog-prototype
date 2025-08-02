import { proxy } from "valtio";
import {
  BookId,
  BookMap,
  SortBy,
  SortOrder,
  validateBooks,
} from "../../types/book";
import booksDataRaw from "../../public/books.json";

interface BookState {
  focusedBookId: BookId | null;
  books: BookMap;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export const bookStore = proxy<BookState>({
  focusedBookId: null,
  books: {},
  sortBy: SortBy.Title,
  sortOrder: SortOrder.Desc,
});

export const loadBooks = () => {
  const books = validateBooks(booksDataRaw);
  const booksMap = books.reduce((acc, book) => {
    acc[book.id] = book;
    return acc;
  }, {} as BookMap);
  bookStore.books = booksMap;
};
