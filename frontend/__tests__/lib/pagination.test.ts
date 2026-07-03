/**
 * Property 3: Pagination never exceeds 24 items per page
 *
 * For any list of N products, the paginated listing for any single page should
 * contain at most 24 products; and the total number of pages should equal
 * ceil(N / 24).
 *
 * Validates: Requirements 3.3
 * Feature: jiayi-tools-website, Property 3: Pagination never exceeds 24 items per page
 */

import * as fc from 'fast-check';
import { paginateList } from '../../lib/pagination';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** An array of up to 200 arbitrary strings (stand-ins for product objects). */
const itemListArb = fc.array(fc.string(), { minLength: 0, maxLength: 200 });

/** A page number between 1 and 100 (well beyond realistic totals). */
const pageArb = fc.integer({ min: 1, max: 100 });

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

describe('Property 3: Pagination never exceeds 24 items per page', () => {
  // -------------------------------------------------------------------------
  // 3a: Page items never exceed 24
  // -------------------------------------------------------------------------
  it('should return at most 24 items for any page', () => {
    fc.assert(
      fc.property(itemListArb, pageArb, (items, page) => {
        const result = paginateList(items, page);
        return result.items.length <= 24;
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // 3b: totalPages equals ceil(N / 24) for N > 0, or 1 for N == 0
  // -------------------------------------------------------------------------
  it('should set totalPages to ceil(N / 24)', () => {
    fc.assert(
      fc.property(itemListArb, (items) => {
        const result = paginateList(items, 1);
        const expected = items.length === 0 ? 1 : Math.ceil(items.length / 24);
        return result.totalPages === expected;
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // 3c: Returned currentPage is clamped between 1 and totalPages
  // -------------------------------------------------------------------------
  it('should clamp currentPage to [1, totalPages]', () => {
    fc.assert(
      fc.property(itemListArb, pageArb, (items, page) => {
        const result = paginateList(items, page);
        return result.currentPage >= 1 && result.currentPage <= result.totalPages;
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // 3d: Custom pageSize is respected (at most pageSize items per page)
  // -------------------------------------------------------------------------
  it('should respect a custom pageSize', () => {
    const pageSizeArb = fc.integer({ min: 1, max: 50 });
    fc.assert(
      fc.property(itemListArb, pageArb, pageSizeArb, (items, page, pageSize) => {
        const result = paginateList(items, page, pageSize);
        return result.items.length <= pageSize;
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // 3e: totalPages with custom pageSize equals ceil(N / pageSize)
  // -------------------------------------------------------------------------
  it('should calculate totalPages correctly for any pageSize', () => {
    const pageSizeArb = fc.integer({ min: 1, max: 50 });
    fc.assert(
      fc.property(itemListArb, pageSizeArb, (items, pageSize) => {
        const result = paginateList(items, 1, pageSize);
        const expected =
          items.length === 0 ? 1 : Math.ceil(items.length / pageSize);
        return result.totalPages === expected;
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Concrete example tests
  // -------------------------------------------------------------------------
  it('should return all items on page 1 when fewer than 24 exist', () => {
    const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);
    const result = paginateList(items, 1);
    expect(result.items).toHaveLength(10);
    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(1);
  });

  it('should return exactly 24 items on the first page when list has 48 items', () => {
    const items = Array.from({ length: 48 }, (_, i) => `item-${i}`);
    const result = paginateList(items, 1);
    expect(result.items).toHaveLength(24);
    expect(result.totalPages).toBe(2);
  });

  it('should return remaining items on the last page', () => {
    const items = Array.from({ length: 25 }, (_, i) => `item-${i}`);
    const result = paginateList(items, 2);
    expect(result.items).toHaveLength(1);
    expect(result.totalPages).toBe(2);
    expect(result.currentPage).toBe(2);
  });

  it('should return 1 totalPage for an empty list', () => {
    const result = paginateList([], 1);
    expect(result.totalPages).toBe(1);
    expect(result.items).toHaveLength(0);
  });

  it('should clamp out-of-range page to the last page', () => {
    const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);
    const result = paginateList(items, 99);
    expect(result.currentPage).toBe(1);
  });
});
