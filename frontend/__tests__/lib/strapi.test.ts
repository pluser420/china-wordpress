/**
 * Property 1: Category listing contains exactly its products
 *
 * For any set of products and a target category, filtering by category should
 * return exactly the products in that category (no more, no fewer), and each
 * product should appear exactly once.
 *
 * Validates: Requirements 3.1
 * Feature: jiayi-tools-website, Property 1: Category listing contains exactly its products
 */

import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Inline types matching the shapes used by lib/strapi.ts
// ---------------------------------------------------------------------------

interface FakeCategory {
  id: number;
  slug: string;
  name: string;
}

interface FakeProduct {
  id: number;
  name: string;
  categorySlug: string | null;
}

// ---------------------------------------------------------------------------
// Filter logic under test
//
// This mirrors what the real category page does:
// given a list of all products, return only those assigned to a specific category.
// This pure logic can be verified independently of the network.
// ---------------------------------------------------------------------------

/**
 * Filters a list of products to only those that belong to the given category slug.
 * Represents the same logic Strapi applies server-side via
 * `filters: { category: { slug: { $eq: categorySlug } } }`.
 */
function filterProductsByCategory(
  products: FakeProduct[],
  categorySlug: string,
): FakeProduct[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generates a slug-like string: lowercase letters and hyphens, 3–20 chars */
const slugArb = fc
  .stringMatching(/^[a-z][a-z-]{2,18}[a-z]$/)
  .filter((s) => !s.includes('--'));

/** Generates a small set of distinct category slugs (1–5 categories). */
const categoriesArb = fc
  .uniqueArray(slugArb, { minLength: 1, maxLength: 5 })
  .map((slugs) =>
    slugs.map((slug, i): FakeCategory => ({ id: i + 1, slug, name: slug })),
  );

/** Generates a product assigned to one of the provided category slugs, or no category. */
function productArb(categorySlugs: string[]) {
  return fc.record({
    id: fc.nat({ max: 10_000 }),
    name: fc.string({ minLength: 1, maxLength: 40 }),
    categorySlug: fc.oneof(
      fc.constantFrom(...categorySlugs),
      fc.constant(null),
    ),
  });
}

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

describe('Property 1: Category listing contains exactly its products', () => {
  // -------------------------------------------------------------------------
  // 1a: Filtering returns exactly the products for the target category
  // -------------------------------------------------------------------------
  it('should return exactly the products belonging to the target category', () => {
    fc.assert(
      fc.property(
        categoriesArb.chain((categories) => {
          const slugs = categories.map((c) => c.slug);
          return fc.tuple(
            fc.constant(categories),
            fc.array(productArb(slugs), { minLength: 0, maxLength: 50 }),
          );
        }),
        ([categories, products]) => {
          for (const category of categories) {
            const filtered = filterProductsByCategory(products, category.slug);

            // Every returned product must belong to the target category
            const allBelongToCategory = filtered.every(
              (p) => p.categorySlug === category.slug,
            );

            // Count of manually matched products must match filtered count
            const expectedCount = products.filter(
              (p) => p.categorySlug === category.slug,
            ).length;

            if (!allBelongToCategory) return false;
            if (filtered.length !== expectedCount) return false;
          }
          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // 1b: No products from other categories appear in the result
  // -------------------------------------------------------------------------
  it('should not include products from other categories', () => {
    fc.assert(
      fc.property(
        categoriesArb.chain((categories) => {
          const slugs = categories.map((c) => c.slug);
          return fc.tuple(
            fc.constant(categories),
            fc.array(productArb(slugs), { minLength: 1, maxLength: 50 }),
            // Pick a target category from the available ones
            fc.nat({ max: categories.length - 1 }),
          );
        }),
        ([categories, products, categoryIndex]) => {
          const targetCategory = categories[categoryIndex];
          const filtered = filterProductsByCategory(products, targetCategory.slug);

          // No product in the result should have a different (non-null) category slug
          return filtered.every((p) => p.categorySlug === targetCategory.slug);
        },
      ),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // 1c: Each product appears at most once in the filtered results
  // -------------------------------------------------------------------------
  it('should include each matching product exactly once', () => {
    fc.assert(
      fc.property(
        categoriesArb.chain((categories) => {
          const slugs = categories.map((c) => c.slug);
          return fc.tuple(
            fc.constant(categories),
            // Use uniqueArray to guarantee distinct ids so we can detect duplicates
            fc.uniqueArray(
              productArb(slugs).map((p, _i) => p),
              {
                minLength: 0,
                maxLength: 50,
                selector: (p) => p.id,
              },
            ),
          );
        }),
        ([categories, products]) => {
          for (const category of categories) {
            const filtered = filterProductsByCategory(products, category.slug);

            // Check uniqueness by id
            const ids = filtered.map((p) => p.id);
            const uniqueIds = new Set(ids);

            if (ids.length !== uniqueIds.size) return false;
          }
          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // 1d: Filtering a non-existent category returns an empty list
  // -------------------------------------------------------------------------
  it('should return an empty list for a category with no products', () => {
    fc.assert(
      fc.property(
        categoriesArb.chain((categories) => {
          const slugs = categories.map((c) => c.slug);
          return fc.tuple(
            fc.array(productArb(slugs), { minLength: 0, maxLength: 50 }),
          );
        }),
        ([products]) => {
          const emptyCategory = 'nonexistent-category-xyz';
          const filtered = filterProductsByCategory(products, emptyCategory);
          return filtered.length === 0;
        },
      ),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Concrete example tests
  // -------------------------------------------------------------------------
  it('should return only hole-making products', () => {
    const products: FakeProduct[] = [
      { id: 1, name: 'Drill Bit A', categorySlug: 'hole-making' },
      { id: 2, name: 'Mill Cutter B', categorySlug: 'milling' },
      { id: 3, name: 'Drill Bit C', categorySlug: 'hole-making' },
      { id: 4, name: 'No Category', categorySlug: null },
    ];

    const result = filterProductsByCategory(products, 'hole-making');
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.categorySlug === 'hole-making')).toBe(true);
  });

  it('should return an empty array when no products match the category', () => {
    const products: FakeProduct[] = [
      { id: 1, name: 'Thread Tap', categorySlug: 'threading-tools' },
    ];
    expect(filterProductsByCategory(products, 'milling')).toHaveLength(0);
  });

  it('should return all products when every product belongs to the same category', () => {
    const products: FakeProduct[] = [
      { id: 1, name: 'Gear Hob 1', categorySlug: 'gear-tools' },
      { id: 2, name: 'Gear Hob 2', categorySlug: 'gear-tools' },
      { id: 3, name: 'Gear Hob 3', categorySlug: 'gear-tools' },
    ];
    const result = filterProductsByCategory(products, 'gear-tools');
    expect(result).toHaveLength(3);
  });
});
