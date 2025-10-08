"use server";

interface SubscriptionResponse {
  success: boolean;
  message?: string;
  redirectUrl?: string;
}

export async function subscribeToNewsletter(formData: FormData): Promise<SubscriptionResponse> {
  const email = formData.get("email") as string;
  const consent = formData.get("consent") as string;
  const substackUrl = process.env.SUBSTACK_NEWSLETTER_URL;

  // Log the data for analytics/debugging
  console.log("Newsletter Subscription Request:");
  console.log("Email:", email);
  console.log("Consent:", consent === "on" ? "Yes" : "No");
  console.log("Timestamp:", new Date().toISOString());

  // Validate required fields
  if (!email || !consent) {
    throw new Error("All fields are required");
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address");
  }

  if (!substackUrl) {
    throw new Error("Substack URL is not configured");
  }

  // Create a pre-filled subscription URL
  const subscriptionUrl = `${substackUrl}/subscribe?utm_source=painted_dog_website&utm_medium=newsletter_form&email=${encodeURIComponent(email)}`;
  
  console.log("Generated subscription URL:", subscriptionUrl);
  
  // Store the attempted subscription for analytics if needed
  // You could also send this to your analytics service here
  
  // Return the URL so client can open it in new window
  return {
    success: true,
    message: "Opening subscription form in new window",
    redirectUrl: subscriptionUrl
  };
}