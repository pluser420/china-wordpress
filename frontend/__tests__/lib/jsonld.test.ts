/**
 * Property 12: Product JSON-LD contains all required schema fields
 *
 * For any product object, the buildProductJsonLd function should return a JSON
 * object where @type is "Product", name equals the product name, description is
 * a non-empty string, brand.name equals "JIAYI Tools", image is a non-empty
 * string (URL), and sku equals the product's slug.
 *
 * Validates: Requirements 5.8
 * Feature: jiayi-tools-website, Property 12: Product JSON-LD contains all required schema fields
 */

import * as fc from 'fast-check';
import { buildProductJsonLd } from '../../lib/metadata';

// ---------------------------------------------------------------------------
// Suppress pino logging during tests
// ---------------------------------------------------------------------------
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
// Arbitraries
// ---------------------------------------------------------------------------

const slugArb = fc
  .array(
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')), {
      minLength: 1,
      maxLength: 20,
    }),
    { minLength: 1, maxLength: 4 },
  )
  .map((parts) => parts.join('-'));

const productNameArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

const imageUrlArb = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter((s) => s.trim().length > 0);

const descriptionArb = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter((s) => s.trim().length > 0);

const productInputArb = fc.record({
  name: productNameArb,
  slug: slugArb,
  shortDescription: fc.oneof(descriptionArb, fc.constant(null)),
  imageUrl: fc.oneof(imageUrlArb, fc.constant(null)),
});

// ---------------------------------------------------------------------------
// Property 12: JSON-LD contains all required schema fields
// ---------------------------------------------------------------------------

describe('Property 12: Product JSON-LD contains all required schema fields', () => {
  it('@type should always be "Product"', () => {
    fc.assert(
      fc.property(productInputArb, (product) => {
        const jsonLd = buildProductJsonLd(product);
        return jsonLd['@type'] === 'Product';
      }),
      { numRuns: 100 },
    );
  });

  it('@context should always be "https://schema.org"', () => {
    fc.assert(
      fc.property(productInputArb, (product) => {
        const jsonLd = buildProductJsonLd(product);
        return jsonLd['@context'] === 'https://schema.org';
      }),
      { numRuns: 100 },
    );
  });

  it('name should equal the product name', () => {
    fc.assert(
      fc.property(productInputArb, (product) => {
        const jsonLd = buildProductJsonLd(product);
        return jsonLd.name === product.name;
      }),
      { numRuns: 100 },
    );
  });

  it('description should be a non-empty string', () => {
    fc.assert(
      fc.property(productInputArb, (product) => {
        const jsonLd = buildProductJsonLd(product);
        return typeof jsonLd.description === 'string' && jsonLd.description.trim().length > 0;
      }),
      { numRuns: 100 },
    );
  });

  it('brand.name should equal "JIAYI Tools"', () => {
    fc.assert(
      fc.property(productInputArb, (product) => {
        const jsonLd = buildProductJsonLd(product);
        return jsonLd.brand.name === 'JIAYI Tools';
      }),
      { numRuns: 100 },
    );
  });

  it('sku should equal the product slug', () => {
    fc.assert(
      fc.property(productInputArb, (product) => {
        const jsonLd = buildProductJsonLd(product);
        return jsonLd.sku === product.slug;
      }),
      { numRuns: 100 },
    );
  });

  it('image should be a string (URL)', () => {
    fc.assert(
      fc.property(productInputArb, (product) => {
        const jsonLd = buildProductJsonLd(product);
        return typeof jsonLd.image === 'string';
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Concrete example tests
  // -------------------------------------------------------------------------
  it('should build a complete JSON-LD object for a product with all fields', () => {
    const product = {
      name: 'Carbide Drill Bit 12mm',
      slug: 'carbide-drill-bit-12mm',
      shortDescription: 'High precision carbide drill bit for aerospace applications.',
      imageUrl: 'https://jiayitools.com/uploads/drill_bit.jpg',
    };

    const jsonLd = buildProductJsonLd(product);

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('Product');
    expect(jsonLd.name).toBe('Carbide Drill Bit 12mm');
    expect(jsonLd.description).toBe(
      'High precision carbide drill bit for aerospace applications.',
    );
    expect(jsonLd.brand).toEqual({ '@type': 'Brand', name: 'JIAYI Tools' });
    expect(jsonLd.image).toBe('https://jiayitools.com/uploads/drill_bit.jpg');
    expect(jsonLd.sku).toBe('carbide-drill-bit-12mm');
  });

  it('should fall back to the product name in description when shortDescription is null', () => {
    const product = {
      name: 'Gear Hob Cutter',
      slug: 'gear-hob-cutter',
      shortDescription: null,
      imageUrl: null,
    };

    const jsonLd = buildProductJsonLd(product);

    expect(jsonLd.description).toContain('Gear Hob Cutter');
    expect(jsonLd.description.length).toBeGreaterThan(0);
  });
});
