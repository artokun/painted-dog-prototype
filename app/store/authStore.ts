import { proxy } from "valtio";

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  customerId?: string;
  provider?: "google" | "shopify";
}

interface AuthStore {
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
  hydrated: boolean; // true once the session check has completed
}

export const authStore = proxy<AuthStore>({
  isLoggedIn: false,
  user: null,
  accessToken: null,
  hydrated: false,
});

// ── Rehydrate from the httpOnly session cookie (via API bridge) ──────────────
// Call this once in a top-level client component on mount.
export async function hydrateAuth() {
  try {
    const res = await fetch("/api/auth/session");
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated) {
        authStore.isLoggedIn = true;
        authStore.user = data.user;
        authStore.accessToken = data.accessToken ?? null;
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    authStore.hydrated = true;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export const login = (user: User, accessToken: string) => {
  authStore.isLoggedIn = true;
  authStore.user = user;
  authStore.accessToken = accessToken;
  authStore.hydrated = true;
};

// Clears client state AND navigates to the logout route which deletes the cookie.
// export const logout = () => {
//   authStore.isLoggedIn = false;
//   authStore.user = null;
//   authStore.accessToken = null;
// };

export const isGoogleOnlyUser = () => {
  return authStore.user?.provider === "google" && !authStore.user?.customerId;
};

export const logout = async () => {
  // Clear client state immediately for instant UI feedback
  authStore.isLoggedIn = false;
  authStore.user = null;
  authStore.accessToken = null;

  // Delete the httpOnly cookie server-side, then redirect to home
  window.location.href = "/api/auth/logout";
};
