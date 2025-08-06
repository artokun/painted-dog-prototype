import { proxy } from "valtio";
import { SortBy, SortOrder } from "../../types/book";

export enum FilterKey {
  SortBy = "sortBy",
  SortOrder = "sortOrder",
  Search = "search",
}

export enum FilterView {
  Stack = "stack",
  Grid = "grid",
}

interface FilterState {
  open: FilterKey | null;
  isSorting: boolean;
  isChangingView: boolean;
  view: FilterView;
  sortBy: SortBy;
  sortOrder: SortOrder;
  search: string;
}

export const filterStore = proxy<FilterState>({
  open: null,
  isSorting: false,
  isChangingView: false,
  view: FilterView.Stack,
  sortBy: SortBy.Title,
  sortOrder: SortOrder.Desc,
  search: "",
});
