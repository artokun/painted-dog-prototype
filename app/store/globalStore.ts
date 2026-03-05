import { proxy } from "valtio";

interface GlobalStore {
  currentRoute: string;
  previousRoute: string;
  scrollPages: number;
  overlayScrollPosition: number;
  scrollProgress: number; // 0-1 normalized scroll progress from native scroll
  landingTransitionProgress: number; // 0-1 normalized hero progress for shared landing motion
  featuredBookAnchorNdcY: number; // target NDC Y for featured book hero placement
  isMenuOpen: boolean;
  isNewsLetterModalOpen: boolean;
}

export const globalStore = proxy<GlobalStore>({
  currentRoute: "/",
  previousRoute: "/",
  scrollPages: 1.75, // Default value, will be updated dynamically
  overlayScrollPosition: 0,
  scrollProgress: 0,
  landingTransitionProgress: 0,
  featuredBookAnchorNdcY: 0,
  isMenuOpen: false,
  isNewsLetterModalOpen: false,
});
