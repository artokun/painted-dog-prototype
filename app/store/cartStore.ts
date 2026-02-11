import { proxy, subscribe } from "valtio";

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartStore {
  items: CartItem[];
}

// Load cart from localStorage on initialization
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("shopping-cart");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading cart from storage:", error);
    return [];
  }
};

export const cartStore = proxy<CartStore>({
  items: loadCartFromStorage(),
});

// Save to localStorage whenever cart changes
subscribe(cartStore, () => {
  if (typeof window !== "undefined") {
    localStorage.setItem("shopping-cart", JSON.stringify(cartStore.items));
  }
});

// Helper functions
export const addToCart = (item: Omit<CartItem, "quantity">) => {
  const existingItem = cartStore.items.find((i) => i.id === item.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartStore.items.push({ ...item, quantity: 1 });
  }
};

export const removeFromCart = (id: string) => {
  cartStore.items = cartStore.items.filter((item) => item.id !== id);
};

export const clearCart = () => {
  cartStore.items = [];
};

export const getTotalItems = () => {
  return cartStore.items.reduce((total, item) => total + item.quantity, 0);
};

export const getTotalPrice = () => {
  return cartStore.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};
