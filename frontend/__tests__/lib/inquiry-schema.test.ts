/**
 * Property 18: Form validation rejects any incomplete or malformed submission
 *
 * For any inquiry form submission object where at least one required field
 * (full name, email, country, product of interest, or message) is missing or
 * empty, the Zod validation schema should return a failure result identifying
 * the specific missing field(s).
 *
 * For any value in the email field that does not match a valid email pattern,
 * the schema should return a failure result specifically on the email field.
 *
 * Valid complete submissions should pass validation.
 *
 * Validates: Requirements 8.5, 8.6
 * Feature: jiayi-tools-website, Property 18: Form validation rejects any incomplete or malformed submission
 */

import * as fc from 'fast-check';
import { inquirySchema } from '../../lib/inquiry-schema';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Non-empty string up to 200 chars */
const nonEmptyStringArb = (maxLength = 200) =>
  fc
    .string({ minLength: 1, maxLength })
    .filter((s) => s.trim().length > 0);

/** Valid email address (checked against Zod's email validation) */
const validEmailArb = fc
  .emailAddress()
  .filter((e) => {
    // Filter to emails that Zod also accepts (Zod is stricter than RFC 5322)
    return e.length <= 200 && inquirySchema.shape.email.safeParse(e).success;
  });

/** Strings that do NOT look like valid emails */
const invalidEmailArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter(
    (s) =>
      s.trim().length > 0 &&
      !s.includes('@') && // guaranteed not to be a valid email
      !s.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  );

/** A complete, valid inquiry form object */
const validInquiryArb = fc.record({
  fullName: nonEmptyStringArb(200),
  companyName: fc.option(nonEmptyStringArb(200), { nil: undefined }),
  email: validEmailArb,
  phone: fc.option(nonEmptyStringArb(50), { nil: undefined }),
  country: nonEmptyStringArb(100),
  productOfInterest: nonEmptyStringArb(300),
  message: nonEmptyStringArb(2000),
});

// ---------------------------------------------------------------------------
// Property 18a: Valid complete submissions pass validation
// ---------------------------------------------------------------------------

