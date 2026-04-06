import { useSnapshot } from "valtio";
import { bookStore } from "@/app/store/bookStore";
import { MarkdownParagraph } from "@/app/components/Markdown";

export const BookSection = ({
  setSelectedIndex,
}: {
  setSelectedIndex?: (index: number) => void;
}) => {
  const { books, focusedBookId } = useSnapshot(bookStore);
  const book = focusedBookId ? books[focusedBookId] : null;

  if (!book) return null;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-medium">{book?.title}</h2>
      {book?.isbn && (
        <p className="relative -translate-y-2 text-sm text-gray-800">
          ISBN&nbsp;: {book.isbn}
        </p>
      )}
      <MarkdownParagraph
        content={book?.description || ""}
        truncate={true}
        truncateLength={110}
        truncateBy="words"
        onReadMore={setSelectedIndex ? () => setSelectedIndex(6) : undefined}
        lightboxEnabled
      />
    </div>
  );
};
