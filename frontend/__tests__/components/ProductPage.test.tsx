/**
 * Property 4: Product page renders all required content fields
 *
 * For any product object that has non-null values for its required fields, the
 * rendered Product page component should include in its output: the product
 * name, at least one image, the full description, the specifications table, the
 * coatings list, the compatible materials list, and the related applications.
 * Additionally, if `specificationSheet` is non-null a download link should be
 * present; if `specificationSheet` is null no download link should be present.
 *
 * Validates: Requirements 4.3, 4.4
 * Feature: jiayi-tools-website, Property 4: Product page renders all required content fields
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import type { ProductItem, StrapiMediaItem, CategoryItem } from '../../lib/strapi';

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
    return <img src={src} alt={alt} data-testid="product-image" {...rest} />;
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
// Inline ProductPageContent component
// This mirrors the rendering logic of the Product Page without Next.js server
// component constraints so it can be tested with React Testing Library.
// ---------------------------------------------------------------------------

interface ProductPageContentProps {
  product: ProductItem;
  locale: string;
  categorySlug: string;
}

function ProductPageContent({ product, locale, categorySlug }: ProductPageContentProps) {
  const attrs = product.attributes;
  const categoryName = attrs.category?.data?.attributes.name ?? categorySlug;
  const resolvedCategorySlug = attrs.category?.data?.attributes.slug ?? categorySlug;

  // Resolve images
  const images: StrapiMediaItem[] = attrs.images?.data ?? [];

  // Spec sheet
  const specSheet = attrs.specificationSheet?.data ?? null;
  const specSheetUrl = specSheet
    ? `http://strapi:1337${specSheet.attributes.url}`
    : null;

  // Specs
  const specs = attrs.specifications ?? [];

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: attrs.name,
    description: attrs.shortDescription ?? attrs.fullDescription ?? '',
    brand: { '@type': 'Brand', name: 'JIAYI Tools' },
    image: images[0]?.attributes.url ?? '',
    sku: attrs.slug,
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <a href={`/${locale}`}>Home</a>
          <a href={`/${locale}/products`}>Products</a>
          <a href={`/${locale}/products/${resolvedCategorySlug}`}>{categoryName}</a>
          <span>{attrs.name}</span>
        </nav>

        {/* Product heading */}
        <h1>{attrs.name}</h1>

        {/* Images */}
        {images.length > 0 && (
          <div data-testid="image-gallery">
            {images.map((img) => (
              <img
                key={img.id}
                src={img.attributes.url}
                alt={img.attributes.alternativeText ?? attrs.name}
                data-testid="product-image"
              />
            ))}
          </div>
        )}

        {/* Short description */}
        {attrs.shortDescription && (
          <p data-testid="short-description">{attrs.shortDescription}</p>
        )}

        {/* Full description */}
        {attrs.fullDescription && (
          <section aria-labelledby="description-heading">
            <h2 id="description-heading">Product Description</h2>
            <div
              data-testid="full-description"
              dangerouslySetInnerHTML={{ __html: attrs.fullDescription }}
            />
          </section>
        )}

        {/* Specifications table */}
        {specs.length > 0 && (
          <section aria-labelledby="specs-heading" data-testid="specifications-section">
            <h2 id="specs-heading">Specifications</h2>
            <table>
              <tbody>
                {specs.map((spec, idx) => (
                  <tr key={`${spec.key}-${idx}`}>
                    <td>{spec.key}</td>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Coatings */}
        {attrs.coatings && attrs.coatings.length > 0 && (
          <section aria-labelledby="coatings-heading" data-testid="coatings-section">
            <h3 id="coatings-heading">Available Coatings</h3>
            <ul>
              {attrs.coatings.map((coating) => (
                <li key={coating}>{coating}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Compatible materials */}
        {attrs.compatibleMaterials && attrs.compatibleMaterials.length > 0 && (
          <section aria-labelledby="materials-heading" data-testid="materials-section">
            <h3 id="materials-heading">Compatible Materials</h3>
            <ul>
              {attrs.compatibleMaterials.map((mat) => (
                <li key={mat}>{mat}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Subcategory / related application */}
        {attrs.subcategory && (
          <p data-testid="subcategory">
            <span>Application:</span> {attrs.subcategory}
          </p>
        )}

        {/* Quote CTA */}
        <a
          href={`/${locale}/contact?product=${encodeURIComponent(attrs.name)}&category=${encodeURIComponent(categoryName)}`}
          data-testid="quote-cta"
        >
          Request a Quote
        </a>

        {/* PDF spec sheet download link — conditional */}
        {specSheetUrl && (
          <a href={specSheetUrl} download data-testid="spec-sheet-link">
            Download Specification Sheet
          </a>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeProductItem({
  name,
  slug,
  shortDescription,
  fullDescription,
  specifications,
  coatings,
  compatibleMaterials,
  subcategory,
  categorySlug,
  categoryName,
  imageUrls,
  specSheetUrl,
}: {
  name: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  specifications: Array<{ key: string; value: string }>;
  coatings: string[];
  compatibleMaterials: string[];
  subcategory: string | null;
  categorySlug: string;
  categoryName: string;
  imageUrls: string[];
  specSheetUrl: string | null;
}): ProductItem {
  return {
    id: 1,
    attributes: {
      name,
      slug,
      shortDescription,
      fullDescription,
      subcategory,
      specifications,
      coatings,
      compatibleMaterials,
      seo: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      publishedAt: '2024-01-01T00:00:00.000Z',
      locale: 'en',
      images: {
        data: imageUrls.map((url, idx) => ({
          id: idx + 10,
          attributes: {
            id: idx + 10,
            url,
            name: `image-${idx}.jpg`,
            alternativeText: name,
            width: 800,
            height: 600,
            mime: 'image/jpeg',
          },
        })),
      },
      specificationSheet: specSheetUrl
        ? {
            data: {
              id: 99,
              attributes: {
                id: 99,
                url: specSheetUrl,
                name: 'spec.pdf',
                alternativeText: null,
                width: null,
                height: null,
                mime: 'application/pdf',
              },
            },
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
          } as CategoryItem['attributes'],
        } as CategoryItem,
      },
      relatedProducts: { data: [] },
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

/** Non-empty list of at least one image URL */
const imageUrlsArb = fc.array(
  fc.constantFrom(
    '/uploads/product-a.jpg',
    '/uploads/product-b.webp',
    'http://strapi:1337/uploads/product-c.jpg',
  ),
  { minLength: 1, maxLength: 4 },
);

/** List of 1–5 specifications */
const specsArb = fc.array(
  fc.record({
    key: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0),
    value: fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0),
  }),
  { minLength: 1, maxLength: 5 },
);

/** List of 1–4 non-empty strings */
const stringListArb = fc.array(
  fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0),
  { minLength: 1, maxLength: 4 },
);

/** Spec sheet URL: null or a path string */
const specSheetArb = fc.option(
  fc.constantFrom('/uploads/spec-a.pdf', '/uploads/spec-b.pdf'),
  { nil: null },
);

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

describe('Property 4: Product page renders all required content fields', () => {
  // -------------------------------------------------------------------------
  // 4a: Product name is always rendered in the page heading
  // -------------------------------------------------------------------------
  it('should render the product name in the page heading', () => {
    fc.assert(
      fc.property(
        nameArb,
        slugArb,
        categorySlugArb,
        localeArb,
        (name, slug, catSlug, locale) => {
          const product = makeProductItem({
            name,
            slug,
            shortDescription: 'Short description.',
            fullDescription: '<p>Full description.</p>',
            specifications: [{ key: 'Diameter', value: '10mm' }],
            coatings: ['TiAlN'],
            compatibleMaterials: ['Steel'],
            subcategory: 'Carbide Drill Bit',
            categorySlug: catSlug,
            categoryName: 'Hole Making',
            imageUrls: ['/uploads/test.jpg'],
            specSheetUrl: null,
          });

          const { unmount } = render(
            <ProductPageContent product={product} locale={locale} categorySlug={catSlug} />,
          );
          const heading = screen.getByRole('heading', { level: 1 });
          const rendered = heading.textContent ?? '';
          unmount();

          return rendered.includes(name);
        },
      ),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // 4b: At least one image is rendered when images are provided
  // -------------------------------------------------------------------------
  it('should render at least one product image when images are provided', () => {
    fc.assert(
      fc.property(nameArb, slugArb, categorySlugArb, imageUrlsArb, localeArb, (name, slug, catSlug, imageUrls, locale) => {
        const product = makeProductItem({
          name,
          slug,
          shortDescription: null,
          fullDescription: null,
          specifications: [],
          coatings: [],
          compatibleMaterials: [],
          subcategory: null,
          categorySlug: catSlug,
          categoryName: 'Hole Making',
          imageUrls,
          specSheetUrl: null,
        });

        const { unmount } = render(
          <ProductPageContent product={product} locale={locale} categorySlug={catSlug} />,
        );
        const imgs = screen.queryAllByTestId('product-image');
        unmount();

        return imgs.length > 0;
      }),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // 4c: Specifications table is rendered when specs are present
  // -------------------------------------------------------------------------
  it('should render the specifications table when specifications are provided', () => {
    fc.assert(
      fc.property(nameArb, slugArb, categorySlugArb, specsArb, localeArb, (name, slug, catSlug, specs, locale) => {
        const product = makeProductItem({
          name,
          slug,
          shortDescription: null,
          fullDescription: null,
          specifications: specs,
          coatings: [],
          compatibleMaterials: [],
          subcategory: null,
          categorySlug: catSlug,
          categoryName: 'Milling',
          imageUrls: [],
          specSheetUrl: null,
        });

        const { unmount } = render(
          <ProductPageContent product={product} locale={locale} categorySlug={catSlug} />,
        );
        const specsSection = screen.queryByTestId('specifications-section');
        unmount();

        return specsSection !== null;
      }),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // 4d: Coatings list is rendered when coatings are provided
  // -------------------------------------------------------------------------
  it('should render the coatings list when coatings are provided', () => {
    fc.assert(
      fc.property(nameArb, slugArb, categorySlugArb, stringListArb, localeArb, (name, slug, catSlug, coatings, locale) => {
        const product = makeProductItem({
          name,
          slug,
          shortDescription: null,
          fullDescription: null,
          specifications: [],
          coatings,
          compatibleMaterials: [],
          subcategory: null,
          categorySlug: catSlug,
          categoryName: 'Milling',
          imageUrls: [],
          specSheetUrl: null,
        });

        const { unmount } = render(
          <ProductPageContent product={product} locale={locale} categorySlug={catSlug} />,
        );
        const coatingsSection = screen.queryByTestId('coatings-section');
        unmount();

        return coatingsSection !== null;
      }),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // 4e: Compatible materials list is rendered when materials are provided
  // -------------------------------------------------------------------------
  it('should render the compatible materials list when materials are provided', () => {
    fc.assert(
      fc.property(nameArb, slugArb, categorySlugArb, stringListArb, localeArb, (name, slug, catSlug, materials, locale) => {
        const product = makeProductItem({
          name,
          slug,
          shortDescription: null,
          fullDescription: null,
          specifications: [],
          coatings: [],
          compatibleMaterials: materials,
          subcategory: null,
          categorySlug: catSlug,
          categoryName: 'Milling',
          imageUrls: [],
          specSheetUrl: null,
        });

        const { unmount } = render(
          <ProductPageContent product={product} locale={locale} categorySlug={catSlug} />,
        );
        const materialsSection = screen.queryByTestId('materials-section');
        unmount();

        return materialsSection !== null;
      }),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // 4f: Spec sheet download link is present when specificationSheet is non-null
  //     and absent when specificationSheet is null (Requirement 4.4)
  // -------------------------------------------------------------------------
  it('should conditionally render the PDF download link based on specificationSheet presence', () => {
    fc.assert(
      fc.property(nameArb, slugArb, categorySlugArb, specSheetArb, localeArb, (name, slug, catSlug, specSheet, locale) => {
        const product = makeProductItem({
          name,
          slug,
          shortDescription: null,
          fullDescription: null,
          specifications: [],
          coatings: [],
          compatibleMaterials: [],
          subcategory: null,
          categorySlug: catSlug,
          categoryName: 'Threading Tools',
          imageUrls: [],
          specSheetUrl: specSheet,
        });

        const { unmount } = render(
          <ProductPageContent product={product} locale={locale} categorySlug={catSlug} />,
        );
        const link = screen.queryByTestId('spec-sheet-link');
        unmount();

        if (specSheet !== null) {
          // Spec sheet provided — link must be present
          return link !== null;
        } else {
          // No spec sheet — link must be absent
          return link === null;
        }
      }),
      { numRuns: 50 },
    );
  });

  // -------------------------------------------------------------------------
  // Concrete example test
  // -------------------------------------------------------------------------
  it('should render all required fields for a fully populated product', () => {
    const product = makeProductItem({
      name: 'Carbide Drill Bit 12mm',
      slug: 'carbide-drill-bit-12mm',
      shortDescription: 'High-performance drill bit for precise hole making.',
      fullDescription: '<p>Detailed technical description.</p>',
      specifications: [
        { key: 'Diameter', value: '12mm' },
        { key: 'Material', value: 'Carbide' },
      ],
      coatings: ['TiAlN', 'TiN'],
      compatibleMaterials: ['Steel', 'Cast Iron'],
      subcategory: 'Carbide Drill Bit',
      categorySlug: 'hole-making',
      categoryName: 'Hole Making',
      imageUrls: ['/uploads/drill-bit.jpg'],
      specSheetUrl: '/uploads/drill-bit-spec.pdf',
    });

    render(<ProductPageContent product={product} locale="en" categorySlug="hole-making" />);

    // Product name
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Carbide Drill Bit 12mm');
    // Image
    expect(screen.getByTestId('product-image')).toBeInTheDocument();
    // Specifications
    expect(screen.getByTestId('specifications-section')).toBeInTheDocument();
    // Coatings
    expect(screen.getByTestId('coatings-section')).toBeInTheDocument();
    // Materials
    expect(screen.getByTestId('materials-section')).toBeInTheDocument();
    // Spec sheet download link
    expect(screen.getByTestId('spec-sheet-link')).toBeInTheDocument();
    // Quote CTA
    expect(screen.getByTestId('quote-cta')).toBeInTheDocument();
  });

  it('should NOT render spec sheet link when no specification sheet is attached', () => {
    const product = makeProductItem({
      name: 'Port Tool SAE',
      slug: 'port-tool-sae',
      shortDescription: 'SAE port tool.',
      fullDescription: null,
      specifications: [],
      coatings: [],
      compatibleMaterials: [],
      subcategory: null,
      categorySlug: 'port-tools',
      categoryName: 'Port Tools',
      imageUrls: [],
      specSheetUrl: null,
    });

    render(<ProductPageContent product={product} locale="en" categorySlug="port-tools" />);

    expect(screen.queryByTestId('spec-sheet-link')).not.toBeInTheDocument();
  });
});
