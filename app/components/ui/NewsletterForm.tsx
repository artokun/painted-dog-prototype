"use client";

import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { PDButton } from "./PDButton";
import { PDInput } from "./PDInput";
import { ThreeLink } from "../ThreeLink";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "usehooks-ts";

interface FormData {
  email: string;
  consent: boolean;
}

export const NewsletterForm = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isMobile = useMediaQuery("(max-width: 1024px)");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

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
        // You could add error state here if needed
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-medium">Thank you!</h3>
        <p>
          You&apos;ve been subscribed to our newsletter and are now in the
          running to win a copy of <i>Bitterkomix</i> Sketchbooks and Journals.
        </p>
        <PDButton onClick={() => setIsSuccess(false)} className="mt-2" primary>
          Subscribe another email
        </PDButton>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <h3 className="text-xl font-medium">Win a copy, be in the know</h3>
      <p className="text-md">
        Receive updates on page-turning developments and future publications in
        our newsletter and stand a chance to win a copy of <i>Bitterkomix</i>{" "}
        Sketchbooks and Journals.
      </p>
      <div className="w-full">
        <PDInput
          label="Email"
          type="email"
          id="email"
          placeholder="Enter email address"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address",
            },
          })}
        />
        {errors.email && (
          <span className="text-red-500 text-sm mt-1 block">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="relative flex flex-col md:flex-row gap-3 mt-3">
        <PDInput
          type="checkbox"
          id="consent"
          {...register("consent", {
            required: "You must agree to the POPI policy to continue",
          })}
        >
          <span className="text-sm">
            By ticking this box, you agree to our POPI policy.{" "}
            <ThreeLink
              href="/legal#privacy-data-collection"
              onClick={(e) => e.stopPropagation()}
              className="underline cursor-pointer"
            >
              Read it here.
            </ThreeLink>
          </span>
          {errors.consent && (
            <span className="text-red-500 text-sm block absolute bottom-0 left-0 translate-y-full">
              {errors.consent.message}
            </span>
          )}
        </PDInput>
        <PDButton
          type="submit"
          primary
          tall={isMobile}
          disabled={isPending}
          className={cn(
            "mt-2",
            isPending && "opacity-50 cursor-not-allowed w-full"
          )}
        >
          {isPending ? "Subscribing..." : "Submit"}
        </PDButton>
      </div>
    </form>
  );
};
