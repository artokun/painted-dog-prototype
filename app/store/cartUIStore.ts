import { proxy } from "valtio";

export const cartUIStore = proxy({
  isOpen: false,
});

export const openCart = () => {
  cartUIStore.isOpen = true;
};

export const closeCart = () => {
  cartUIStore.isOpen = false;
};
