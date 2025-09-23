"use client";

import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { PDButton } from "./PDButton";
import { PDInput } from "./PDInput";
import { ThreeLink } from "../ThreeLink";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { cn } from "@/lib/utils";

interface FormData {
  firstName: string;
  email: string;
  consent: boolean;
}

export const NewsletterForm = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        formData.append("firstName", data.firstName);
        formData.append("email", data.email);
        formData.append("consent", data.consent ? "on" : "");

        await subscribeToNewsletter(formData);
        setIsSuccess(true);
        reset();
      } catch (error) {
        console.error("Form submission error:", error);
        // You could add error state here if needed
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-3 text-center p-6 bg-green-50 border border-green-200 rounded-sm">
        <div className="text-green-600 text-2xl">✓</div>
        <h3 className="text-xl font-medium text-green-800">Thank you!</h3>
        <p className="text-green-700">
          You&apos;ve been subscribed to our newsletter and are now in the running to
          win a copy of Bitterkomix Sketchbooks and Journals.
        </p>
        <PDButton
          onClick={() => setIsSuccess(false)}
          className="mt-2 border-green-600 text-green-600 hover:bg-green-50"
        >
          Subscribe another email
        </PDButton>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full">
        <PDInput
          label="First Name"
          type="text"
          id="firstName"
          placeholder="Enter first name"
          {...register("firstName", {
            required: "First name is required",
            minLength: {
              value: 2,
              message: "First name must be at least 2 characters",
            },
          })}
        />
        {errors.firstName && (
          <span className="text-red-500 text-sm mt-1 block">
            {errors.firstName.message}
          </span>
        )}
      </div>

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

      <div className="relative flex gap-3 mt-3">
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
              href="/legal"
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
          disabled={isPending}
          className={cn("mt-2", isPending && "opacity-50 cursor-not-allowed")}
        >
          {isPending ? "Subscribing..." : "Submit"}
        </PDButton>
      </div>
    </form>
  );
};
