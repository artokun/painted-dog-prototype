"use server";

import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function submitContactForm(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const surname = formData.get("surname") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;
  const newsletter = formData.get("newsletter") === "on";
  const consent = formData.get("consent") === "on";

  if (!firstName || !surname || !email || !consent) {
    throw new Error("Missing required fields");
  }

  // Send email notification
  const msg = {
    to: "info@painteddogpress.com",
    from: "noreply@painteddogpress.com", // Must be verified sender in SendGrid
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
      <p><strong>Name:</strong> ${firstName} ${surname}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Newsletter:</strong> ${newsletter ? "Yes" : "No"}</p>
      <h4>Message:</h4>
      <p>${message || "No message provided"}</p>
    `,
  };

  await sgMail.send(msg);

  // If newsletter is checked, also subscribe them
  if (newsletter) {
    // You could call the newsletter subscription function here
    // await subscribeToNewsletter(formData);
  }

  return { success: true };
}