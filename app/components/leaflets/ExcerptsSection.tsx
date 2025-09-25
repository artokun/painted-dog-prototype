import { useSnapshot } from "valtio";
import { bookStore } from "@/app/store/bookStore";
import { PDButton } from "../ui/PDButton";
import { slugify } from "@/lib/utils";

export const ExcerptsSection = () => {
  const { books, focusedBookId } = useSnapshot(bookStore);
  const book = focusedBookId ? books[focusedBookId] : null;

  if (!book) return null;

  return (
    <div className="flex flex-col mb-auto">
      <h6 className="text-sm">Excerpt</h6>
      <h2 className="text-2xl font-medium mb-5">Download an Excerpt</h2>
      {book?.excerpt?.url ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <p>
              Would you like to sample the book before purchasing?
              Understandable for a discerning reader such as yourself!
            </p>
            <p>Hit the download link below to take a look.</p>
          </div>
          <div className="flex justify-center">
            <PDButton
              title={book?.excerpt?.title}
              href={book?.excerpt?.url}
              target="_blank"
              rel="noopener noreferrer"
              download={
                slugify(book?.excerpt?.title ?? "excerpt")
                  .split("-")
                  .join("_")
                  .toLowerCase()
                  .split(".")[0] +
                "." +
                book?.excerpt?.contentType.split("/")[1]
              }
              className="self-start mt-4"
              primary
              tall
              wide
            >
              Download Excerpt
            </PDButton>
          </div>
        </div>
      ) : (
        <p>No excerpt available for this book.</p>
      )}
    </div>
  );
};
