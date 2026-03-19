import { proxy } from "valtio";

export const cartUIStore = proxy({
  isOpen: false,
  returnToCartAfterLogin: false,
  proceedToCheckoutAfterLogin: false,
});

export const openCart = () => {
  cartUIStore.isOpen = true;
};

export const closeCart = () => {
  cartUIStore.isOpen = false;
};

export const setReturnToCart = (value: boolean) => {
  cartUIStore.returnToCartAfterLogin = value;
};

export const setProceedToCheckout = (value: boolean) => {
  cartUIStore.proceedToCheckoutAfterLogin = value;
};
