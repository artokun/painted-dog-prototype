import validator from 'validator';
import { fileTypeFromBuffer } from 'file-type';

// Input sanitization and validation utilities
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Allowed file types for submissions
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/rtf',
  'application/rtf'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];

// File size limits (in bytes)
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// Text field limits
const MAX_TEXT_LENGTH = {
  name: 100,
  email: 320, // Max valid email length
  phone: 20,
  message: 5000,
  submissionType: 50
};

export const sanitizeInput = {
  // Sanitize text input - remove dangerous characters but preserve normal text
  text: (input: string): string => {
    if (!input) return '';
    
    // Basic sanitization - remove control characters and normalize whitespace
    let sanitized = input
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return sanitized;
  },

  // Sanitize email - more strict validation
  email: (input: string): string => {
    if (!input) return '';
    return validator.normalizeEmail(input, {
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false
    }) || '';
  },

  // Sanitize HTML for email content (server-side safe)
  html: (input: string): string => {
    if (!input) return '';
    
    // Basic HTML escaping for email content
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
};

export const validateInput = {
  // Validate required text fields
  requiredText: (value: string, fieldName: string, maxLength: number): string => {
    const sanitized = sanitizeInput.text(value);
    
    if (!sanitized) {
      throw new ValidationError(`${fieldName} is required`);
    }
    
    if (sanitized.length > maxLength) {
      throw new ValidationError(`${fieldName} must be less than ${maxLength} characters`);
    }
    
    return sanitized;
  },

  // Validate optional text fields
  optionalText: (value: string, fieldName: string, maxLength: number): string => {
    if (!value) return '';
    
    const sanitized = sanitizeInput.text(value);
    
    if (sanitized.length > maxLength) {
      throw new ValidationError(`${fieldName} must be less than ${maxLength} characters`);
    }
    
    return sanitized;
  },

  // Validate email
  email: (value: string): string => {
    const sanitized = sanitizeInput.email(value);
    
    if (!sanitized) {
      throw new ValidationError('Valid email is required');
    }
    
    if (!validator.isEmail(sanitized)) {
      throw new ValidationError('Please enter a valid email address');
    }
    
    if (sanitized.length > MAX_TEXT_LENGTH.email) {
      throw new ValidationError('Email address is too long');
    }
    
    return sanitized;
  },

  // Validate phone number
  phone: (value: string): string => {
    const sanitized = sanitizeInput.text(value);
    
    if (!sanitized) {
      throw new ValidationError('Phone number is required');
    }
    
    // Basic phone validation - allow various formats
    const phoneRegex = /^[\+]?[\d\s\-\(\)\.]{10,20}$/;
    if (!phoneRegex.test(sanitized)) {
      throw new ValidationError('Please enter a valid phone number');
    }
    
    return sanitized;
  }
};

export const validateFile = {
  // Validate uploaded file
  upload: async (file: File): Promise<{ 
    isValid: boolean; 
    error?: string; 
    sanitizedName?: string;
    size?: number;
  }> => {
    // Check if file exists and has content
    if (!file || file.size === 0) {
      return { isValid: false, error: 'No file uploaded' };
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { 
        isValid: false, 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      };
    }
    
    // Sanitize filename
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9\.\-_]/g, '_') // Replace unsafe chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .substring(0, 255); // Limit filename length
    
    // Check file extension
    const extension = sanitizedName.toLowerCase().substring(sanitizedName.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return { 
        isValid: false, 
        error: `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}` 
      };
    }
    
    try {
      // Check actual file content type (magic number validation)
      const buffer = await file.arrayBuffer();
      const fileType = await fileTypeFromBuffer(buffer);
      
      if (fileType && !ALLOWED_FILE_TYPES.includes(fileType.mime)) {
        return { 
          isValid: false, 
          error: 'File type does not match its content. Please upload a valid document.' 
        };
      }
      
      return { 
        isValid: true, 
        sanitizedName,
        size: file.size
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: 'Unable to validate file. Please try again.' 
      };
    }
  }
};

// reCAPTCHA verification utility
export const verifyRecaptcha = async (token: string): Promise<boolean> => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY is not configured');
    return false;
  }

  if (!token) {
    return false;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
};

// Validation constants for export
export const VALIDATION_LIMITS = MAX_TEXT_LENGTH;