import { proxy } from "valtio";

interface GlobalStore {
  currentRoute: string;
  previousRoute: string;
  scrollPages: number;
  overlayScrollPosition: number;
  isMenuOpen: boolean;
}

export const globalStore = proxy<GlobalStore>({
  currentRoute: "/",
  previousRoute: "/",
  scrollPages: 1.75, // Default value, will be updated dynamically
  overlayScrollPosition: 0,
  isMenuOpen: false,
});
