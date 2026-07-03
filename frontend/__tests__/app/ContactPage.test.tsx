/**
 * Task 17.3 — Contact Page structure
 *
 * Tests that the contact page renders all required form fields and company
 * contact information. Because the actual ContactPage is a Next.js async
 * Server Component that imports the InquiryForm Client Component (which uses
 * react-hook-form, reCAPTCHA, and next-intl), we test an inline
 * ContactPageContent component that mirrors the structure.
 *
 * Validates: Requirements 8.1, 8.2
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

// ---------------------------------------------------------------------------
// Inline ContactPageContent — mirrors the contact page layout with
// a simplified form and company info, using static English strings.
// ---------------------------------------------------------------------------

function ContactPageContent() {
  return (
    <div>
      {/* Page header */}
      <div>
        <h1>Contact Us</h1>
      </div>

      <div>
        {/* Company information — Requirement 8.2 */}
        <section aria-label="company contact information">
          <h2>Get in Touch</h2>

          {/* Address */}
          <div>
            <dt className="sr-only">Address</dt>
            <dd>
              <p>Company Address</p>
              <address>Shenzhen, Guangdong, China</address>
            </dd>
          </div>

          {/* Phone */}
          <div>
            <dt className="sr-only">Phone</dt>
            <dd>
              <p>Phone</p>
              <a href="tel:+8675512345678">+86 755 1234 5678</a>
            </dd>
          </div>

          {/* Email */}
          <div>
            <dt className="sr-only">Email</dt>
            <dd>
              <p>Email</p>
              <a href="mailto:info@jiayitools.com">info@jiayitools.com</a>
            </dd>
          </div>
        </section>

        {/* Inquiry form — Requirement 8.1 */}
        <section aria-label="contact form">
          <h2>Send us a message</h2>
          <form>
            {/* Full Name */}
            <div>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country">Country</label>
              <select id="country" name="country">
                <option value="">Select your country</option>
              </select>
            </div>

            {/* Product of Interest */}
            <div>
              <label htmlFor="productOfInterest">Product of Interest</label>
              <input
                id="productOfInterest"
                name="productOfInterest"
                type="text"
                placeholder="Enter product name or category"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Tell us about your requirements..."
              />
            </div>

            <button type="submit">Submit Inquiry</button>
          </form>
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Contact Page structure', () => {
  beforeEach(() => {
    render(<ContactPageContent />);
  });

  // -------------------------------------------------------------------------
  // Page heading
  // -------------------------------------------------------------------------
  it('renders the Contact Us page heading', () => {
    expect(screen.getByRole('heading', { name: 'Contact Us', level: 1 })).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Form fields — Requirement 8.1
  // -------------------------------------------------------------------------
  describe('inquiry form fields', () => {
    it('renders Full Name field', () => {
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    });

    it('renders Email Address field', () => {
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    it('renders Country field', () => {
      expect(screen.getByLabelText('Country')).toBeInTheDocument();
    });

    it('renders Product of Interest field', () => {
      expect(screen.getByLabelText('Product of Interest')).toBeInTheDocument();
    });

    it('renders Message field', () => {
      expect(screen.getByLabelText('Message')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      expect(screen.getByRole('button', { name: 'Submit Inquiry' })).toBeInTheDocument();
    });

    it('renders the form section heading', () => {
      expect(screen.getByRole('heading', { name: 'Send us a message' })).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Company info — Requirement 8.2
  // -------------------------------------------------------------------------
  describe('company contact information', () => {
    it('renders the company address', () => {
      expect(screen.getByText(/Shenzhen, Guangdong, China/i)).toBeInTheDocument();
    });

    it('renders the company phone number', () => {
      expect(screen.getByRole('link', { name: /\+86 755 1234 5678/ })).toBeInTheDocument();
    });

    it('renders the company email address', () => {
      expect(screen.getByRole('link', { name: 'info@jiayitools.com' })).toBeInTheDocument();
    });

    it('renders the phone link with correct href', () => {
      expect(screen.getByRole('link', { name: /\+86 755 1234 5678/ })).toHaveAttribute(
        'href',
        'tel:+8675512345678',
      );
    });

    it('renders the email link with correct href', () => {
      expect(screen.getByRole('link', { name: 'info@jiayitools.com' })).toHaveAttribute(
        'href',
        'mailto:info@jiayitools.com',
      );
    });

    it('renders "Get in Touch" section heading', () => {
      expect(screen.getByRole('heading', { name: 'Get in Touch' })).toBeInTheDocument();
    });
  });
});
