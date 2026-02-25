"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { X } from "lucide-react";
import gsap from "gsap";
import { PDButton } from "./ui/PDButton";
import { PDInput } from "./ui/PDInput";
import { ThreeLink } from "./ThreeLink";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "usehooks-ts";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  email: string;
  consent: boolean;
}

export const NewsletterModal = ({
  isOpen,
  onClose,
}: NewsletterModalProps) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mounted, setMounted] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  // GSAP Animation - slide in from right
  useEffect(() => {
    if (!modalRef.current || !overlayRef.current) return;

    if (isOpen) {
      // Scroll to top when modal opens
      window.scrollTo(0, 0);
      
      // Fade in overlay
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      // Slide in modal from right
      gsap.fromTo(
        modalRef.current,
        { x: "100%", opacity: 1 },
        { x: "0%", duration: 0.4, ease: "power3.out" }
      );
    } else {
      // Fade out overlay
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
      // Slide out modal to right
      gsap.to(modalRef.current, {
        x: "100%",
        duration: 0.3,
        ease: "power3.in",
      });
    }
  }, [isOpen]);

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("consent", data.consent ? "on" : "");

        const response = await subscribeToNewsletter(formData);
        
        if (response.success && response.redirectUrl) {
          // Open Substack subscription in new window
          window.open(response.redirectUrl, '_blank', 'noopener,noreferrer');
          setIsSuccess(true);
          reset();
        }
      } catch (error) {
        console.error("Form submission error:", error);
      }
    });
  };

  const handleClose = () => {
    reset();
    setIsSuccess(false);
    onClose();
  };

  // Close modal when clicking backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-end bg-black/50 backdrop-blur-sm pointer-events-auto opacity-0"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full md:w-[30%] h-full bg-white p-6 md:p-10 shadow-2xl overflow-y-auto flex flex-col"
        style={{ transform: "translateX(100%)" }}
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

        {isSuccess ? (
          <div className="flex flex-col h-full justify-between">
            <div>
              <h3
                id="newsletter-modal-title"
                className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mt-8 mb-6"
              >
                Welcome aboard
              </h3>
              <p className="text-base leading-relaxed text-gray-700">
                You&apos;re now subscribed to the Painted Dog Press newsletter.
                Check your inbox for a confirmation email.
              </p>
            </div>
            <div className="flex flex-col gap-4 mb-8">
              <PDButton onClick={handleClose} primary>
                Close
              </PDButton>
            </div>
          </div>
        ) : (
          <form className="flex flex-col h-full justify-between" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <h3
                id="newsletter-modal-title"
                className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mt-8 mb-6"
              >
                Join the painted dog newsletter
              </h3>
              <div className="space-y-4 mb-6">
                <p className="text-base leading-relaxed text-gray-700">
                  We share early release information, early access to launch
                  parties, books we&apos;re reading, insights into the world of
                  publishing, and events in the international and local literary
                  scenes. Not to be missed.
                </p>
                <p className="text-base leading-relaxed text-gray-700">
                  Get a taste of the most recent newsletter, and subscribe by entering your details below:
                </p>
              </div>
              <div className="w-full space-y-2">
                <label className="flex gap-1 items-center border-b border-black/20 pb-2">
                  <span className="text-base text-[#1A1A1A]">Email</span>
                  <input
                    type="email"
                    id="newsletter-email"
                    placeholder="Enter email here"
                    className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-right text-right placeholder:text-[#1A1A1A] placeholder:opacity-40"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address",
                      },
                    })}
                  />
                </label>
                {errors.email && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.email.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-6 mb-8">
              <PDInput
                type="checkbox"
                id="newsletter-consent"
                {...register("consent", {
                  required: "You must agree to our privacy policy to continue",
                })}
              >
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <ThreeLink
                    href="/legal#privacy-data-collection"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                    className="underline cursor-pointer text-[#1A1A1A]"
                  >
                    privacy policy
                  </ThreeLink>
                </span>
              </PDInput>
              {errors.consent && (
                <span className="text-red-500 text-sm block -mt-4">
                  {errors.consent.message}
                </span>
              )}
              <PDButton
                type="submit"
                primary
                disabled={isPending}
                className={cn(
                  "w-full",
                  isPending && "opacity-50 cursor-not-allowed"
                )}
              >
                {isPending ? "Subscribing..." : "Subscribe"}
              </PDButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
