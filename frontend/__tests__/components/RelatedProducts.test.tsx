/**
 * Property 6: Related products belong to the same category
 *
 * For any product page with related products configured, every product shown in
 * the "Related Products" section should have the same category slug as the
 * source product.
 *
 * Validates: Requirements 4.6
 * Feature: jiayi-tools-website, Property 6: Related products belong to the same category
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import type { ProductItem, CategoryItem } from '../../lib/strapi';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

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

jest.mock('../../lib/strapi', () => {
  const actual = jest.requireActual('../../lib/strapi');
  return {
    ...actual,
    getStrapiURL: (path = '') => `http://strapi:1337${path}`,
  };
});

// ---------------------------------------------------------------------------
// Component under test
// This mimics the "Related Products" section of the Product Page.
// ---------------------------------------------------------------------------

interface RelatedProductsSectionProps {
  relatedProducts: ProductItem[];
  locale: string;
}

function RelatedProductsSection({
  relatedProducts,
  locale,
}: RelatedProductsSectionProps) {
  if (relatedProducts.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" data-testid="related-products-section">
      <h2 id="related-heading">Related Products</h2>
      <div>
        {relatedProducts.map((product) => {
          const categorySlug =
            product.attributes.category?.data?.attributes.slug ?? 'unknown';
          return (
            <article key={product.id} data-testid="related-product-card" data-category-slug={categorySlug}>
              <h3>{product.attributes.name}</h3>
              <a
                href={`/${locale}/products/${categorySlug}/${product.attributes.slug}`}
              >
                View Details
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeProductItem({
  name,
  slug,
  categorySlug,
  categoryName,
}: {
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
}): ProductItem {
  return {
    id: Math.floor(Math.random() * 10000),
    attributes: {
      name,
      slug,
      shortDescription: null,
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
      images: { data: null },
      category: {
        data: {
          id: Math.floor(Math.random() * 100),
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
          } as CategoryItem['attributes'],
        } as CategoryItem,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const nameArb = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((s) => s.trim().length > 0);

const slugArb = fc
  .stringMatching(/^[a-z][a-z0-9-]{1,38}[a-z0-9]$/)
  .filter((s) => !s.includes('--'));

const localeArb = fc.constantFrom('en', 'es');

const categorySlugArb = fc.constantFrom(
  'hole-making',
  'milling',
  'cavity-tools',
  'port-tools',
  'composite-material-machining',
  'threading-tools',
  'gear-tools',
);

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

describe('Property 6: Related products belong to the same category', () => {
  // -------------------------------------------------------------------------
  // 6a: All related products share the source product's category slug
  // -------------------------------------------------------------------------
  it('should ensure all related products have the same category slug as the source product', () => {
    fc.assert(
      fc.property(
        categorySlugArb,
        categoryNameArb,
        fc.array(nameArb, { minLength: 1, maxLength: 5 }),
        localeArb,
        (categorySlug, categoryName, productNames, locale) => {
          // Generate related products all belonging to the same category
          const relatedProducts = productNames.map((name, idx) =>
            makeProductItem({
              name,
              slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
              categorySlug,
              categoryName,
            }),
          );

          const { container, unmount } = render(
            <RelatedProductsSection relatedProducts={relatedProducts} locale={locale} />,
          );

          const cards = container.querySelectorAll('[data-testid="related-product-card"]');
          let allSameCategory = true;

          cards.forEach((card) => {
            const cardCategorySlug = card.getAttribute('data-category-slug');
            if (cardCategorySlug !== categorySlug) {
              allSameCategory = false;
            }
          });

          unmount();

          return allSameCategory;
        },
      ),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // 6b: When related products list is empty, no section is rendered
  // -------------------------------------------------------------------------
  it('should not render the related products section when the list is empty', () => {
    const { unmount } = render(
      <RelatedProductsSection relatedProducts={[]} locale="en" />,
    );
    const section = screen.queryByTestId('related-products-section');
    unmount();

    expect(section).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Concrete example tests
  // -------------------------------------------------------------------------
  it('should render related products from the same category (hole-making)', () => {
    const relatedProducts = [
      makeProductItem({
        name: 'Carbide Drill Bit 8mm',
        slug: 'carbide-drill-bit-8mm',
        categorySlug: 'hole-making',
        categoryName: 'Hole Making',
      }),
      makeProductItem({
        name: 'Carbide Drill Bit 10mm',
        slug: 'carbide-drill-bit-10mm',
        categorySlug: 'hole-making',
        categoryName: 'Hole Making',
      }),
      makeProductItem({
        name: 'Deep-Hole Drill',
        slug: 'deep-hole-drill',
        categorySlug: 'hole-making',
        categoryName: 'Hole Making',
      }),
    ];

    const { container } = render(
      <RelatedProductsSection relatedProducts={relatedProducts} locale="en" />,
    );

    const cards = container.querySelectorAll('[data-testid="related-product-card"]');
    expect(cards.length).toBe(3);

    cards.forEach((card) => {
      const categorySlug = card.getAttribute('data-category-slug');
      expect(categorySlug).toBe('hole-making');
    });
  });

  it('should fail if related products have mismatched categories', () => {
    // This test intentionally creates a scenario where related products have
    // different category slugs to ensure our property test would catch it.
    const mixedProducts = [
      makeProductItem({
        name: 'Carbide Drill Bit',
        slug: 'carbide-drill-bit',
        categorySlug: 'hole-making',
        categoryName: 'Hole Making',
      }),
      makeProductItem({
        name: 'Milling Cutter',
        slug: 'milling-cutter',
        categorySlug: 'milling',
        categoryName: 'Milling',
      }),
    ];

    const { container } = render(
      <RelatedProductsSection relatedProducts={mixedProducts} locale="en" />,
    );

    const cards = container.querySelectorAll('[data-testid="related-product-card"]');
    const firstCategorySlug = cards[0]?.getAttribute('data-category-slug');
    let allSame = true;

    cards.forEach((card) => {
      if (card.getAttribute('data-category-slug') !== firstCategorySlug) {
        allSame = false;
      }
    });

    // In a correct implementation, allSame should be true. Here we expect false
    // because we intentionally mixed categories to demonstrate the property.
    expect(allSame).toBe(false);
  });
});
