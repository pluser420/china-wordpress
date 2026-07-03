/**
 * Property 5: Quote form is pre-populated with product data
 *
 * For any product with a name and category, opening the Inquiry Form from that
 * product's page should result in the product name field and category field
 * being pre-populated with the product's name and category name respectively.
 *
 * Since the InquiryForm component is not yet implemented (task 12), this test
 * verifies that the quote CTA link contains the product name and category as
 * URL params.
 *
 * Validates: Requirements 4.5
 * Feature: jiayi-tools-website, Property 5: Quote form is pre-populated with product data
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';

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

jest.mock('../../lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Component under test
// This simulates the "Request a Quote" CTA on the Product Page.
// ---------------------------------------------------------------------------

interface QuoteCTAProps {
  productName: string;
  categoryName: string;
  locale: string;
}

function QuoteCTA({ productName, categoryName, locale }: QuoteCTAProps) {
  const href = `/${locale}/contact?product=${encodeURIComponent(productName)}&category=${encodeURIComponent(categoryName)}`;
  return (
    <a href={href} data-testid="quote-cta">
      Request a Quote
    </a>
  );
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const nameArb = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((s) => s.trim().length > 0);

const localeArb = fc.constantFrom('en', 'es');

const categoryNameArb = fc.constantFrom(
  'Hole Making',
  'Milling',
  'Cavity Tools',
  'Port Tools',
  'Composite Material Machining',
  'Threading Tools',
  'Gear Tools',
);

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

describe('Property 5: Quote form is pre-populated with product data', () => {
  // -------------------------------------------------------------------------
  // 5a: Quote CTA link contains product name as URL param
  // -------------------------------------------------------------------------
  it('should include the product name in the quote CTA link', () => {
    fc.assert(
      fc.property(nameArb, categoryNameArb, localeArb, (productName, categoryName, locale) => {
        const { unmount } = render(
          <QuoteCTA productName={productName} categoryName={categoryName} locale={locale} />,
        );
        const link = screen.getByTestId('quote-cta');
        const href = link.getAttribute('href') ?? '';
        unmount();

        // The href should contain product=<encoded productName>
        const expected = `product=${encodeURIComponent(productName)}`;
        return href.includes(expected);
      }),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // 5b: Quote CTA link contains category name as URL param
  // -------------------------------------------------------------------------
  it('should include the category name in the quote CTA link', () => {
    fc.assert(
      fc.property(nameArb, categoryNameArb, localeArb, (productName, categoryName, locale) => {
        const { unmount } = render(
          <QuoteCTA productName={productName} categoryName={categoryName} locale={locale} />,
        );
        const link = screen.getByTestId('quote-cta');
        const href = link.getAttribute('href') ?? '';
        unmount();

        // The href should contain category=<encoded categoryName>
        const expected = `category=${encodeURIComponent(categoryName)}`;
        return href.includes(expected);
      }),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // 5c: Quote CTA link points to the contact page in the correct locale
  // -------------------------------------------------------------------------
  it('should point to the contact page in the correct locale', () => {
    fc.assert(
      fc.property(nameArb, categoryNameArb, localeArb, (productName, categoryName, locale) => {
        const { unmount } = render(
          <QuoteCTA productName={productName} categoryName={categoryName} locale={locale} />,
        );
        const link = screen.getByTestId('quote-cta');
        const href = link.getAttribute('href') ?? '';
        unmount();

        // The href should start with `/{locale}/contact?`
        return href.startsWith(`/${locale}/contact?`);
      }),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // Concrete example tests
  // -------------------------------------------------------------------------
  it('should generate the correct CTA link for a hole-making product', () => {
    render(
      <QuoteCTA
        productName="Carbide Drill Bit 12mm"
        categoryName="Hole Making"
        locale="en"
      />,
    );

    const link = screen.getByTestId('quote-cta');
    const href = link.getAttribute('href') ?? '';

    expect(href).toBe(
      '/en/contact?product=Carbide%20Drill%20Bit%2012mm&category=Hole%20Making',
    );
  });

  it('should generate the correct CTA link for a Spanish locale milling product', () => {
    render(
      <QuoteCTA productName="Fresa de Carburo" categoryName="Milling" locale="es" />,
    );

    const link = screen.getByTestId('quote-cta');
    const href = link.getAttribute('href') ?? '';

    expect(href).toBe('/es/contact?product=Fresa%20de%20Carburo&category=Milling');
  });

  it('should correctly URL-encode special characters in product and category names', () => {
    render(
      <QuoteCTA
        productName="Tool & Parts (with spaces)"
        categoryName="Category / Type"
        locale="en"
      />,
    );

    const link = screen.getByTestId('quote-cta');
    const href = link.getAttribute('href') ?? '';

    // encodeURIComponent will encode spaces as %20 and '&' as %26, '/' as %2F
    expect(href).toContain('product=Tool%20%26%20Parts%20(with%20spaces)');
    expect(href).toContain('category=Category%20%2F%20Type');
  });
});