describe('Property 18: Form validation rejects incomplete or malformed submissions', () => {
  describe('18a: Valid complete submissions pass', () => {
    it('should pass validation for any complete, valid submission', () => {
      fc.assert(
        fc.property(validInquiryArb, (data) => {
          const result = inquirySchema.safeParse(data);
          return result.success === true;
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Property 18b: Missing required fields fail validation
  // -------------------------------------------------------------------------
  describe('18b: Missing required fields fail validation', () => {
    it('should fail when fullName is empty', () => {
      fc.assert(
        fc.property(
          validEmailArb,
          nonEmptyStringArb(100),
          nonEmptyStringArb(300),
          nonEmptyStringArb(2000),
          (email, country, productOfInterest, message) => {
            const result = inquirySchema.safeParse({
              fullName: '',
              email,
              country,
              productOfInterest,
              message,
            });
            if (result.success) return false;
            const errors = result.error.flatten().fieldErrors;
            return Array.isArray(errors.fullName) && errors.fullName.length > 0;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should fail when email is empty', () => {
      fc.assert(
        fc.property(
          nonEmptyStringArb(200),
          nonEmptyStringArb(100),
          nonEmptyStringArb(300),
          nonEmptyStringArb(2000),
          (fullName, country, productOfInterest, message) => {
            const result = inquirySchema.safeParse({
              fullName,
              email: '',
              country,
              productOfInterest,
              message,
            });
            if (result.success) return false;
            const errors = result.error.flatten().fieldErrors;
            return Array.isArray(errors.email) && errors.email.length > 0;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should fail when country is empty', () => {
      fc.assert(
        fc.property(
          nonEmptyStringArb(200),
          validEmailArb,
          nonEmptyStringArb(300),
          nonEmptyStringArb(2000),
          (fullName, email, productOfInterest, message) => {
            const result = inquirySchema.safeParse({
              fullName,
              email,
              country: '',
              productOfInterest,
              message,
            });
            if (result.success) return false;
            const errors = result.error.flatten().fieldErrors;
            return Array.isArray(errors.country) && errors.country.length > 0;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should fail when productOfInterest is empty', () => {
      fc.assert(
        fc.property(
          nonEmptyStringArb(200),
          validEmailArb,
          nonEmptyStringArb(100),
          nonEmptyStringArb(2000),
          (fullName, email, country, message) => {
            const result = inquirySchema.safeParse({
              fullName,
              email,
              country,
              productOfInterest: '',
              message,
            });
            if (result.success) return false;
            const errors = result.error.flatten().fieldErrors;
            return (
              Array.isArray(errors.productOfInterest) &&
              errors.productOfInterest.length > 0
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should fail when message is empty', () => {
      fc.assert(
        fc.property(
          nonEmptyStringArb(200),
          validEmailArb,
          nonEmptyStringArb(100),
          nonEmptyStringArb(300),
          (fullName, email, country, productOfInterest) => {
            const result = inquirySchema.safeParse({
              fullName,
              email,
              country,
              productOfInterest,
              message: '',
            });
            if (result.success) return false;
            const errors = result.error.flatten().fieldErrors;
            return Array.isArray(errors.message) && errors.message.length > 0;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Property 18c: Invalid email format fails validation on email field
  // -------------------------------------------------------------------------
  describe('18c: Invalid email format fails on email field', () => {
    it('should fail validation when email lacks @', () => {
      fc.assert(
        fc.property(
          nonEmptyStringArb(200),
          invalidEmailArb,
          nonEmptyStringArb(100),
          nonEmptyStringArb(300),
          nonEmptyStringArb(2000),
          (fullName, email, country, productOfInterest, message) => {
            const result = inquirySchema.safeParse({
              fullName,
              email,
              country,
              productOfInterest,
              message,
            });
            if (result.success) return false;
            const errors = result.error.flatten().fieldErrors;
            return Array.isArray(errors.email) && errors.email.length > 0;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Property 18d: Message exceeding 2000 chars fails validation
  // -------------------------------------------------------------------------
  describe('18d: Message max length is enforced', () => {
    it('should fail when message exceeds 2000 characters', () => {
      fc.assert(
        fc.property(
          nonEmptyStringArb(200),
          validEmailArb,
          nonEmptyStringArb(100),
          nonEmptyStringArb(300),
          fc.string({ minLength: 2001, maxLength: 2500 }),
          (fullName, email, country, productOfInterest, message) => {
            const result = inquirySchema.safeParse({
              fullName,
              email,
              country,
              productOfInterest,
              message,
            });
            if (result.success) return false;
            const errors = result.error.flatten().fieldErrors;
            return Array.isArray(errors.message) && errors.message.length > 0;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Concrete example tests
  // -------------------------------------------------------------------------
  describe('Concrete examples', () => {
    it('should pass for a fully valid submission', () => {
      const result = inquirySchema.safeParse({
        fullName: 'John Smith',
        companyName: 'Acme Corp',
        email: 'john@acme.com',
        phone: '+1 555 0100',
        country: 'United States',
        productOfInterest: 'Carbide Drill Bit 12mm',
        message: 'We need 500 units of drill bits for aerospace applications.',
      });
      expect(result.success).toBe(true);
    });

    it('should pass without optional fields', () => {
      const result = inquirySchema.safeParse({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        country: 'Germany',
        productOfInterest: 'Milling Cutter',
        message: 'Please send a quote.',
      });
      expect(result.success).toBe(true);
    });

    it('should fail when fullName is missing', () => {
      const result = inquirySchema.safeParse({
        email: 'jane@example.com',
        country: 'Germany',
        productOfInterest: 'Milling Cutter',
        message: 'Please send a quote.',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.fullName).toBeDefined();
      }
    });

    it('should fail for invalid email format', () => {
      const result = inquirySchema.safeParse({
        fullName: 'Test User',
        email: 'not-an-email',
        country: 'France',
        productOfInterest: 'Thread Tap',
        message: 'Need threading tools.',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeDefined();
      }
    });

    it('should fail when message exceeds 2000 characters', () => {
      const result = inquirySchema.safeParse({
        fullName: 'Test User',
        email: 'test@example.com',
        country: 'Japan',
        productOfInterest: 'Gear Hob',
        message: 'a'.repeat(2001),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.message).toBeDefined();
      }
    });

    it('should pass when message is exactly 2000 characters', () => {
      const result = inquirySchema.safeParse({
        fullName: 'Test User',
        email: 'test@example.com',
        country: 'Japan',
        productOfInterest: 'Gear Hob',
        message: 'a'.repeat(2000),
      });
      expect(result.success).toBe(true);
    });
  });
});
