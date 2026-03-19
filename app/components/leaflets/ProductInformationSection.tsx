import { useSnapshot } from "valtio";
import { bookStore } from "@/app/store/bookStore";
import { Fragment } from "react";
import { MarkdownParagraph } from "@/app/components/Markdown";

export const ProductInformationSection = () => {
  const { books, focusedBookId } = useSnapshot(bookStore);
  const book = focusedBookId ? books[focusedBookId] : null;

  if (!book) return null;

  console.log(book.prices);

  return (
    <div className="flex flex-col mb-auto">
      <h6 className="text-sm">Product Information</h6>
      {book.prices.map((price) => (
        <div key={price.id}>
          <h2 className="text-2xl font-medium mb-4">{price.text}</h2>
          <MarkdownParagraph content={price.description || ""} />

          {price.productInformation && (
            <div
              className="grid mt-8"
              style={{ gridTemplateColumns: "1fr 1fr" }}
            >
              <span>ISBN:</span>
              <span>{book.isbn}</span>
              <span>Price:</span>
              <span>R{price.price}</span>
              <span>Publication Date:</span>
              <span>{new Date(book.publishDate).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}</span>
              {Object.entries(price.productInformation)
                .sort((a, b) => a[0].length - b[0].length)
                .map(([key, value]) => (
                  <Fragment key={key}>
                    <span>{key}:</span>
                    <span>{value as string}</span>
                  </Fragment>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
