/**
 * Pagination helpers for JIAYI Tools product listings.
 *
 * Provides a pure utility function for slicing an in-memory list into pages.
 * Strapi-side pagination is handled separately via `getProducts(locale, slug, page)`.
 */

export interface PaginationResult<T> {
  /** The items on the requested page (may be fewer than pageSize on the last page). */
  items: T[];
  /** Total number of pages for the given list size and page size. */
  totalPages: number;
  /** The current (1-based) page number, clamped to [1, totalPages]. */
  currentPage: number;
}

/**
 * Slices an array into a single page of results.
 *
 * @param items    - The full list of items to paginate.
 * @param page     - 1-based page number. Values < 1 are treated as 1.
 * @param pageSize - Number of items per page (default 24, must be >= 1).
 * @returns        A `PaginationResult<T>` with the items for the requested page.
 *
 * @example
 * const result = paginateList(products, 2, 24);
 * // result.items  → products[24..47]
 * // result.totalPages → Math.ceil(products.length / 24)
 * // result.currentPage → 2
 */
export function paginateList<T>(
  items: T[],
  page: number,
  pageSize = 24,
): PaginationResult<T> {
  // Guard: pageSize must be at least 1
  const safePageSize = Math.max(1, Math.floor(pageSize));

  // Total pages: at least 1 (even for an empty list)
  const totalPages = Math.ceil(items.length / safePageSize) || 1;

  // Clamp the requested page to [1, totalPages]
  const currentPage = Math.min(Math.max(1, Math.floor(page)), totalPages);

  const start = (currentPage - 1) * safePageSize;
  const end = start + safePageSize;

  return {
    items: items.slice(start, end),
    totalPages,
    currentPage,
  };
}
