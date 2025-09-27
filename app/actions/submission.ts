"use server";

import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function submitSubmissionForm(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const surname = formData.get("surname") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const submissionType = formData.get("submissionType") as string;
  const submittedElsewhere = formData.get("submittedToAnotherPublisher") as string;
  const newsletter = formData.get("newsletter") === "on";
  const consent = formData.get("consent") === "on";

  if (!firstName || !surname || !email || !phone || !submissionType || !consent) {
    throw new Error("Missing required fields");
  }

  // Handle file upload (you'd want to save this to a storage service)
  const file = formData.get("file") as File;
  let fileInfo = "No file attached";

  if (file && file.size > 0) {
    fileInfo = `File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    // TODO: Upload file to storage service and get URL
  }

  // Send email notification
  const msg = {
    to: "submissions@painteddogpress.com",
    from: "noreply@painteddogpress.com",
    subject: `${submissionType} Submission from ${firstName} ${surname}`,
    text: `
New Submission Received

Name: ${firstName} ${surname}
Email: ${email}
Phone: ${phone}
Submission Type: ${submissionType}
Submitted Elsewhere: ${submittedElsewhere}
Newsletter: ${newsletter ? "Yes" : "No"}

${fileInfo}
    `,
    html: `
      <h3>New Submission Received</h3>
      <p><strong>Name:</strong> ${firstName} ${surname}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Submission Type:</strong> ${submissionType}</p>
      <p><strong>Submitted Elsewhere:</strong> ${submittedElsewhere}</p>
      <p><strong>Newsletter:</strong> ${newsletter ? "Yes" : "No"}</p>
      <p>${fileInfo}</p>
    `,
  };

  await sgMail.send(msg);

  return { success: true };
}