import { proxy } from "valtio";

interface GlobalStore {
  currentRoute: string;
  scrollPages: number;
  overlayScrollPosition: number;
}

export const globalStore = proxy<GlobalStore>({
  currentRoute: "/",
  scrollPages: 1.75, // Default value, will be updated dynamically
  overlayScrollPosition: 0,
});
