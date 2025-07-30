import { proxy } from "valtio";

export interface SortOrder {
  name: string;
  bookIds: string[]; // Array of book IDs in the desired order
}

interface BookState {
  focusedBookId: string | null;
  bookThicknesses: Record<string, number>;
  slidOutBookThickness: number;
  sortStep: number | null;

  // Pre-calculated sort orders
  availableSorts: Record<string, SortOrder>;
  activeSortKey: string | null; // null = original order, string = sorted order
}

export const bookStore = proxy<BookState>({
  focusedBookId: null,
  bookThicknesses: {},
  slidOutBookThickness: 0,
  sortStep: null,
  availableSorts: {},
  activeSortKey: null,
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

// Pre-calculate and store all available sort orders
export const setSortOrders = (availableSorts: Record<string, SortOrder>) => {
  bookStore.availableSorts = availableSorts;
};

// Set the active sort order (null = original order)
export const setActiveSortKey = (sortKey: string | null) => {
  bookStore.activeSortKey = sortKey;
};

// Get the current active sort order (if any)
export const getActiveSortOrder = (): SortOrder | null => {
  if (
    !bookStore.activeSortKey ||
    !bookStore.availableSorts[bookStore.activeSortKey]
  ) {
    return null;
  }
  return bookStore.availableSorts[bookStore.activeSortKey];
};
