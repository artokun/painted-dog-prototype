import mail from "@sendgrid/mail";

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  mail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("SENDGRID_API_KEY environment variable is not set");
}

export interface NewsletterSubscription {
  firstName: string;
  email: string;
  consent: boolean;
}

export async function sendWelcomeEmail(subscription: NewsletterSubscription) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SendGrid API key is not configured");
  }

  const msg = {
    to: subscription.email,
    from: process.env.SENDGRID_FROM_EMAIL || "noreply@painteddogpress.com", // Use your verified sender
    subject: "Welcome to Painted Dog Press Newsletter!",
    text: `Hi ${subscription.firstName},\n\nThank you for subscribing to our newsletter! You're now in the running to win a copy of Bitterkomix Sketchbooks and Journals.\n\nWe'll keep you updated on page-turning developments and future publications.\n\nBest regards,\nThe Painted Dog Press Team`,
    html: `
      <h2>Welcome to Painted Dog Press, ${subscription.firstName}!</h2>
      <p>Thank you for subscribing to our newsletter! You're now in the running to win a copy of <strong>Bitterkomix Sketchbooks and Journals</strong>.</p>
      <p>We'll keep you updated on page-turning developments and future publications.</p>
      <br>
      <p>Best regards,<br>The Painted Dog Press Team</p>
    `,
  };

  try {
    await mail.send(msg);
    console.log("✅ Welcome email sent successfully to:", subscription.email);
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    throw error;
  }
}

export default mail;