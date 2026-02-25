interface SubscriptionResponse {
  success: boolean;
  message?: string;
  redirectUrl?: string;
  openInNewWindow?: boolean;
}

/**
 * Handles newsletter subscription response consistently across the app
 * Opens URL in new window if specified, otherwise redirects in same window
 */
export function handleNewsletterResponse(response: SubscriptionResponse): void {
  if (!response.success || !response.redirectUrl) {
    console.error("Newsletter subscription failed:", response.message);
    return;
  }

  if (response.openInNewWindow) {
    // Open in new window/tab
    window.open(response.redirectUrl, '_blank', 'noopener,noreferrer');
  } else {
    // Redirect in same window
    window.location.href = response.redirectUrl;
  }
}

/**
 * Wrapper function for newsletter subscription that automatically handles the response
 */
export async function subscribeAndOpenNewsletter(
  subscribeFunction: (formData: FormData) => Promise<SubscriptionResponse>,
  formData: FormData
): Promise<boolean> {
  try {
    const response = await subscribeFunction(formData);
    handleNewsletterResponse(response);
    return response.success;
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return false;
  }
}