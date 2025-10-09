"use server";

interface SubscriptionResponse {
  success: boolean;
  message?: string;
  redirectUrl?: string;
  openInNewWindow?: boolean;
}

export async function subscribeToNewsletter(formData: FormData): Promise<SubscriptionResponse> {
  const email = formData.get("email") as string;
  const consent = formData.get("consent") as string;
  const substackUrl = process.env.SUBSTACK_NEWSLETTER_URL;

  // Validate required fields
  if (!email) {
    throw new Error("Email is required");
  }

  // For forms that don't have separate consent field, we assume consent was given if they checked newsletter
  if (consent !== null && !consent) {
    throw new Error("Consent is required");
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
    redirectUrl: subscriptionUrl,
    openInNewWindow: true
  };
}

// Helper function to create newsletter subscription with just email
export async function subscribeToNewsletterWithEmail(email: string): Promise<SubscriptionResponse> {
  const formData = new FormData();
  formData.append("email", email);
  return subscribeToNewsletter(formData);
}