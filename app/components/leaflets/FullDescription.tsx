import { useSnapshot } from "valtio";
import { bookStore } from "@/app/store/bookStore";
import { MarkdownParagraph } from "@/app/components/Markdown";

export const FullDescriptionSection = () => {
  const { books, focusedBookId } = useSnapshot(bookStore);
  const book = focusedBookId ? books[focusedBookId] : null;

  if (!book) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-medium mb-4 md:-mt-4">{book?.title}</h2>
      {book?.isbn && (
        <p className="relative text-sm text-gray-800 -translate-y-2 -mt-4">
          ISBN&nbsp;: {book.isbn}
        </p>
      )}
      <MarkdownParagraph content={book?.description || ""} />
    </div>
  );
};
