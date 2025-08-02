import { useSnapshot } from "valtio";
import Book from "./Book";
import { useEffect } from "react";
import { bookStore, loadBooks } from "../store/bookStore";

export default function BookStack() {
  const { books } = useSnapshot(bookStore);

  useEffect(() => {
    loadBooks();
  }, []);

  return Object.entries(books).map(([id, book]) => <Book key={id} {...book} />);
}
