import { proxy } from "valtio";

interface BookState {
  focusedBookId: string | null;
  bookThicknesses: Record<string, number>;
  slidOutBookThickness: number;
  sortStep: number | null;
}

export const bookStore = proxy<BookState>({
  focusedBookId: null,
  bookThicknesses: {},
  slidOutBookThickness: 0,
  sortStep: null,
});

export const setFocusedBook = (id: string | null) => {
  const previousId = bookStore.focusedBookId;
  bookStore.focusedBookId = id;

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
