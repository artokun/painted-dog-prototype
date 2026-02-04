// import { proxy } from "valtio"

// export const authStore = proxy({
//   isAuthenticated: false,
// })

import { proxy, subscribe } from "valtio";

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  customerId?: string;
}

interface AuthStore {
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
}

// Load auth from localStorage on initialization
const loadAuthFromStorage = (): AuthStore => {
  if (typeof window === "undefined") {
    return { isLoggedIn: false, user: null, accessToken: null };
  }

  try {
    const stored = localStorage.getItem("auth-state");
    return stored
      ? JSON.parse(stored)
      : { isLoggedIn: false, user: null, accessToken: null };
  } catch (error) {
    console.error("Error loading auth from storage:", error);
    return { isLoggedIn: false, user: null, accessToken: null };
  }
};

export const authStore = proxy<AuthStore>(loadAuthFromStorage());

// Save to localStorage whenever auth changes
subscribe(authStore, () => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth-state", JSON.stringify(authStore));
  }
});

// Helper functions
export const login = (user: User, accessToken: string) => {
  authStore.isLoggedIn = true;
  authStore.user = user;
  authStore.accessToken = accessToken;
};

export const logout = () => {
  authStore.isLoggedIn = false;
  authStore.user = null;
  authStore.accessToken = null;
};
