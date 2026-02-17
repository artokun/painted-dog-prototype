"use client";

import { bookStore } from "@/app/store/bookStore";
import { useEffect } from "react";
import { useSnapshot } from "valtio";

// This client component is used to set the focused book id when the page is loaded
export default function Client({ slug }: { slug: string }) {
  const { books, isRendered } = useSnapshot(bookStore);

  useEffect(() => {
    if (isRendered) {
      // Find the book by its slug property
      const bookId = Object.keys(books).find(
        (id) => books[id].slug === slug
      );

      if (bookId) {
        bookStore.focusedBookId = bookId;
      }
    }
  }, [isRendered, slug, books]);

  return null;
}
