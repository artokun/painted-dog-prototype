"use client";

import { useState, useEffect, useRef } from "react";
import { recoverCustomerPassword } from "@/lib/shopify-client";
import { X } from "lucide-react";
import gsap from "gsap";

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ForgotPasswordModal = ({
                                        isOpen,
                                        onClose,
                                    }: ForgotPasswordModalProps) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // GSAP Animation
    useEffect(() => {
        if (!modalRef.current || !overlayRef.current) return;

        if (isOpen) {
            // Fade in overlay
            gsap.to(overlayRef.current, {
                opacity: 1,
                duration: 0.3,
                ease: "power2.out",
            });
            // Scale and fade in modal
            gsap.fromTo(
                modalRef.current,
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, ease: "power3.out" }
            );
        } else {
            // Fade out overlay
            gsap.to(overlayRef.current, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
            });
            // Scale and fade out modal
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
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const result = await recoverCustomerPassword(email);

            if (result.success) {
                setSuccess(true);
                setEmail("");
            } else {
                setError(result.errors?.[0]?.message || "Failed to send recovery email");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail("");
        setError("");
        setSuccess(false);
        onClose();
    };

    // Close modal when clicking backdrop
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
            aria-labelledby="forgot-password-title"
        >
            <div
                ref={modalRef}
                className="relative w-full max-w-md bg-white p-8 rounded-lg shadow-2xl m-4 opacity-0"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close"
                    type="button"
                >
                    <X size={24} />
                </button>

                <h2
                    id="forgot-password-title"
                    className="text-2xl font-bold mb-2 text-[#1A1A1A]"
                >
                    Reset Password
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    Enter your email address and we'll send you a link to reset your
                    password.
                </p>

                {success ? (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        <p className="font-medium mb-1">Email sent!</p>
                        <p className="text-sm">
                            If an account exists with this email, you will receive a password
                            reset link shortly.
                        </p>
                        <button
                            onClick={handleClose}
                            className="mt-4 w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition-colors"
                            type="button"
                        >
                            Close
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
                                htmlFor="recovery-email"
                                className="block text-sm font-medium mb-2 text-[#1A1A1A]"
                            >
                                Email Address
                            </label>
                            <input
                                id="recovery-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full text-black px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent"
                                required
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full bg-[#1A1A1A] text-white py-3 rounded font-medium hover:bg-[#333] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                {!success && (
                    <button
                        onClick={handleClose}
                        type="button"
                        className="w-full mt-4 text-sm text-gray-600 hover:text-[#1A1A1A] transition-colors"
                    >
                        Back to Login
                    </button>
                )}
            </div>
        </div>
    );
};