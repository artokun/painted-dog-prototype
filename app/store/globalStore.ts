import { proxy } from "valtio";

interface GlobalStore {
  currentRoute: string;
  scrollPages: number;
  overlayScrollPosition: number;
  isMenuOpen: boolean;
}

export const globalStore = proxy<GlobalStore>({
  currentRoute: "/",
  scrollPages: 1.75, // Default value, will be updated dynamically
  overlayScrollPosition: 0,
  isMenuOpen: false,
});
