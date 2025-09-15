import { proxy } from "valtio";

interface GlobalStore {
  currentRoute: string;
}

export const globalStore = proxy<GlobalStore>({
  currentRoute: "/",
});
