"use server";

import { redirect } from "next/navigation";
import { sendWelcomeEmail, type NewsletterSubscription } from "@/app/lib/sendgrid";

export async function subscribeToNewsletter(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const email = formData.get("email") as string;
  const consent = formData.get("consent") as string;

  // Log the data
  console.log("Newsletter Subscription:");
  console.log("First Name:", firstName);
  console.log("Email:", email);
  console.log("Consent:", consent === "on" ? "Yes" : "No");

  // Validate required fields
  if (!firstName || !email || !consent) {
    throw new Error("All fields are required");
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address");
  }

  const subscription: NewsletterSubscription = {
    firstName,
    email,
    consent: consent === "on",
  };

  try {
    // Send welcome email via SendGrid
    await sendWelcomeEmail(subscription);

    console.log("✅ Newsletter subscription successful!");

    // TODO: Store subscription in database
    // await saveSubscriptionToDatabase(subscription);

  } catch (error) {
    console.error("❌ Error processing newsletter subscription:", error);
    throw new Error("Failed to process subscription. Please try again.");
  }

  // You can redirect to a thank you page or return success
  // redirect("/thank-you");
}