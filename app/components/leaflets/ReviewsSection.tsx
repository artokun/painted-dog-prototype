import { useSnapshot } from "valtio";
import { bookStore } from "@/app/store/bookStore";
import Link from "next/link";
import { PDButton } from "../ui/PDButton";

export const ReviewsSection = () => {
  const { books, focusedBookId } = useSnapshot(bookStore);
  const book = focusedBookId ? books[focusedBookId] : null;

  if (!book) return null;

  return (
    <div className="flex flex-col mb-auto">
      <h6 className="text-sm">Reviews</h6>
      <h2 className="text-2xl font-medium mb-10">Critical Reception</h2>
      <div className="flex flex-col gap-9 mb-9">
        {book?.reviews.length > 0 ? (
          book?.reviews.map((review) => (
            <div className="flex flex-col gap-2" key={review.id}>
              <p className="whitespace-pre-wrap">{review.excerpt}</p>
              <div className="flex justify-end">
                <Link
                  href={review.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="uppercase text-sm"
                >
                  {review.criticName}
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p>No reviews have been added yet for this book.</p>
        )}
      </div>
      <div className="flex flex-col gap-6">
        <p>
          All reviews that we are aware of will appear above above and within
          our forthcoming review archive. In the spirit of openness and sharing
          a critical outlook on all literature, we share positive as well as
          mixed and critical reviews.
        </p>
        <p>
          We care about fostering a meaningful discussion and believe that
          people from disparate places and communities will inevitably have a
          variety of experiences and insights in response to any piece of
          literature.
        </p>
        <p>
          Have you found a review we have excluded? Let us know using our
          contact form.
        </p>
        <PDButton href="/contact" className="self-start mt-4" primary tall wide>
          Contact Us
        </PDButton>
      </div>
    </div>
  );
};
