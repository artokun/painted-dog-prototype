import { proxy } from "valtio";

interface BookState {
  featuredBookId: string | null;
  bookThicknesses: Record<string, number>;
  slidOutBookThickness: number;
}

export const bookStore = proxy<BookState>({
  featuredBookId: null,
  bookThicknesses: {},
  slidOutBookThickness: 0,
});

export const setFeaturedBook = (id: string | null) => {
  const previousId = bookStore.featuredBookId;
  bookStore.featuredBookId = id;

  // Update slid out book thickness
  if (id !== null && bookStore.bookThicknesses[id]) {
    bookStore.slidOutBookThickness = bookStore.bookThicknesses[id];
  } else {
    bookStore.slidOutBookThickness = 0;
  }
};

export const registerBookThickness = (id: string, thickness: number) => {
  bookStore.bookThicknesses[id] = thickness;
};
