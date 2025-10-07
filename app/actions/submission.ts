"use server";

import resend from "@/app/lib/resend";
import { validateInput, validateFile, sanitizeInput, VALIDATION_LIMITS, ValidationError } from "@/app/lib/validation";

export async function submitSubmissionForm(formData: FormData) {
  try {
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
    const phone = validateInput.phone(formData.get("phone") as string);
    const submissionType = validateInput.requiredText(
      formData.get("submissionType") as string, 
      "Submission type", 
      VALIDATION_LIMITS.submissionType
    );
    const submittedElsewhere = validateInput.optionalText(
      formData.get("submittedToAnotherPublisher") as string, 
      "Previously submitted", 
      200
    );
    const newsletter = formData.get("newsletter") === "on";
    const consent = formData.get("consent") === "on";

    if (!consent) {
      throw new ValidationError("You must consent to data processing");
    }

    // Handle and validate file attachment
    const file = formData.get("file") as File;
    let fileInfo = "No file attached";
    let attachments: any[] = [];

    if (file && file.size > 0) {
      // Validate the uploaded file
      const fileValidation = await validateFile.upload(file);
      
      if (!fileValidation.isValid) {
        throw new ValidationError(fileValidation.error || "Invalid file");
      }
      
      fileInfo = `File: ${fileValidation.sanitizedName} (${(fileValidation.size! / 1024 / 1024).toFixed(2)} MB)`;
      
      // Convert file to buffer for email attachment
      const fileBuffer = await file.arrayBuffer();
      
      attachments.push({
        filename: fileValidation.sanitizedName,
        content: Buffer.from(fileBuffer),
      });
    }

    // Send email notification with attachment and sanitized content
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@painteddogpress.com",
      to: process.env.RESEND_TO_EMAIL || "submissions@painteddogpress.com",
      subject: `${submissionType} Submission from ${firstName} ${surname}`,
      text: `
New Submission Received

Name: ${firstName} ${surname}
Email: ${email}
Phone: ${phone}
Submission Type: ${submissionType}
Submitted Elsewhere: ${submittedElsewhere || "Not specified"}
Newsletter: ${newsletter ? "Yes" : "No"}

${fileInfo}
      `,
      html: `
        <h3>New Submission Received</h3>
        <p><strong>Name:</strong> ${sanitizeInput.html(firstName)} ${sanitizeInput.html(surname)}</p>
        <p><strong>Email:</strong> ${sanitizeInput.html(email)}</p>
        <p><strong>Phone:</strong> ${sanitizeInput.html(phone)}</p>
        <p><strong>Submission Type:</strong> ${sanitizeInput.html(submissionType)}</p>
        <p><strong>Submitted Elsewhere:</strong> ${sanitizeInput.html(submittedElsewhere || "Not specified")}</p>
        <p><strong>Newsletter:</strong> ${newsletter ? "Yes" : "No"}</p>
        <p><strong>Attachment:</strong> ${sanitizeInput.html(fileInfo)}</p>
      `,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    return { success: true };
  } catch (error) {
    // Handle validation errors specifically
    if (error instanceof ValidationError) {
      throw error;
    }
    
    // Log other errors for debugging but don't expose details
    console.error('Submission form error:', error);
    throw new Error('Failed to submit form. Please try again.');
  }
}