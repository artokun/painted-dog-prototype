import { useSnapshot } from "valtio";
import { bookStore } from "@/app/store/bookStore";

export const FullDescriptionSection = () => {
  const { books, focusedBookId } = useSnapshot(bookStore);
  const book = focusedBookId ? books[focusedBookId] : null;

  if (!book) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-medium mb-4">{book?.title}</h2>
      <p className="whitespace-pre-wrap">{book?.description}</p>
    </div>
  );
};
