import { z } from 'zod';

/**
 * Zod schema for the inquiry / contact form submission.
 *
 * Used both on the client (react-hook-form + zodResolver) and on the server
 * (API route re-validation) to ensure a single source of truth.
 */
export const inquirySchema = z.object({
  /** Full name of the person submitting the inquiry (required). */
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(1, 'Full name is required')
    .max(200, 'Full name must be 200 characters or less'),

  /** Optional company / organisation name. */
  companyName: z
    .string()
    .max(200, 'Company name must be 200 characters or less')
    .optional(),

  /** Contact email address (required, must be a valid email format). */
  email: z
    .string({ required_error: 'Email address is required' })
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),

  /** Optional phone number. */
  phone: z
    .string()
    .max(50, 'Phone number must be 50 characters or less')
    .optional(),

  /** Country of origin (required). */
  country: z
    .string({ required_error: 'Country is required' })
    .min(1, 'Country is required')
    .max(100, 'Country must be 100 characters or less'),

  /** Product name or category of interest (required). */
  productOfInterest: z
    .string({ required_error: 'Product of interest is required' })
    .min(1, 'Product of interest is required')
    .max(300, 'Product of interest must be 300 characters or less'),

  /** Free-text message describing the inquiry (required, max 2 000 chars). */
  message: z
    .string({ required_error: 'Message is required' })
    .min(1, 'Message is required')
    .max(2000, 'Message must be 2000 characters or less'),
});

/** Inferred TypeScript type for the validated inquiry form data. */
export type InquiryFormData = z.infer<typeof inquirySchema>;
