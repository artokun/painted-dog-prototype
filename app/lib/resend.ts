import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export interface NewsletterSubscription {
  firstName: string;
  email: string;
  consent: boolean;
}

export async function sendWelcomeEmail(subscription: NewsletterSubscription) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Resend API key is not configured");
  }

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@painteddogpress.com",
      to: subscription.email,
      subject: "Welcome to Painted Dog Press Newsletter!",
      text: `Hi ${subscription.firstName},\n\nThank you for subscribing to our newsletter! You're now in the running to win a copy of Bitterkomix Sketchbooks and Journals.\n\nWe'll keep you updated on page-turning developments and future publications.\n\nBest regards,\nThe Painted Dog Press Team`,
      html: `
        <h2>Welcome to Painted Dog Press, ${subscription.firstName}!</h2>
        <p>Thank you for subscribing to our newsletter! You're now in the running to win a copy of <strong>Bitterkomix Sketchbooks and Journals</strong>.</p>
        <p>We'll keep you updated on page-turning developments and future publications.</p>
        <br>
        <p>Best regards,<br>The Painted Dog Press Team</p>
      `,
    });

    console.log("✅ Welcome email sent successfully to:", subscription.email);
    return data;
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    throw error;
  }
}

export default resend;