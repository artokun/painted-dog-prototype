import { useSnapshot } from "valtio";
import { bookStore } from "@/app/store/bookStore";
import { truncateWords } from "@/app/utils/book";

export const BookSection = ({
  setSelectedIndex,
}: {
  setSelectedIndex?: (index: number) => void;
}) => {
  const { books, focusedBookId } = useSnapshot(bookStore);
  const book = focusedBookId ? books[focusedBookId] : null;

  if (!book) return null;

  const { truncated, isTruncated } = truncateWords(
    book?.description || "",
    145
  );

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-medium">{book?.title}</h2>
      {book?.isbn && (
        <p className="relative text-sm text-gray-800 -translate-y-2">
          ISBN&nbsp;: {book.isbn}
        </p>
      )}
      <p className="whitespace-pre-wrap">
        {truncated}
        {isTruncated && setSelectedIndex && (
          <button
            onClick={() => setSelectedIndex(6)}
            className="ml-1 font-medium underline cursor-pointer"
          >
            Read More
          </button>
        )}
      </p>
    </div>
  );
};
