"use client";

import { bookStore } from "@/app/store/bookStore";
import { useEffect } from "react";
import { useSnapshot } from "valtio";

// This client component is used to set the focused book id when the page is loaded
export default function Client({ slug }: { slug: string }) {
  const { books, isRendered } = useSnapshot(bookStore);

  useEffect(() => {
    if (
      isRendered &&
      Object.keys(books).findIndex((key) => key === slug) !== -1
    ) {
      bookStore.focusedBookId = slug;
    }
  }, [isRendered, slug, books]);

  return null;
}
