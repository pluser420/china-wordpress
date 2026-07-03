/**
 * Property 2: Product card includes all required fields with valid description length
 *
 * For any product object, the rendered card component should include the product
 * image URL, the product name, a description no longer than 160 characters, and
 * a link matching the pattern `/{locale}/products/{categorySlug}/{productSlug}`.
 *
 * Validates: Requirements 3.2, 4.1
 * Feature: jiayi-tools-website, Property 2: Product card includes all required fields with valid description length
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import ProductCard from '../../components/ProductCard';
import type { ProductItem } from '../../lib/strapi';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/image so it renders as a plain <img> in tests
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
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={src} alt={alt} {...rest} />;
  },
}));

// Mock next/link so it renders as a plain <a> in tests
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

// Mock logger to avoid pino-pretty issues in test environment
jest.mock('../../lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock getStrapiURL to return a predictable base URL
jest.mock('../../lib/strapi', () => {
  const actual = jest.requireActual('../../lib/strapi');
  return {
    ...actual,
    getStrapiURL: (path = '') => `http://strapi:1337${path}`,
  };
});

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/**
 * Builds a minimal ProductItem fixture from a plain object.
 * Only the fields consumed by ProductCard are required here.
 */
function makeProduct({
  name,
  slug,
  shortDescription,
  categorySlug,
  categoryName,
  imageUrl,
}: {
  name: string;
  slug: string;
  shortDescription: string | null;
  categorySlug: string;
  categoryName: string;
  imageUrl: string | null;
}): ProductItem {
  return {
    id: 1,
    attributes: {
      name,
      slug,
      shortDescription,
      subcategory: null,
      fullDescription: null,
      specifications: null,
      coatings: null,
      compatibleMaterials: null,
      seo: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      publishedAt: '2024-01-01T00:00:00.000Z',
      locale: 'en',
      images: imageUrl
        ? {
            data: [
              {
                id: 10,
                attributes: {
                  id: 10,
                  url: imageUrl,
                  name: 'test-image.jpg',
                  alternativeText: name,
                  width: 800,
                  height: 600,
                  mime: 'image/jpeg',
                },
              },
            ],
          }
        : { data: null },
      category: {
        data: {
          id: 2,
          attributes: {
            name: categoryName,
            slug: categorySlug,
            description: null,
            subcategories: null,
            seo: null,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            publishedAt: '2024-01-01T00:00:00.000Z',
            locale: 'en',
          },
        },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Slug-like string: lowercase letters, digits, hyphens, 2–40 chars */
const slugArb = fc
  .stringMatching(/^[a-z][a-z0-9-]{1,38}[a-z0-9]$/)
  .filter((s) => !s.includes('--'));

/** Product name: non-empty printable string, 1–80 chars */
const nameArb = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((s) => s.trim().length > 0);

/** Short description: null or a string up to 300 chars (may exceed 160 — component must clamp) */
const shortDescriptionArb = fc.option(
  fc.string({ minLength: 0, maxLength: 300 }),
  { nil: null },
);

/** Category slug (one of the seven real slugs) */
const categorySlugArb = fc.constantFrom(
  'hole-making',
  'milling',
  'cavity-tools',
  'port-tools',
  'composite-material-machining',
  'threading-tools',
  'gear-tools',
);

/** Locale */
const localeArb = fc.constantFrom('en', 'es');

/** Image URL: null (no image) or a valid-looking URL */
const imageUrlArb = fc.option(
  fc.constantFrom(
    '/uploads/product_a.jpg',
    'http://strapi:1337/uploads/product_b.webp',
    'https://example.com/img/tool.png',
  ),
  { nil: null },
);

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

describe('Property 2: Product card includes all required fields with valid description length', () => {
  // -------------------------------------------------------------------------
  // 2a: Product name is always rendered
  // -------------------------------------------------------------------------
  it('should render the product name', () => {
    fc.assert(
      fc.property(
        nameArb,
        slugArb,
        shortDescriptionArb,
        categorySlugArb,
        nameArb,
        localeArb,
        imageUrlArb,
        (name, slug, description, catSlug, catName, locale, imageUrl) => {
          const product = makeProduct({
            name,
            slug,
            shortDescription: description,
            categorySlug: catSlug,
            categoryName: catName,
            imageUrl,
          });

          const { unmount } = render(<ProductCard product={product} locale={locale} />);
          const heading = screen.getByRole('heading', { level: 3 });
          const rendered = heading.textContent ?? '';
          unmount();

          return rendered.includes(name);
        },
      ),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // 2b: Rendered description is never longer than 160 characters
  // -------------------------------------------------------------------------
  it('should render a description of at most 160 characters', () => {
    fc.assert(
      fc.property(
        nameArb,
        slugArb,
        // Force descriptions longer than 160 chars to test truncation
        fc.string({ minLength: 161, maxLength: 300 }),
        categorySlugArb,
        nameArb,
        localeArb,
        (name, slug, longDescription, catSlug, catName, locale) => {
          const product = makeProduct({
            name,
            slug,
            shortDescription: longDescription,
            categorySlug: catSlug,
            categoryName: catName,
            imageUrl: null,
          });

          const { container, unmount } = render(
            <ProductCard product={product} locale={locale} />,
          );

          // Find the description paragraph — it's a <p> inside the card body
          const paragraphs = container.querySelectorAll('p');
          let descriptionText: string | null = null;
          for (const p of paragraphs) {
            const text = p.textContent ?? '';
            // The description paragraph won't contain the product name
            if (!text.includes(name)) {
              descriptionText = text;
              break;
            }
          }

          unmount();

          // If a description paragraph was found, it must be ≤ 160 chars
          if (descriptionText === null) return true; // no description rendered — acceptable
          return descriptionText.length <= 160;
        },
      ),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // 2c: Link matches pattern `/{locale}/products/{categorySlug}/{productSlug}`
  // -------------------------------------------------------------------------
  it('should render a link matching /{locale}/products/{categorySlug}/{productSlug}', () => {
    fc.assert(
      fc.property(
        nameArb,
        slugArb,
        shortDescriptionArb,
        categorySlugArb,
        nameArb,
        localeArb,
        imageUrlArb,
        (name, productSlug, description, catSlug, catName, locale, imageUrl) => {
          const product = makeProduct({
            name,
            slug: productSlug,
            shortDescription: description,
            categorySlug: catSlug,
            categoryName: catName,
            imageUrl,
          });

          const { unmount } = render(<ProductCard product={product} locale={locale} />);

          // Find the link to the product page
          const links = screen.getAllByRole('link');
          const expectedHref = `/${locale}/products/${catSlug}/${productSlug}`;

          const hasMatchingLink = links.some(
            (link) => link.getAttribute('href') === expectedHref,
          );

          unmount();

          return hasMatchingLink;
        },
      ),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // 2d: Image is rendered when imageUrl is provided
  // -------------------------------------------------------------------------
  it('should render an image when imageUrl is provided', () => {
    fc.assert(
      fc.property(
        nameArb,
        slugArb,
        categorySlugArb,
        nameArb,
        localeArb,
        (name, slug, catSlug, catName, locale) => {
          const product = makeProduct({
            name,
            slug,
            shortDescription: null,
            categorySlug: catSlug,
            categoryName: catName,
            imageUrl: '/uploads/test-product.jpg',
          });

          const { unmount } = render(<ProductCard product={product} locale={locale} />);
          const images = screen.queryAllByRole('img');
          unmount();

          return images.length > 0;
        },
      ),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // Concrete example tests
  // -------------------------------------------------------------------------
  it('should render required fields for a typical hole-making product', () => {
    const product = makeProduct({
      name: 'Carbide Drill Bit 12mm',
      slug: 'carbide-drill-bit-12mm',
      shortDescription: 'High-performance carbide drill bit for precise hole making.',
      categorySlug: 'hole-making',
      categoryName: 'Hole Making',
      imageUrl: '/uploads/carbide-drill.jpg',
    });

    render(<ProductCard product={product} locale="en" />);

    // Product name is rendered
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Carbide Drill Bit 12mm',
    );

    // Link points to the correct URL
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      '/en/products/hole-making/carbide-drill-bit-12mm',
    );

    // Image is rendered
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('should truncate a description longer than 160 characters', () => {
    const longDesc =
      'A'.repeat(200); // 200 chars — must be truncated to 160
    const product = makeProduct({
      name: 'Milling Cutter X',
      slug: 'milling-cutter-x',
      shortDescription: longDesc,
      categorySlug: 'milling',
      categoryName: 'Milling',
      imageUrl: null,
    });

    const { container } = render(<ProductCard product={product} locale="en" />);
    const paragraphs = container.querySelectorAll('p');

    // The description paragraph must not contain more than 160 chars from the original
    let descriptionText: string | null = null;
    for (const p of paragraphs) {
      const text = p.textContent ?? '';
      if (text.startsWith('A')) {
        descriptionText = text;
        break;
      }
    }

    expect(descriptionText).not.toBeNull();
    expect(descriptionText!.length).toBeLessThanOrEqual(160);
  });

  it('should render a Spanish locale link correctly', () => {
    const product = makeProduct({
      name: 'Broca de Carburo',
      slug: 'broca-de-carburo',
      shortDescription: 'Herramienta de precisión para mecanizado.',
      categorySlug: 'hole-making',
      categoryName: 'Fabricación de Agujeros',
      imageUrl: null,
    });

    render(<ProductCard product={product} locale="es" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/es/products/hole-making/broca-de-carburo');
  });
});
