import { useSnapshot } from "valtio";
import { bookStore } from "@/app/store/bookStore";
import { Markdown } from "@/app/components/Markdown";

export const AuthorsSection = () => {
  const { books, focusedBookId } = useSnapshot(bookStore);
  const book = focusedBookId ? books[focusedBookId] : null;

  if (!book) return null;

  return (
    <div className="mb-auto flex flex-col gap-8">
      {book.authors.map((author) => (
        <div key={author.id}>
          <h6 className="text-sm">Author</h6>
          <h2 className="mb-8 text-2xl font-medium">{author.fullName}</h2>
          <Markdown
            content={author.biography || ""}
            className="text-base"
            lightboxEnabled
          />
        </div>
      ))}
    </div>
  );
};
