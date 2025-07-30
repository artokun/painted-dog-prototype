"use client";

import { useState, useEffect } from "react";
import { useSnapshot } from "valtio";
import { authStore } from "@/app/store/authStore";

const CORRECT_PASSWORD = "The-Quick-Spotted-Dog";
const AUTH_STORAGE_KEY = "painted-dog-auth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSnapshot(authStore);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth === "true") {
      authStore.isAuthenticated = true;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === CORRECT_PASSWORD) {
      authStore.isAuthenticated = true;
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="p-8 max-w-md w-full mx-4 flex flex-col items-center">
        <img src="/logo-dog.png" alt="Logo" className="w-50 mb-10" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Password"
              className="w-full px-4 py-2 border  rounded-sm focus:outline-none focus:ring-2 focus:ring-white text-black placeholder:text-gray-500 bg-white"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">
                Incorrect password. Please try again.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
