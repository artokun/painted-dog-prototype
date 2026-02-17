"use client";

import { useState, useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import {
  resetPasswordStore,
  closeResetPassword,
} from "@/app/store/resetPasswordStore";
import { resetCustomerPassword, getCustomer } from "@/lib/shopify-client";
import { login } from "@/app/store/authStore";
import { X } from "lucide-react";
import gsap from "gsap";

export const ResetPasswordModal = () => {
  const { isOpen, customerId, token } = useSnapshot(resetPasswordStore);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // GSAP Animation (same as ForgotPasswordModal)
  useEffect(() => {
    if (!modalRef.current || !overlayRef.current) return;

    if (isOpen) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "power3.out" }
      );
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
      gsap.to(modalRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain at least one letter and one number");
      return;
    }

    setLoading(true);

    try {
      const resetUrl = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/account/reset/${customerId}/${token}`;

      const result = await resetCustomerPassword(resetUrl, password);

      if (!result.success) {
        setError(result.error || "Reset failed. The link may have expired.");
        setLoading(false);
        return;
      }

      // Auto-login if we got an access token back
      if (result.accessToken) {
        const customerResult = await getCustomer(result.accessToken);

        if (customerResult.success) {
          await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user: {
                email: customerResult.customer.email,
                firstName: customerResult.customer.firstName,
                lastName: customerResult.customer.lastName,
                customerId: customerResult.customer.id,
              },
              accessToken: result.accessToken,
              rememberMe: false,
            }),
          });

          login(
            {
              email: customerResult.customer.email,
              firstName: customerResult.customer.firstName,
              lastName: customerResult.customer.lastName,
              customerId: customerResult.customer.id,
            },
            result.accessToken
          );
        }
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
    closeResetPassword();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto opacity-0"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-password-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white p-8 rounded-lg shadow-2xl m-4 opacity-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
          type="button"
        >
          <X size={24} />
        </button>

        <h2
          id="reset-password-title"
          className="text-2xl font-bold mb-2 text-[#1A1A1A]"
        >
          Reset Password
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter your new password below.
        </p>

        {success ? (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="font-medium mb-1">Password reset successful!</p>
            <p className="text-sm">You&apos;ve been logged in automatically.</p>
            <button
              onClick={handleClose}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition-colors"
              type="button"
            >
              Continue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium mb-2 text-[#1A1A1A]"
              >
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full text-black px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
                required
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium mb-2 text-[#1A1A1A]"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full text-black px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
                required
              />
            </div>

            <p className="text-xs text-gray-500">
              Minimum 8 characters, at least one letter and one number
            </p>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-[#1A1A1A] text-white py-3 rounded font-medium hover:bg-[#333] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
