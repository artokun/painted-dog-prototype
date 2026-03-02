import { proxy } from "valtio";

interface GlobalStore {
  currentRoute: string;
  previousRoute: string;
  scrollPages: number;
  overlayScrollPosition: number;
  scrollProgress: number; // 0-1 normalized scroll progress from native scroll
  isMenuOpen: boolean;
  isNewsLetterModalOpen: boolean;
}

export const globalStore = proxy<GlobalStore>({
  currentRoute: "/",
  previousRoute: "/",
  scrollPages: 1.75, // Default value, will be updated dynamically
  overlayScrollPosition: 0,
  scrollProgress: 0,
  isMenuOpen: false,
  isNewsLetterModalOpen: false,
});
