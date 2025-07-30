import { proxy } from "valtio"

export const authStore = proxy({
  isAuthenticated: false,
})