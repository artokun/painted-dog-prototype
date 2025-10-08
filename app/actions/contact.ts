"use server";

import resend from "@/app/lib/resend";
import { validateInput, sanitizeInput, VALIDATION_LIMITS, ValidationError, verifyRecaptcha } from "@/app/lib/validation";

export async function submitContactForm(formData: FormData) {
  try {
    // Verify reCAPTCHA first
    const recaptchaToken = formData.get("recaptchaToken") as string;
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    
    if (!isRecaptchaValid) {
      throw new ValidationError("reCAPTCHA verification failed. Please try again.");
    }

    // Validate and sanitize all inputs
    const firstName = validateInput.requiredText(
      formData.get("firstName") as string, 
      "First name", 
      VALIDATION_LIMITS.name
    );
    const surname = validateInput.requiredText(
      formData.get("surname") as string, 
      "Surname", 
      VALIDATION_LIMITS.name
    );
    const email = validateInput.email(formData.get("email") as string);
    const message = validateInput.optionalText(
      formData.get("message") as string, 
      "Message", 
      VALIDATION_LIMITS.message
    );
    const newsletter = formData.get("newsletter") === "on";
    const consent = formData.get("consent") === "on";

    if (!consent) {
      throw new ValidationError("You must consent to data processing");
    }

    // Send email notification with sanitized content
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@painteddog.press",
      to: process.env.RESEND_TO_EMAIL || "info@painteddog.press",
      subject: `Contact Form Submission from ${firstName} ${surname}`,
      text: `
Name: ${firstName} ${surname}
Email: ${email}
Newsletter: ${newsletter ? "Yes" : "No"}

Message:
${message || "No message provided"}
      `,
      html: `
        <h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> ${sanitizeInput.html(firstName)} ${sanitizeInput.html(surname)}</p>
        <p><strong>Email:</strong> ${sanitizeInput.html(email)}</p>
        <p><strong>Newsletter:</strong> ${newsletter ? "Yes" : "No"}</p>
        <h4>Message:</h4>
        <p>${sanitizeInput.html(message || "No message provided")}</p>
      `,
    });

    // If newsletter is checked, also subscribe them
    if (newsletter) {
      // You could call the newsletter subscription function here
      // await subscribeToNewsletter(formData);
    }

    return { success: true };
  } catch (error) {
    // Handle validation errors specifically
    if (error instanceof ValidationError) {
      throw error;
    }
    
    // Log other errors for debugging but don't expose details
    console.error('Contact form submission error:', error);
    throw new Error('Failed to submit contact form. Please try again.');
  }
}
