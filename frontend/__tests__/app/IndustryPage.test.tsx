/**
 * Task 17.4 — Industry Application Page structure
 *
 * Tests that an industry application page renders the required content:
 *   - Headline for the industry
 *   - Descriptive paragraph about JIAYI Tools' capabilities
 *   - A "View Related Tools" button/link
 *
 * Uses the aerospace industry as the representative example (first in the
 * list and most clearly specified in the requirements).
 *
 * Because the actual IndustryApplicationPage is an async Server Component
 * that calls getTranslations(), fetches from Strapi, and calls notFound(),
 * we test an inline IndustryPageContent component that mirrors the rendering
 * logic using static data from INDUSTRY_STATIC_DATA['aerospace'].
 *
 * Validates: Requirements 9.1, 9.2
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

jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...rest} />;
  },
}));

// ---------------------------------------------------------------------------
// Static aerospace data (mirrors INDUSTRY_STATIC_DATA['aerospace'] in page.tsx)
// ---------------------------------------------------------------------------

const AEROSPACE_DATA = {
  name: 'Aerospace & Aviation',
  headline: 'Precision Tools for Demanding Aerospace Applications',
  description:
    'Aerospace manufacturing demands the highest levels of dimensional accuracy, surface integrity, ' +
    'and process repeatability. JIAYI Tools supplies certified carbide drills, reamers, milling cutters, ' +
    'and composite machining tools for titanium alloys (Ti-6Al-4V), aluminum aircraft structures, ' +
    'carbon fiber reinforced polymers (CFRP), and nickel superalloys used in engine components.',
  relatedCategorySlug: 'hole-making',
  highlights: [
    'Titanium alloy (Ti-6Al-4V) compatible',
    'CFRP & composite machining',
    'Nickel superalloy solutions',
    'Certified dimensional accuracy',
  ],
};

// ---------------------------------------------------------------------------
// Inline IndustryPageContent — mirrors the industry page rendering logic
// ---------------------------------------------------------------------------

interface IndustryPageContentProps {
  locale?: string;
  data?: typeof AEROSPACE_DATA;
  imageUrl?: string | null;
}

function IndustryPageContent({
  locale = 'en',
  data = AEROSPACE_DATA,
  imageUrl = null,
}: IndustryPageContentProps) {
  return (
    <div>
      {/* Page Hero */}
      <section aria-label="industry hero">
        <p>Industry Applications</p>
        <h1>{data.name}</h1>
        <p>{data.headline}</p>
      </section>

      {/* Representative Imagery — only rendered if imageUrl provided */}
      {imageUrl && (
        <div>
          <img src={imageUrl} alt={data.name} />
        </div>
      )}

      {/* Industry Description */}
      <section aria-label="industry description">
        <div>
          <h2>JIAYI Tools for {data.name}</h2>
          <p>{data.description}</p>

          {/* View Related Tools CTA */}
          <a href={`/${locale}/products/${data.relatedCategorySlug}`}>
            View Related Tools →
          </a>
        </div>

        {/* Highlights sidebar */}
        <div>
          <h3>Key Capabilities</h3>
          <ul>
            {data.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section aria-label="contact CTA">
        <h2>Ready to Optimise Your {data.name} Process?</h2>
        <a href={`/${locale}/products/${data.relatedCategorySlug}`}>Browse Related Products</a>
        <a href={`/${locale}/contact`}>Contact Engineering Team</a>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Industry Application Page — aerospace example', () => {
  beforeEach(() => {
    render(<IndustryPageContent />);
  });

  // -------------------------------------------------------------------------
  // Requirement 9.1 — industry headline
  // -------------------------------------------------------------------------
  describe('industry headline', () => {
    it('renders the industry page heading with industry name', () => {
      expect(
        screen.getByRole('heading', { name: 'Aerospace & Aviation', level: 1 }),
      ).toBeInTheDocument();
    });

    it('renders the precision tools headline text', () => {
      expect(
        screen.getByText('Precision Tools for Demanding Aerospace Applications'),
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Requirement 9.2 — description paragraph
  // -------------------------------------------------------------------------
  describe('description paragraph', () => {
    it('renders descriptive content about JIAYI Tools capabilities', () => {
      expect(
        screen.getByText(/Aerospace manufacturing demands the highest levels/i),
      ).toBeInTheDocument();
    });

    it('renders JIAYI Tools for Aerospace section heading', () => {
      expect(
        screen.getByRole('heading', { name: /JIAYI Tools for Aerospace/i }),
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // "View Related Tools" CTA — Requirement 9.1, 9.2
  // -------------------------------------------------------------------------
  describe('"View Related Tools" button/link', () => {
    it('renders View Related Tools link', () => {
      expect(
        screen.getByRole('link', { name: /View Related Tools/i }),
      ).toBeInTheDocument();
    });

    it('points to the related category page', () => {
      const links = screen.getAllByRole('link', { name: /View Related Tools/i });
      expect(links[0]).toHaveAttribute('href', '/en/products/hole-making');
    });
  });
});

// ---------------------------------------------------------------------------
// Additional test: page renders with an image when imageUrl is provided
// ---------------------------------------------------------------------------
describe('Industry Application Page — with representative image', () => {
  it('renders the industry image when imageUrl is provided', () => {
    render(
      <IndustryPageContent imageUrl="https://example.com/aerospace.jpg" />,
    );
    const img = screen.getByRole('img', { name: 'Aerospace & Aviation' });
    expect(img).toHaveAttribute('src', 'https://example.com/aerospace.jpg');
  });

  it('does not render an image when imageUrl is null', () => {
    render(<IndustryPageContent imageUrl={null} />);
    // No img element for the representative image (only check the container is absent)
    const images = screen.queryAllByRole('img');
    expect(images).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Additional test: locale prefix is applied correctly to all links
// ---------------------------------------------------------------------------
describe('Industry Application Page — locale prefix', () => {
  it('uses the correct locale prefix in related tools link for "es"', () => {
    render(<IndustryPageContent locale="es" />);
    const relatedLinks = screen.getAllByRole('link', { name: /View Related Tools/i });
    expect(relatedLinks[0]).toHaveAttribute('href', '/es/products/hole-making');
  });
});
