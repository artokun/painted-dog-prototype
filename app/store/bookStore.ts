import { proxy } from 'valtio';

interface BookState {
  featuredBookIndex: number | null;
  bookThicknesses: number[];
  slidOutBookThickness: number;
}

export const bookStore = proxy<BookState>({
  featuredBookIndex: null,
  bookThicknesses: [],
  slidOutBookThickness: 0,
});

export const setFeaturedBook = (index: number | null) => {
  const previousIndex = bookStore.featuredBookIndex;
  bookStore.featuredBookIndex = index;
  
  // Update slid out book thickness
  if (index !== null && bookStore.bookThicknesses[index]) {
    bookStore.slidOutBookThickness = bookStore.bookThicknesses[index];
  } else {
    bookStore.slidOutBookThickness = 0;
  }
};

export const registerBookThickness = (index: number, thickness: number) => {
  bookStore.bookThicknesses[index] = thickness;
};